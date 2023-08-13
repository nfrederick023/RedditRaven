import {
  BluJayTheme,
  PixivDetails,
  PixivTag,
  Post,
  Subreddit,
  SuggestedImages,
  SuggestedImagesReq,
  Tags,
} from "@client/utils/types";
import React, { FC, useEffect, useRef, useState } from "react";
import Select from "@client/components/common/shared/select";
import SubredditsSearch from "@client/components/common/subreddits-search/subreddits-search";
import TextField from "@client/components/common/shared/text-field";
import styled from "styled-components";

const DashboardContent = styled.div`
  text-align: left;
`;

const Button = styled.div`
  border: 1px solid ${(p): string => p.theme.textContrast};
  border-radius: 5px;
  padding: 6px;
  padding-top: 5px;
  max-height: 32px;

  transition: all 0.1s ease-in;
  user-select: none;

  color: ${(p): string => p.theme.textContrast};

  &:hover {
    cursor: pointer;
    border-color: ${(p): string => p.theme.text};
    color: ${(p): string => p.theme.text};
  }
`;

const Icon = styled.div`
  border: 1px solid ${(p): string => p.theme.textContrast};
  border-radius: 5px;
  padding: 6px;
  transition: all 0.1s ease-in;
  user-select: none;
  display: inline-block;

  color: ${(p): string => p.theme.textContrast};

  &:hover {
    cursor: pointer;
    border-color: ${(p): string => p.theme.text};
    color: ${(p): string => p.theme.text};
  }
`;

const ImagePreviewWrapper = styled.div`
  display: flex;
  margin-bottom: 15px;
  justify-content: center;
`;

const DetailsWrapper = styled.div`
  display: flex;
  > div {
    margin-right: 5px;
    align-self: center;
    display: flex;
    white-space: pre;
  }
`;

const DetailsWrapperBottom = styled(DetailsWrapper)`
  margin-bottom: 15px;
`;

const DetailsTitle = styled.div`
  width: 40%;
  > div {
    width: 100%;
  }
`;

const DetailsFlair = styled.div`
  width: 20%;
  > div {
    width: 100%;
  }
`;

const DetailsCrosspost = styled.div`
  width: 34%;
  > div {
    width: 100%;
  }
`;

const DetailsR18 = styled.div`
  width: 3%;
  > div {
    width: 100%;
  }
`;

const DetailsComment = styled.div`
  width: 3%;
`;

const DetailsSubreddit = styled.div`
  width: 25%;
  overflow: hidden;
`;

const DetailsPixivTag = styled.div`
  width: 25%;
  overflow: hidden;
`;

const DetailsLink = styled.div`
  width: 50%;
  > div {
    width: 100%;
  }
`;

const ButtonBase = styled.div`
  margin: 8px 5px 0px 0px;
`;

const CreditButtons = styled(ButtonBase)``;

const GreyText = styled.div`
  color: ${(p): string => p.theme.textContrast};
`;

const NoSearchResults = styled.div`
  padding: 6px 0px 6px 0px;
  color: ${(p): string => p.theme.textContrast};
`;

const ImagePreview = styled.img`
  object-fit: cover;
  max-width: 24%;
  border-radius: 15px;
  margin-right: 5px;
  margin-left: 5px;
  min-height: 450px;
  max-height: 450px;
  cursor: pointer;

  ${(p: { theme: BluJayTheme; isSelected: boolean }): string =>
    p.isSelected
      ? `border: 2px ${p.theme.text} solid; box-shadow: 0 0 25px ${p.theme.text};`
      : `border: 2px ${p.theme.background} solid; `};
`;
// ${(p: {isSelected: boolean}): string => }
const Checkbox = styled.input`
  vertical-align: text-bottom;
  accent-color: ${(p): string => p.theme.highlightDark};
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  user-select: none;
`;

const CurentPageWrapper = styled(DetailsWrapper)`
  margin-left: auto;
`;

const getSuggestedImages = async (suggestedImagesReq: SuggestedImagesReq): Promise<SuggestedImages | undefined> => {
  const response = await fetch("/api/suggestedImages", {
    method: "POST",
    body: JSON.stringify(suggestedImagesReq),
  });
  if (response.ok) {
    return (await response.json()) as SuggestedImages;
  }
};

const getImage = async (link: string): Promise<Response> => {
  const response = await fetch("/api/loadImage", {
    method: "POST",
    body: JSON.stringify({ link }),
  });
  return response;
};

const createRedditPost = async (posts: Post[]): Promise<Response> => {
  const response = await fetch("/api/createPost", {
    method: "POST",
    body: JSON.stringify({ posts }),
  });
  return response;
};

const tagOptions: Tags[] = ["Spoiler", "NSFW", "OC"];
const resultsPerPageOptions = ["5", "10", "20", "50", "100"];
interface IndexPageProps {
  subreddits: Subreddit[];
}

const IndexPage: FC<IndexPageProps> = ({ subreddits }: IndexPageProps) => {
  const [paginatedResults, setPaginatedResults] = useState<Subreddit[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [token, setToken] = useState("");
  const isInitialMount = useRef(true);

  const createPosts = async (): Promise<void> => {
    const slice = 0;

    const newPosts = await Promise.all(
      paginatedResults.map(async (subreddit) => {
        let suggestedImages: PixivDetails[] = [];

        if (subreddit.defaults.pixivTag) {
          suggestedImages = await retrieveSuggestedImages(subreddit.defaults.pixivTag, subreddit.currentPage, slice);
        }

        return {
          subreddit: subreddit,
          selectedImage: undefined,
          flair: subreddit.defaults.flair,
          isNSFW: false,
          usesDefaultComment: true,
          comment: "",
          title: subreddit.defaults.title,
          suggestedImages,
          slice,
        };
      })
    );
    setPosts(newPosts);
  };

  const retrieveSuggestedImages = async (pixivTag: PixivTag, page: string, slice: number): Promise<PixivDetails[]> => {
    const body: SuggestedImagesReq = {
      pixivTag,
      page,
      slice,
      token,
      count: 5,
    };
    const suggestedImages = (await getSuggestedImages(body))?.suggestedImages ?? [];

    const promises = await Promise.all(
      suggestedImages.map(async (image, i) => {
        return { link: await loadPixivImage(image.smallImageLink), index: i };
      })
    );
    promises.forEach((promise) => {
      suggestedImages[promise.index].imageBlob = promise.link;
    });

    return suggestedImages;
  };

  const getNewSlice = async (postToUpdate: Post, slice: number): Promise<void> => {
    if (postToUpdate.subreddit.defaults.pixivTag) {
      setPosts(
        posts.map((post) => {
          if (post.subreddit.name === postToUpdate.subreddit.name) {
            post.slice = slice;
          }
          return post;
        })
      );
    }
  };

  const increaseSlice = (post: Post) => (): void => {
    if (post.slice + 1 * 3 <= 60) getNewSlice(post, post.slice + 1);
  };

  const decreaseSlice = (post: Post) => (): void => {
    if (post.slice - 1 >= 0) getNewSlice(post, post.slice - 1);
  };

  const handlePixivTokenChange = (token: string): void => {
    setToken(token);
  };

  const handleFlairChange = (subreddit: Subreddit) => {
    return (flairName: string): void => {
      const flair = subreddit.info.flairs.find((flair) => flair.name === flairName);
      setPosts(
        posts.map((post) => {
          if (post.subreddit === subreddit) post.flair = flair ? flair : null;
          return post;
        })
      );
    };
  };

  const handleTitleChange = (subreddit: Subreddit) => {
    return (title: string): void => {
      setPosts(
        posts.map((post) => {
          if (post.subreddit === subreddit) post.title = title;
          return post;
        })
      );
    };
  };

  const handleNSFWChange = (subreddit: Subreddit) => (): void => {
    setPosts(
      posts.map((post) => {
        if (post.subreddit === subreddit) post.isNSFW = !post.isNSFW;
        return post;
      })
    );
  };

  const handleImageChange = (subreddit: Subreddit, image: PixivDetails) => (): void => {
    const parsedArtistName = image.artist.split("@")[0];
    const title = subreddit.defaults.title + " (by " + parsedArtistName + ")";
    setPosts(
      posts.map((post) => {
        if (post.subreddit === subreddit) {
          post.selectedImage = image;
          post.title = title;
        }
        return post;
      })
    );
  };

  const handleLinkChange = (subreddit: Subreddit) => {
    return async (newLink: string): Promise<void> => {
      setPosts(
        posts.map((post) => {
          if (post.subreddit === subreddit)
            post.selectedImage = post.suggestedImages.find((image) => image.imageLink === newLink);
          return post;
        })
      );
    };
  };

  const handleTagChange = (subreddit: Subreddit) => {
    return (tags: string[]): void => {
      setPosts(
        posts.map((post) => {
          return post;
        })
      );
    };
  };

  const handlePageChange = (subreddit: Subreddit): ((newPage: string) => void) => {
    const newPosts = [...posts];
    const postIndex = newPosts.findIndex((post) => post.subreddit.name === subreddit.name);

    return (newPage: string) => {
      newPosts[postIndex] = { ...newPosts[postIndex], subreddit: { ...subreddit, currentPage: newPage } };
      setPosts(newPosts);
    };
  };

  const updatePage = (newValue: string, subreddit: Subreddit): void => {
    const newPosts = [...posts];
    const postIndex = newPosts.findIndex((post) => post.subreddit.name === subreddit.name);
    newPosts[postIndex] = { ...newPosts[postIndex], subreddit: { ...subreddit, currentPage: newValue } };
    setPosts(newPosts);
  };

  const minusPage = (post: Post) => (): void => {
    const newPage = Number(post.subreddit.currentPage) - 1 + "";
    goToPage(post, newPage)();
  };

  const plusPage = (post: Post) => (): void => {
    const newPage = Number(post.subreddit.currentPage) + 1 + "";
    goToPage(post, newPage)();
  };

  const goToPage = (post: Post, page: string) => async (): Promise<void> => {
    if (post.subreddit.defaults.pixivTag) {
      const suggestedImages = await retrieveSuggestedImages(post.subreddit.defaults.pixivTag, page, post.slice);

      setPosts(
        posts.map((_post) => {
          if (_post.subreddit.name === post.subreddit.name) {
            _post.suggestedImages = suggestedImages;
            _post.subreddit = { ..._post.subreddit, currentPage: page };
          }
          return _post;
        })
      );
      getNewSlice(post, 0);
    }
  };

  const loadPixivImage = async (link: string): Promise<string> => {
    const image = await getImage(link);
    const blob = await image.blob();
    return URL.createObjectURL(blob);
  };

  const viewNote = (subreddit: Subreddit) => (): void => {
    alert(subreddit.notes);
  };

  const handleTokenSubmit = (): void => {
    setPosts([]);
    setPaginatedResults([...paginatedResults]);
  };

  const createPost = async (): Promise<void> => {
    const compiledPosts: Post[] = [];
    posts.forEach((post) => {
      if (post.selectedImage) {
        if (post.usesDefaultComment) post.comment = `[Source](${post.selectedImage.pixivLink})`;
        compiledPosts.push(post);
      }
    });

    if (!compiledPosts.length) {
      alert("There are no posts with selected images.");
      return;
    }

    // check all required fields
    for (const post of compiledPosts) {
      if (!post.title) {
        alert(`Subreddit: ${post.subreddit.name} is missing a title!`);
        return;
      }

      if (!post.flair && post.subreddit.info.flairs.length) {
        const notAllFlairsSelectedConfirmation = !confirm(
          "Not all flairs are selected. Are you sure you wish to continue?"
        );
        if (notAllFlairsSelectedConfirmation) return;
      }
    }

    const res = await createRedditPost(compiledPosts);

    if (res.ok) {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (isInitialMount.current) isInitialMount.current = false;
    else createPosts();
  }, [paginatedResults]);

  return (
    <>
      <h1>POST</h1>
      <DashboardContent>
        <hr />
        <DetailsWrapperBottom>
          <TextField onChange={handlePixivTokenChange} value={token} placeholder="Pixiv Token" />
          <Button onClick={handleTokenSubmit}>Submit</Button>
        </DetailsWrapperBottom>
        <SubredditsSearch
          paginatedResults={paginatedResults}
          setPaginatedResults={setPaginatedResults}
          subreddits={subreddits}
          resultsPerPageOptions={resultsPerPageOptions}
          intialResultsPerPage={resultsPerPageOptions[1]}
          showAll
          hideWithouCategory
        />
        {posts.length ? (
          <>
            {posts.map((post, i) => {
              return (
                <div key={i}>
                  {post.subreddit.defaults.pixivTag ? (
                    <div>
                      <hr />
                      <DetailsWrapper>
                        <DetailsSubreddit>
                          <h4>Subreddit</h4>
                        </DetailsSubreddit>
                        <DetailsPixivTag>
                          <h4>Pixiv Tag</h4>
                        </DetailsPixivTag>
                        <DetailsLink>
                          <h4>Link</h4>
                        </DetailsLink>
                      </DetailsWrapper>
                      <DetailsWrapperBottom>
                        <DetailsSubreddit>
                          <a href={"https://www.reddit.com" + post.subreddit.info.url} target="_blank" rel="noreferrer">
                            {post.subreddit.defaults.pixivTag.enName}
                          </a>
                        </DetailsSubreddit>
                        <DetailsPixivTag>
                          <a
                            href={
                              post.subreddit.defaults.pixivTag.link +
                              "/artworks?mode=safe&p=" +
                              Number(post.subreddit.currentPage)
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {post.subreddit.defaults.pixivTag.enName}
                          </a>
                        </DetailsPixivTag>
                        <DetailsLink>
                          <TextField
                            onChange={handleLinkChange(post.subreddit)}
                            value={post.selectedImage?.pixivLink ?? ""}
                            placeholder="Link"
                          />
                        </DetailsLink>
                      </DetailsWrapperBottom>
                      <DetailsWrapperBottom>
                        <Icon className="bx bx-chevron-left" onClick={decreaseSlice(post)} />
                        <Icon className="bx bx-chevron-right" onClick={increaseSlice(post)} />

                        <CurentPageWrapper>
                          <Icon className="bx bx-minus" onClick={minusPage(post)} title={post.subreddit.notes} />
                          <TextField
                            onChange={handlePageChange(post.subreddit)}
                            value={post.subreddit.currentPage.toString()}
                            placeholder="Title"
                          />
                          <Icon className="bx bx-plus" onClick={plusPage(post)} />
                          <Icon className="bx bx-send" onClick={goToPage(post, post.subreddit.currentPage)} />
                        </CurentPageWrapper>
                      </DetailsWrapperBottom>
                      <ImagePreviewWrapper>
                        {post.suggestedImages.slice(post.slice * 4, post.slice * 4 + 4).map((image, i) => {
                          return (
                            <ImagePreview
                              key={i}
                              src={image.imageBlob}
                              onClick={handleImageChange(post.subreddit, image)}
                              isSelected={post.selectedImage?.imageLink === image.imageLink}
                            />
                          );
                        })}
                      </ImagePreviewWrapper>
                      <DetailsWrapper>
                        <DetailsTitle>
                          <h4>Title</h4>
                        </DetailsTitle>
                        <DetailsFlair>
                          <h4>Flair</h4>
                        </DetailsFlair>
                        <DetailsCrosspost>
                          <h4>Crosspost</h4>
                        </DetailsCrosspost>
                        <DetailsR18>
                          <h4>R18</h4>
                        </DetailsR18>
                        <DetailsComment>
                          <h4>CC</h4>
                        </DetailsComment>
                      </DetailsWrapper>
                      <DetailsWrapperBottom>
                        <DetailsTitle>
                          <TextField
                            onChange={handleTitleChange(post.subreddit)}
                            value={post.title}
                            placeholder="Title"
                          />
                        </DetailsTitle>
                        <DetailsFlair>
                          {post.subreddit.info.flairs.length ? (
                            <Select
                              options={post.subreddit.info.flairs.map((flair) => flair.name)}
                              value={post.flair?.name || ""}
                              onChange={handleFlairChange(post.subreddit)}
                              isClearable
                            />
                          ) : (
                            <GreyText>No Flair</GreyText>
                          )}
                        </DetailsFlair>
                        <DetailsCrosspost>
                          <Select
                            options={tagOptions}
                            onChange={handleTagChange(post.subreddit)}
                            value={[]}
                            isMulti
                            isClearable
                          />
                        </DetailsCrosspost>
                        <DetailsR18>
                          <CheckboxLabel>
                            <Checkbox
                              type="checkbox"
                              checked={post.isNSFW}
                              onChange={handleNSFWChange(post.subreddit)}
                            />
                          </CheckboxLabel>
                        </DetailsR18>
                        <DetailsComment>
                          <Icon
                            className="bx bx-note"
                            onClick={viewNote(post.subreddit)}
                            title={post.subreddit.notes}
                          />
                        </DetailsComment>
                      </DetailsWrapperBottom>

                      {/* <div>comment</div> */}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <NoSearchResults>No Subreddits Found!</NoSearchResults>
        )}
        <hr />
        <CreditButtons>
          <Button onClick={createPost}>Create Posts</Button>
        </CreditButtons>
      </DashboardContent>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </>
  );
};

export default IndexPage;
