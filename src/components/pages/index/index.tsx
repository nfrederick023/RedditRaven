import {
  BluJayTheme,
  PixivDetails,
  Post,
  PostHistory,
  SubmissionErrors,
  Subreddit,
  SuggestedImages,
  SuggestedImagesReq,
} from "@client/utils/types";
import PromisePool from "async-promise-pool";
import React, { FC, useEffect, useRef, useState } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
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

const ImagePreviewWrapper = styled(ScrollContainer)`
  display: flex;
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

const ImageTitle = styled.div`
  margin: auto;
  max-width: 350px;
`;

const DetailsWrapperBottom = styled(DetailsWrapper)`
  margin-bottom: 15px;
`;

const DetailsTitle = styled.div`
  width: 50%;
  > div {
    width: 100%;
  }
`;

const DetailsFlair = styled.div`
  width: 50%;
  > div {
    width: 100%;
  }
`;

const DetailsCrosspost = styled.div`
  width: 48%;
  > div {
    width: 100%;
  }
`;

const DetailsR18 = styled.div`
  justify-content: center;
  width: 4%;
  > div {
    width: 100%;
  }
`;

const DetailsSubreddit = styled.div`
  width: 50%;
  overflow: hidden;
`;

const DetailsPixivTag = styled.div`
  width: 50%;
  > div {
    width: 100%;
  }

  > a {
    margin-left: 5px;
  }
`;

const DetailsLink = styled.div`
  width: 48%;
  > div {
    width: 100%;
  }
`;

const ButtonBase = styled.div`
  margin: 8px 5px 0px 0px;
`;

const CreateSpinner = styled.div`
  div {
    margin: auto;
  }
`;

const CreditButtons = styled(ButtonBase)``;

const ClearButtons = styled(ButtonBase)`
  width: 50%;
  > div {
    width: 100%;
  }
`;

const GreyText = styled.div`
  color: ${(p): string => p.theme.textContrast};
`;

const NoSearchResults = styled.div`
  padding: 6px 0px 6px 0px;
  color: ${(p): string => p.theme.textContrast};
`;

const ImageDetails = styled.div`
  margin-right: 5px;
  margin-left: 5px;
`;

const ImagePreview = styled.img`
  /* max-width: 100%; */
  object-fit: cover;
  border-radius: 15px;
  min-height: 450px;
  max-height: 450px;
  /* min-width: 350px;
  max-width: 350px; */
  cursor: pointer;

  ${(p: {
    theme: BluJayTheme;
    isSelected: boolean;
    hasAlreadyPosted: boolean;
  }): string =>
    p.isSelected
      ? `border: 2px ${p.theme.text} solid; box-shadow: 0 0 25px ${p.theme.text};`
      : `border: 2px ${p.theme.background} solid; `};

  ${(p): string => (p.hasAlreadyPosted ? "opacity: 0.2;" : "")};
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
  width: 100%;
  height: 612px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
`;

const ShownImage = styled.img`
  position: fixed;
  top: 70%;
  left: 54%;
  width: 400px;
  transform: translate(-50%, -50%);
  z-index: 10;
  border: 2px ${(p): string => p.theme.text} solid;
  pointer-events: none;
  box-shadow: 0 0 25px ${(p): string => p.theme.text};
`;

const pool = new PromisePool({ concurrency: 15 });

const getSuggestedImages = async (
  suggestedImagesReq: SuggestedImagesReq
): Promise<SuggestedImages | undefined> => {
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

const createRedditPost = async (post: Post): Promise<Response> => {
  const response = await fetch("/api/createPost", {
    method: "POST",
    body: JSON.stringify(post),
  });
  return response;
};

const saveSubreddits = async (subreddits: Subreddit[]): Promise<Response> => {
  const response = await fetch("/api/subreddits", {
    method: "PUT",
    body: JSON.stringify({ subreddits }),
  });

  return response;
};

const resultsPerPageOptions = ["5", "10", "20", "50", "100"];
interface IndexPageProps {
  subreddits: Subreddit[];
}

const IndexPage: FC<IndexPageProps> = ({ subreddits }: IndexPageProps) => {
  const [paginatedResults, setPaginatedResults] = useState<Subreddit[]>([]);
  const [history, setHistory] = useState<PostHistory>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [hoverImage, setHoverImage] = useState<PixivDetails | undefined>(
    undefined
  );
  const [token, setToken] = useState("");
  const isInitialMount = useRef(true);
  const isAbortingRef = useRef(false);
  const timesPosted = useRef(0);

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

    for (const post of newPosts) {
      post.suggestedImages = await retrieveSuggestedImages(
        post,
        post.subreddit.currentPage
      );
      post.isLoading = false;
      setPosts([
        ...newPosts.map((_post) => {
          if (_post.subreddit.name === post.subreddit.name) {
            return post;
          } else {
            return _post;
          }
        }),
      ]);
    }
  };

  const retrieveHistoryList = async (): Promise<void> => {
    const response = await fetch("/api/history", { method: "GET" });
    const res = (await response.json()) as PostHistory;
    setHistory(res);
  };

  const retrieveSuggestedImages = async (
    post: Post,
    page: string
  ): Promise<PixivDetails[]> => {
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

  const getNewSlice = async (
    postToUpdate: Post,
    slice: number
  ): Promise<void> => {
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

  const handlePixivTokenChange = (token: string): void => {
    setToken(token);
  };

  const handleFlairChange = (subreddit: Subreddit) => {
    return (flairName: string): void => {
      const flair = subreddit.info.flairs.find(
        (flair) => flair.name === flairName
      );
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

  const handleImageChange =
    (postToUpdate: Post, image: PixivDetails) => (): void => {
      if (postToUpdate.selectedImage?.pixivID !== image.pixivID) {
        const parsedArtistName = image.artist.split("@")[0];
        const defaultTitle = postToUpdate.subreddit.defaults.title;
        let title = "";
        if (defaultTitle) title = defaultTitle + " ";
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
      } else {
        setPosts(
          posts.map((post) => {
            if (post.subreddit.name === postToUpdate.subreddit.name) {
              post.selectedImage = undefined;
              post.title = post.subreddit.defaults.pixivTag?.title ?? "";
            }
            return post;
          })
        );
      }
    };

  const handleLinkChange = (postToUpdate: Post) => {
    return async (newLink: string): Promise<void> => {
      let pixivDetails: PixivDetails | undefined;

      // set the current subreddit to loading while we get the results
      setPosts(
        posts.map((post) => {
          if (post.subreddit.name === postToUpdate.subreddit.name) {
            post.customLink = newLink;
            post.isLoading = true;
          }
          return post;
        })
      );

      // verify that the link is valid before retrieve the results
      if (
        newLink.includes("https://www.pixiv.net/") &&
        newLink.includes("/artworks/")
      ) {
        if (newLink.includes("#")) {
          if (newLink.split("#")[1]) {
            pixivDetails = await getLink(newLink);
          }
        } else {
          pixivDetails = await getLink(newLink);
        }
      }

      if (newLink !== "" && pixivDetails) {
        const parsedArtistName = pixivDetails.artist.split("@")[0];
        const defaultTitle = postToUpdate.subreddit.defaults.title;
        let title = "";
        if (defaultTitle) title = defaultTitle + " ";
        if (postToUpdate.pixivTag?.title)
          title += postToUpdate.pixivTag.title + " ";
        title += "(by " + parsedArtistName + ")";

        setPosts(
          posts.map((post) => {
            if (
              post.subreddit.name === postToUpdate.subreddit.name &&
              pixivDetails
            ) {
              post.selectedImage = pixivDetails;
              post.suggestedImages = [pixivDetails];
              post.title = title;
              post.isLoading = false;
            }
            return post;
          })
        );
      }
    };
  };

  const handleTagChange = (postToUpdate: Post) => {
    return (pixivTagEnName: string): void => {
      const newTag = postToUpdate.subreddit.pivixTags.find(
        (tag) => tag.enName === pixivTagEnName
      );
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
      const matchingSubreddits = subreddits.filter((subreddit) =>
        crossposts.includes(subreddit.name)
      );
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

  const handlePageChange = (
    subreddit: Subreddit
  ): ((newPage: string) => void) => {
    const newPosts = [...posts];
    const postIndex = newPosts.findIndex(
      (post) => post.subreddit.name === subreddit.name
    );

    return (newPage: string) => {
      newPosts[postIndex] = {
        ...newPosts[postIndex],
        subreddit: { ...subreddit, currentPage: newPage },
      };
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

  const handleTokenSubmit = (): void => {
    setPosts([]);
    setPaginatedResults([...paginatedResults]);
  };

  const copyLink = (link: string) => (): void => {
    navigator.clipboard.writeText(link);
  };

  const setImage = async (image: PixivDetails | undefined): Promise<void> => {
    if (image) {
      setHoverImage(image);
    } else {
      setHoverImage(undefined);
    }
  };

  const abortPosts = (): void => {
    if (!isAbortingRef.current) {
      setIsPosting(false);
      isAbortingRef.current = true;
    }
  };

  const clearAlreadyPosted = (): void => {
    setPosts(
      posts.map<Post>((post) => {
        if (
          history
            .find((history) => history.subreddit === post.subreddit.name)
            ?.postedIDs.includes(post.selectedImage?.pixivID ?? "")
        ) {
          return {
            ...post,
            selectedImage: undefined,
            title: post.subreddit.defaults.title,
            crossposts: [],
            multipost: [],
            flair: post.subreddit.defaults.flair,
          };
        }

        return post;
      })
    );
  };

  const clearAll = (): void => {
    setPosts(
      posts.map<Post>((post) => {
        return {
          ...post,
          selectedImage: undefined,
          title: post.subreddit.defaults.title,
          crossposts: [],
          multipost: [],
          flair: post.subreddit.defaults.flair,
        };
      })
    );
  };

  const createPost = async (): Promise<void> => {
    setIsPosting(true);
    timesPosted.current += 1;
    const currentTimePosted = timesPosted.current;
    isAbortingRef.current = false;

    const compiledPosts: Post[] = [];
    posts.forEach((post) => {
      if (post.selectedImage) {
        if (post.usesDefaultComment)
          post.comment = `[Source](${post.selectedImage.pixivLink})`;
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
    }

    const failedPosts: SubmissionErrors[] = [];
    const isUnknownInternalServerError = false;
    const responses: Response[] = [];
    try {
      for (const compiledPost of compiledPosts) {
        if (isAbortingRef.current) {
          throw "Abort";
        }

        responses.push(await createRedditPost(compiledPost));
        await retrieveHistoryList();

        // on all but the last one
        if (
          compiledPost.selectedImage?.pixivID !==
          compiledPosts[compiledPosts.length - 1].selectedImage?.pixivID
        ) {
          // wait 1 minute between each request
          // my desperate attempt not to be rate limited
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        if (timesPosted.current !== currentTimePosted) {
          throw "Abort";
        }
      }

      for (const res of responses) {
        if (!res.ok) {
          let json: { errors: SubmissionErrors[] } | undefined;
          try {
            json = await res.json();
          } catch (e) {
            //
          }
          if (json && json.errors) {
            failedPosts.push(...json.errors);
          }
        }
      }

      if (failedPosts.length === 0) {
        alert("Success!");
      } else {
        alert(
          "One or More Posts Failed! \n" +
            failedPosts.map(
              (failedPost) =>
                failedPost.subredditName + ": " + failedPost.error + "\n."
            )
        );
      }

      if (isUnknownInternalServerError) {
        alert("Some unknown internal server error has occured!");
      }

      const updatedSubreddits = subreddits.map((subreddit) => {
        const matchingPost = posts.find(
          (post) => post.subreddit.name === subreddit.name
        );
        if (matchingPost) {
          return matchingPost.subreddit;
        } else {
          return subreddit;
        }
      });
      saveSubreddits(updatedSubreddits);
      setIsPosting(false);
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    if (isInitialMount.current) isInitialMount.current = false;
    else {
      setPosts([]);
      createPosts();
    }
  }, [paginatedResults]);

  useEffect(() => {
    retrieveHistoryList();
  }, []);

  const subredditOptions = subreddits.map((subreddit) => subreddit.name);
  const crossPostableSubs = subreddits.filter(
    (subreddit) => subreddit.info.isCrosspostable
  );
  return (
    <>
      <h1>POST</h1>

      {hoverImage ? (
        <ShownImage
          src={"data:image/png;base64, " + hoverImage.imageBlob}
          onMouseEnter={(): Promise<void> => setImage(hoverImage)}
        />
      ) : (
        <></>
      )}
      <DashboardContent>
        <hr />
        <DetailsWrapperBottom>
          <TextField
            onChange={handlePixivTokenChange}
            value={token}
            placeholder="Pixiv Token"
          />
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
                    </DetailsWrapper>
                    <DetailsWrapperBottom>
                      <DetailsSubreddit>
                        <a
                          href={
                            "https://www.reddit.com" + post.subreddit.info.url
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {post.subreddit.name}
                        </a>
                      </DetailsSubreddit>
                      <DetailsPixivTag>
                        <Select
                          options={post.subreddit.pivixTags.map(
                            (tag) => tag.enName
                          )}
                          onChange={handleTagChange(post)}
                          value={post.pixivTag?.enName ?? ""}
                        />
                        <a
                          href={
                            post.pixivTag?.link +
                            "/artworks?mode=safe&p=" +
                            Number(post.subreddit.currentPage)
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Icon
                            className="bx bx-link-external"
                            title="Open in New Tab"
                          />
                        </a>
                      </DetailsPixivTag>
                    </DetailsWrapperBottom>
                    {post.isLoading ? (
                      <SpinnerBox>
                        <Spinner />
                      </SpinnerBox>
                    ) : (
                      <>
                        <DetailsWrapperBottom>
                          <CurentPageWrapper>
                            <TextField
                              onChange={handleLinkChange(post)}
                              value={post.customLink}
                              placeholder="Link"
                            />
                          </CurentPageWrapper>
                          <Icon
                            className="bx bx-minus"
                            onClick={minusPage(post)}
                            title={post.subreddit.notes}
                          />
                          <TextField
                            onChange={handlePageChange(post.subreddit)}
                            value={post.subreddit.currentPage.toString()}
                            placeholder="Title"
                          />
                          <Icon
                            className="bx bx-plus"
                            onClick={plusPage(post)}
                          />
                          <Icon
                            className="bx bx-send"
                            onClick={goToPage(post, post.subreddit.currentPage)}
                          />
                        </DetailsWrapperBottom>
                        <ImagePreviewWrapper>
                          {post.suggestedImages.map((image, i) => {
                            return (
                              <ImageDetails key={i}>
                                <ImagePreview
                                  src={
                                    "data:image/png;base64, " + image.imageBlob
                                  }
                                  onClick={handleImageChange(post, image)}
                                  isSelected={
                                    post.selectedImage?.imageLink ===
                                    image.imageLink
                                  }
                                  hasAlreadyPosted={
                                    !!history
                                      .find(
                                        (history) =>
                                          history.subreddit ===
                                          post.subreddit.name
                                      )
                                      ?.postedIDs.includes(image.pixivID)
                                  }
                                  // onMouseEnter={(): Promise<void> => setImage(image)}
                                  // onMouseLeave={(): Promise<void> => setImage(undefined)}
                                />
                                <ImageLinksWrapper>
                                  <ImageLinks>
                                    <a
                                      href={image.pixivLink}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Open in New Tab
                                    </a>
                                    <Icon
                                      className="bx bx-link"
                                      onClick={copyLink(
                                        "https://www.pixiv.net/en/artworks/" +
                                          image.pixivID
                                      )}
                                      title="Copy Link"
                                    />
                                  </ImageLinks>
                                </ImageLinksWrapper>
                                <ImageLinksWrapper>
                                  <ImageTitle translate="yes">
                                    {image.title}
                                  </ImageTitle>
                                </ImageLinksWrapper>
                              </ImageDetails>
                            );
                          })}
                        </ImagePreviewWrapper>
                      </>
                    )}
                    <DetailsWrapper>
                      <DetailsTitle>
                        <h4>Title</h4>
                      </DetailsTitle>
                      <DetailsFlair>
                        <h4>Flair</h4>
                      </DetailsFlair>
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
                            options={post.subreddit.info.flairs.map(
                              (flair) => flair.name
                            )}
                            value={post.flair?.name || ""}
                            onChange={handleFlairChange(post.subreddit)}
                            isClearable
                          />
                        ) : (
                          <GreyText>No Flair</GreyText>
                        )}
                      </DetailsFlair>
                    </DetailsWrapperBottom>

                    <DetailsWrapper>
                      <DetailsLink>
                        <h4>Multi-Post</h4>
                      </DetailsLink>
                      <DetailsCrosspost>
                        <h4>Crosspost</h4>
                      </DetailsCrosspost>
                      <DetailsR18>
                        <h4>R18</h4>
                      </DetailsR18>
                    </DetailsWrapper>
                    <DetailsWrapperBottom>
                      <DetailsLink>
                        <Select
                          options={subredditOptions}
                          onChange={handleSubredditChange(post)}
                          value={post.multipost}
                          isMulti
                          isClearable
                        />
                      </DetailsLink>
                      <DetailsCrosspost>
                        <Select
                          options={crossPostableSubs.map((sub) => sub.name)}
                          onChange={handleCrosspostChange(post)}
                          value={post.crossposts.map(
                            (crosspost) => crosspost.name
                          )}
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
                    </DetailsWrapperBottom>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <NoSearchResults>No Subreddits Found!</NoSearchResults>
        )}
        <DetailsWrapperBottom>
          <ClearButtons>
            <Button onClick={clearAlreadyPosted}>Clear Already Posted</Button>
          </ClearButtons>
          <ClearButtons>
            <Button onClick={clearAll}>Clear All</Button>
          </ClearButtons>
        </DetailsWrapperBottom>
        {!isPosting ? (
          <>
            <hr />
            {posts.find((post) => post.isLoading) ? (
              <CreateSpinner>
                <Spinner />
              </CreateSpinner>
            ) : (
              <CreditButtons>
                <Button onClick={createPost}>Create Posts</Button>
              </CreditButtons>
            )}
          </>
        ) : (
          <>
            <CreditButtons>
              <Button onClick={abortPosts}>Cancel</Button>
            </CreditButtons>
            <SpinnerBox>
              <Spinner />
            </SpinnerBox>
          </>
        )}
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
