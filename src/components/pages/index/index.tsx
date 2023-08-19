import { BluJayTheme, PixivDetails, Post, Subreddit, SuggestedImages, SuggestedImagesReq } from "@client/utils/types";
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
  padding: 7px 6px 6px 7px;
  transition: all 0.1s ease-in;
  user-select: none;
  display: inline-block;
  height: 32px;
  width: 32px;

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

const ImageLinksWrapper = styled.div`
  display: flex;
`;

const ImageLinks = styled.div`
  margin: auto;

  > a {
    margin-right: 15px;
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
  width: 30%;
  > div {
    width: 100%;
  }

  > a {
    margin-left: 5px;
  }
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

const ImageDetails = styled.div`
  max-width: 24%;
  margin-right: 5px;
  margin-left: 5px;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  object-fit: cover;
  border-radius: 15px;
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
  margin-right: auto;
  width: 100%;
  > div {
    width: 100%;
  }
`;

const Spinner = styled.div`
  @keyframes spin {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(359deg);
    }
  }

  width: 50px;
  height: 50px;
  border: 3px solid #fb5b53;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 0.5s linear 0s infinite;
`;

const SpinnerBox = styled.div`
  width: 450px;
  height: 450px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
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

const getLink = async (link: string): Promise<PixivDetails | undefined> => {
  const response = await fetch("/api/sourceLink", {
    method: "POST",
    body: JSON.stringify({ link }),
  });
  if (response.ok) {
    try {
      return (await response.json()) as PixivDetails;
    } catch (e) {
      //
    }
  }
};

const createRedditPost = async (posts: Post[]): Promise<Response> => {
  const response = await fetch("/api/createPost", {
    method: "POST",
    body: JSON.stringify({ posts }),
  });
  return response;
};

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

    const newPosts = paginatedResults.map((subreddit): Post => {
      return {
        subreddit: subreddit,
        selectedImage: undefined,
        flair: subreddit.defaults.flair,
        isNSFW: false,
        usesDefaultComment: true,
        comment: "",
        title: subreddit.defaults.pixivTag?.title ?? "",
        suggestedImages: [],
        slice,
        isLoading: true,
        multipost: [],
        pixivTag: subreddit.defaults.pixivTag,
        crossposts: [],
        customLink: "",
      };
    });

    setPosts(newPosts);
    const postsWithImages: Post[] = [];

    for (const post of newPosts) {
      let suggestedImages: PixivDetails[] = [];

      if (post.pixivTag) {
        suggestedImages = await retrieveSuggestedImages(post, post.subreddit.currentPage);
      }

      post.suggestedImages = suggestedImages;
      post.isLoading = false;
      postsWithImages.push(post);
    }

    setPosts(postsWithImages);
  };

  const retrieveSuggestedImages = async (post: Post, page: string): Promise<PixivDetails[]> => {
    const body: SuggestedImagesReq = {
      pixivTag: post.pixivTag,
      page,
      slice: post.slice,
      token,
      count: 5,
    };

    const res = await getSuggestedImages(body);
    return res?.suggestedImages ?? [];
  };

  const getNewSlice = async (postToUpdate: Post, slice: number): Promise<void> => {
    if (postToUpdate.pixivTag) {
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
    getNewSlice(post, post.slice + 1);
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

  const handleImageChange = (postToUpdate: Post, image: PixivDetails) => (): void => {
    const parsedArtistName = image.artist.split("@")[0];
    const defaultTitle = postToUpdate.subreddit.defaults.title;
    let title = "";
    if (defaultTitle) title = defaultTitle + " ";
    if (postToUpdate.pixivTag?.title) title += postToUpdate.pixivTag.title + " ";
    title += "(by " + parsedArtistName + ")";
    setPosts(
      posts.map((post) => {
        if (post.subreddit.name === postToUpdate.subreddit.name) {
          post.selectedImage = image;
          post.title = title;
        }
        return post;
      })
    );
  };

  const handleLinkChange = (postToUpdate: Post) => {
    return async (newLink: string): Promise<void> => {
      let pixivDetails: PixivDetails | undefined;
      setPosts(
        posts.map((post) => {
          if (post.subreddit.name === postToUpdate.subreddit.name) {
            post.customLink = newLink;
          }
          return post;
        })
      );

      if (newLink.includes("https://www.pixiv.net/") && newLink.includes("/artworks/")) {
        if (newLink.includes("#")) {
          if (newLink.split("#")[1]) {
            pixivDetails = await getLink(newLink);
          }
        } else {
          pixivDetails = await getLink(newLink);
        }
      }

      setPosts(
        posts.map((post) => {
          if (post.subreddit.name === postToUpdate.subreddit.name && pixivDetails) {
            post.selectedImage = pixivDetails;
            post.suggestedImages = [pixivDetails];
          }
          return post;
        })
      );
    };
  };

  const handleTagChange = (postToUpdate: Post) => {
    return (pixivTagEnName: string): void => {
      const newTag = postToUpdate.subreddit.pivixTags.find((tag) => tag.enName === pixivTagEnName);
      setPosts(
        posts.map((post) => {
          if (post.subreddit.name === postToUpdate.subreddit.name) {
            post.pixivTag = newTag;
          }
          return post;
        })
      );

      goToPage(postToUpdate, postToUpdate.subreddit.currentPage)();
    };
  };

  const handleCrosspostChange = (postToUpdate: Post) => {
    return (crossposts: string[]): void => {
      const matchingSubreddits = subreddits.filter((subreddit) => crossposts.includes(subreddit.name));
      setPosts(
        posts.map((post) => {
          if (post.subreddit.name === postToUpdate.subreddit.name) {
            post.crossposts = matchingSubreddits;
          }
          return post;
        })
      );
    };
  };

  const handleSubredditChange = (postToUpdate: Post) => {
    return (subreddits: string[]): void => {
      setPosts(
        posts.map((post) => {
          if (post.subreddit.name === postToUpdate.subreddit.name) {
            post.multipost = subreddits;
          }
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

  const minusPage = (post: Post) => (): void => {
    const newPage = Number(post.subreddit.currentPage) - 1 + "";
    goToPage(post, newPage)();
  };

  const plusPage = (post: Post) => (): void => {
    const newPage = Number(post.subreddit.currentPage) + 1 + "";
    goToPage(post, newPage)();
  };

  const goToPage = (post: Post, page: string) => async (): Promise<void> => {
    if (post.pixivTag) {
      setPosts(
        posts.map((_post) => {
          if (_post.subreddit.name === post.subreddit.name) {
            _post.isLoading = true;
          }
          return _post;
        })
      );

      const suggestedImages = await retrieveSuggestedImages(post, page);
      setPosts(
        posts.map((_post) => {
          if (_post.subreddit.name === post.subreddit.name) {
            _post.suggestedImages = suggestedImages;
            _post.subreddit = { ..._post.subreddit, currentPage: page };
            _post.isLoading = false;
          }
          return _post;
        })
      );
      getNewSlice(post, 0);
    }
  };

  const viewNote = (subreddit: Subreddit) => (): void => {
    alert(subreddit.notes);
  };

  const handleTokenSubmit = (): void => {
    setPosts([]);
    setPaginatedResults([...paginatedResults]);
  };

  const copyLink = (link: string) => (): void => {
    navigator.clipboard.writeText(link);
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
    else {
      setPosts([]);
      createPosts();
    }
  }, [paginatedResults]);

  const subredditOptions = subreddits.map((subreddit) => subreddit.name);
  const crossPostableSubs = subreddits.filter((subreddit) => subreddit.info.isCrosspostable);
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
                        <h4>Multi-Post</h4>
                      </DetailsLink>
                    </DetailsWrapper>
                    <DetailsWrapperBottom>
                      <DetailsSubreddit>
                        <a href={"https://www.reddit.com" + post.subreddit.info.url} target="_blank" rel="noreferrer">
                          {post.subreddit.name}
                        </a>
                      </DetailsSubreddit>
                      <DetailsPixivTag>
                        <Select
                          options={post.subreddit.pivixTags.map((tag) => tag.enName)}
                          onChange={handleTagChange(post)}
                          value={post.pixivTag?.enName ?? ""}
                        />
                        <a
                          href={post.pixivTag?.link + "/artworks?mode=safe&p=" + Number(post.subreddit.currentPage)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Icon className="bx bx-link-external" title="Open in New Tab" />
                        </a>
                      </DetailsPixivTag>
                      <DetailsLink>
                        <Select
                          options={subredditOptions}
                          onChange={handleSubredditChange(post)}
                          value={post.multipost}
                          isMulti
                          isClearable
                        />
                      </DetailsLink>
                    </DetailsWrapperBottom>
                    <DetailsWrapperBottom>
                      <Icon className="bx bx-chevron-left" onClick={decreaseSlice(post)} />
                      <Icon className="bx bx-chevron-right" onClick={increaseSlice(post)} />
                      <CurentPageWrapper>
                        <TextField onChange={handleLinkChange(post)} value={post.customLink} placeholder="Link" />
                      </CurentPageWrapper>
                      <Icon className="bx bx-minus" onClick={minusPage(post)} title={post.subreddit.notes} />
                      <TextField
                        onChange={handlePageChange(post.subreddit)}
                        value={post.subreddit.currentPage.toString()}
                        placeholder="Title"
                      />
                      <Icon className="bx bx-plus" onClick={plusPage(post)} />
                      <Icon className="bx bx-send" onClick={goToPage(post, post.subreddit.currentPage)} />
                    </DetailsWrapperBottom>
                    <ImagePreviewWrapper>
                      {post.isLoading ? (
                        <SpinnerBox>
                          <Spinner />
                        </SpinnerBox>
                      ) : (
                        <>
                          {post.suggestedImages.slice(post.slice * 4, post.slice * 4 + 4).map((image, i) => {
                            return (
                              <ImageDetails key={i}>
                                <ImagePreview
                                  src={"data:image/png;base64, " + image.imageBlob}
                                  onClick={handleImageChange(post, image)}
                                  isSelected={post.selectedImage?.imageLink === image.imageLink}
                                />
                                <ImageLinksWrapper>
                                  <ImageLinks>
                                    <a href={image.pixivLink} target="_blank" rel="noreferrer">
                                      Open in New Tab
                                    </a>
                                    <Icon
                                      className="bx bx-link"
                                      onClick={copyLink("https://www.pixiv.net/en/artworks/" + image.pixivID)}
                                      title="Copy Link"
                                    />
                                  </ImageLinks>
                                </ImageLinksWrapper>
                              </ImageDetails>
                            );
                          })}
                        </>
                      )}
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
                          options={crossPostableSubs.map((sub) => sub.name)}
                          onChange={handleCrosspostChange(post)}
                          value={post.crossposts.map((crosspost) => crosspost.name)}
                          isMulti
                          isClearable
                        />
                      </DetailsCrosspost>
                      <DetailsR18>
                        <CheckboxLabel>
                          <Checkbox type="checkbox" checked={post.isNSFW} onChange={handleNSFWChange(post.subreddit)} />
                        </CheckboxLabel>
                      </DetailsR18>
                      <DetailsComment>
                        <Icon className="bx bx-note" onClick={viewNote(post.subreddit)} title={post.subreddit.notes} />
                      </DetailsComment>
                    </DetailsWrapperBottom>

                    {/* <div>comment</div> */}
                  </div>
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
