import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { FileUpload } from "@client/components/common/shared/file-upload";
import { PixivDetails, Post, PostTemplate, Subreddit, Tags } from "@client/utils/types";
import Gradient from "@client/components/common/shared/gradient";
import NoSSR from "@mpth/react-no-ssr";
import React, { FC, useEffect, useState } from "react";
import Select from "@client/components/common/shared/select";
import SubredditsSearch from "@client/components/common/subreddits-search/subreddits-search";
import TextArea from "@client/components/common/shared/text-area";
import TextField from "@client/components/common/shared/text-field";
import dayjs, { Dayjs } from "dayjs";
import styled from "styled-components";

const SearchHeaderWrapper = styled.div`
  margin: 10px 0px 5px 0px;
`;

const DashboardContent = styled.div`
  text-align: left;
`;

const Divider = styled.div`
  margin-top: 5px;
`;

const SearchResult = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
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

const CommentWrapper = styled.div`
  width: 100%;
  height: 5em;
  margin-top: 5px;
`;

const FlexWrapper = styled.div`
  display: flex;
`;

const DetailsWrapper = styled.div`
  margin: 5px 0px 10px 0px;
  display: flex;
  white-space: pre;
  > div {
    margin-right: 5px;
  }
`;

const DetailsOptions = styled.div`
  width: 13%;
  align-items: center;
  display: flex;
  overflow: hidden;

  div {
    margin-right: 5px;
  }
`;

const DetailsSubreddit = styled.div`
  width: 15%;
  align-items: center;
  display: flex;
  overflow: hidden;

  div {
    margin-right: 5px;
  }
`;

const DetailsFlair = styled.div`
  width: 20%;
  align-self: center;
  display: flex;
  > div {
    width: 100%;
  }
`;

const DetailsTags = styled.div`
  width: 25%;
  align-self: center;
  display: flex;
  white-space: pre;
  > div {
    width: 100%;
  }
`;

const ButtonBase = styled.div`
  margin: 8px 5px 0px 0px;
`;

const ApplyAllButton = styled(ButtonBase)`
  width: 20%;
`;

const CreditButtons = styled(ButtonBase)``;

const ClearButton = styled(ButtonBase)`
  margin-left: auto;
  margin-right: 0px;
  width: 15%;
`;

const InputFields = styled.div`
  margin: 8px 5px 0px 0px;
  width: 80%;
`;

const InputFieldMax = styled.div`
  margin: 8px 5px 0px 0px;
  width: 100%;
`;

const DetailsTitle = styled.div`
  width: 30%;
`;

const GreyText = styled.div`
  color: ${(p): string => p.theme.textContrast};
`;

const NoSubreddits = styled.div`
  margin-top: 5px;
  margin-bottom: 5px;
  color: ${(p): string => p.theme.textContrast};
`;

const NoSearchResults = styled.div`
  padding: 6px 0px 6px 0px;
  color: ${(p): string => p.theme.textContrast};
`;

const DateTimeWrapper = styled.div`
  > div {
    width: 25%;
    margin: 8px 5px 0px 0px;
  }

  div {
    max-height: 30px;
    height: 30px;
    transition: all 0.1s ease-in;

    &:hover {
      fieldset {
        border-color: ${(p): string => p.theme.text}!important;
      }
    }
  }
  input {
    max-height: 30px;
    padding: 0px 5px;
    color: ${(p): string => p.theme.textContrast};
    transition: all 0.1s ease-in;

    &:hover {
      color: ${(p): string => p.theme.text};
    }
  }

  button {
    color: ${(p): string => p.theme.textContrast} !important;
    transition: all 0.1s ease-in;

    &:hover {
      color: ${(p): string => p.theme.text};
    }

    svg {
      width: 0.9em;
      height: 0.9em;
    }
  }

  fieldset {
    border-color: ${(p): string => p.theme.textContrast}!important;
  }
`;

const ImageOptionsWrapper = styled.div`
  width: 45%;
`;

const VerticleDivider = styled.div`
  border-left: 1px solid ${(p): string => p.theme.text};
  width: 1px;
  margin-left: auto;
  margin-right: auto;
`;

const FileUploadWrapper = styled.div`
  border: 1px solid ${(p): string => p.theme.textContrast};
  border-radius: 5px;
  margin: 5px;
  height: 72px;

  &:hover {
    border-color: ${(p): string => p.theme.text};
  }
`;

const ImageDetails = styled.div`
  width: 65%;
  padding: 15px;
  margin-top: 10px;

  div {
    padding-top: 15px;
    white-space: pre;
  }
`;

const ImagePreviewWrapper = styled.div`
  margin-top: 10px;
  height: 40vh;
  width: 35%;
  border: 1px solid ${(p): string => p.theme.textContrast};
  border-radius: 15px;
`;

const ImagePreview = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
  border-radius: 15px;
`;

const Checkbox = styled.input`
  margin-top: 17px;
  vertical-align: text-bottom;
  accent-color: ${(p): string => p.theme.highlightDark};
`;

const CheckboxLabel = styled.label`
  user-select: none;
`;

const InputText = styled.div`
  margin: 8px 5px 0px 0px;
`;

const getSource = async (body: FormData): Promise<PixivDetails | undefined> => {
  const response = await fetch("/api/sourceImage", {
    method: "POST",
    body,
  });
  if (response.ok) return (await response.json()) as PixivDetails;
};

const getLink = async (link: string): Promise<PixivDetails | undefined> => {
  const response = await fetch("/api/sourceLink", {
    method: "POST",
    body: JSON.stringify({ link }),
  });
  if (response.ok) return (await response.json()) as PixivDetails;
};

const getImage = async (link: string): Promise<Response> => {
  const response = await fetch("/api/loadImage", {
    method: "POST",
    body: JSON.stringify({ link }),
  });
  return response;
};

const createRedditPost = async (post: Post): Promise<Response> => {
  const response = await fetch("/api/createPost", {
    method: "POST",
    body: JSON.stringify({ post }),
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
  const [postTemplates, setPostTemplates] = useState<PostTemplate[]>([]);
  const [globalTitle, setGlobalTitle] = useState("");
  const [includeSource, setIncludeSoure] = useState(true);
  const [postNow, setPostNow] = useState(true);
  const [globalTags, setGlobalTags] = useState<Tags[]>([]);
  const [comment, setComment] = useState("");
  const [dateTime, setDateTime] = useState(dayjs(new Date()).add(30, "minutes"));
  const [link, setLink] = useState("");
  const [imgurl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(true);
  const [pixivDetails, setPixivDetails] = useState<PixivDetails>();
  const [clearOnPost, setClearOnPost] = useState(true);
  const [tagPage, setTagPage] = useState("1");
  const [displayPixivTags, setDisplayPixivTags] = useState(false);

  const createPostTemplate = (subreddit: Subreddit): PostTemplate => {
    return {
      subreddit: subreddit,
      title: subreddit.defaults.title,
      flair: subreddit.defaults.flair,
      tags: subreddit.defaults.tags,
    };
  };

  const handleAddSubreddit = (subreddit: Subreddit) => (): void => {
    setPostTemplates([...postTemplates, createPostTemplate(subreddit)]);
  };

  const handleAddAll = (): void => {
    const newPosts: PostTemplate[] = [];
    paginatedResults.forEach((subreddit) => newPosts.push(createPostTemplate(subreddit)));
    setPostTemplates([...postTemplates, ...newPosts]);
  };

  const handleRemoveAll = () => (): void => {
    setPostTemplates([]);
  };

  const handleFlairChange = (subreddit: Subreddit) => {
    return (flairName: string): void => {
      const flair = subreddit.info.flairs.find((flair) => flair.name === flairName);
      setPostTemplates(
        postTemplates.map((post) => {
          if (post.subreddit === subreddit) post.flair = flair ? flair : null;
          return post;
        })
      );
    };
  };

  const handleTitleChange = (subreddit: Subreddit) => {
    return (title: string): void => {
      setPostTemplates(
        postTemplates.map((post) => {
          if (post.subreddit === subreddit) post.title = title;
          return post;
        })
      );
    };
  };

  const handleTagChange = (subreddit: Subreddit) => {
    return (tags: string[]): void => {
      setPostTemplates(
        postTemplates.map((post) => {
          if (post.subreddit === subreddit) post.tags = tags as Tags[];
          return post;
        })
      );
    };
  };

  const handleGlobalTitleChange = (title: string): void => {
    setGlobalTitle(title);
  };

  const handleGlobalTagsChange = (tags: string[]): void => {
    setGlobalTags(tags as Tags[]);
  };

  const handleCommentChange = (comment: string): void => {
    setComment(comment);
  };

  const handleRemoveSubreddit = (subreddit: Subreddit) => (): void => {
    setPostTemplates(postTemplates.filter((post) => post.subreddit !== subreddit));
  };

  const handleDateTimeChange = (date: Dayjs | null): void => {
    if (date) setDateTime(date);
  };

  const handleApplyAllTitle = (): void => {
    setPostTemplates(
      postTemplates.map((post) => {
        post.title = post.title + globalTitle;
        return post;
      })
    );
  };

  const handleApplyAllTags = (): void => {
    const newPosts = postTemplates.map((post) => {
      post.tags = globalTags;
      return post;
    });

    setPostTemplates(newPosts);
  };

  const handleLinkChange = async (newLink: string): Promise<void> => {
    setLink(newLink);

    if (newLink.includes("https://www.pixiv.net/") && newLink.includes("/artworks/"))
      if (newLink.includes("#")) {
        if (newLink.split("#")[1]) setPixivDetails(await getLink(newLink));
      } else {
        setPixivDetails(await getLink(newLink));
      }
  };

  const copyLink = (subredditName: string) => (): void => {
    navigator.clipboard.writeText(`https://www.reddit.com/r/${subredditName}`);
  };

  const handleImageChange = async (file: File | undefined): Promise<void> => {
    const body = new FormData();
    if (file) {
      body.append("file", file);
      setPixivDetails(await getSource(body));
    }
  };

  const handlePreviewChange = (): void => {
    setPreview(!preview);
  };

  const updatePixivDetails = async (): Promise<void> => {
    if (pixivDetails?.imageLink) {
      const image = await getImage(pixivDetails.imageLink);
      setImageUrl(URL.createObjectURL(await image.blob()));
    } else {
      setImageUrl("");
    }
  };

  const handleCreditArtist = (): void => {
    setComment(comment + `\n\nArt by: ${pixivDetails?.artist}`);
  };

  const handleCreditArtistInTitle = (): void => {
    setGlobalTitle(globalTitle + ` (by ${pixivDetails?.artist})`);
  };

  const handleAddSource = (): void => {
    const source = `[Source](${pixivDetails?.pixivLink})`;
    if (!comment.includes(source)) setComment(comment + source);
  };

  const handleClearComment = (): void => {
    setComment("");
  };

  const handleClearOnPostChange = (): void => {
    setClearOnPost(!clearOnPost);
  };

  const handleIncludeSourceChange = (): void => {
    setIncludeSoure(!includeSource);
  };

  const handlePostNowChange = (): void => {
    setPostNow(!postNow);
  };

  const viewNote = (subreddit: Subreddit) => (): void => {
    alert(subreddit.notes);
  };

  const handleTagPageChange = (tagPage: string): void => {
    if ((!isNaN(Number(tagPage)) && Number(tagPage) > 0) || tagPage === "") setTagPage(tagPage);
  };

  const handleDisplayPixivTagsChange = (): void => {
    setDisplayPixivTags(!displayPixivTags);
  };

  const createPost = (): void => {
    // check all required fields
    for (const postTemplate of postTemplates) {
      if (!postTemplate.title) {
        alert(`Subreddit: ${postTemplate.subreddit.name} is missing a title!`);
        return;
      }
    }

    if (!postTemplates.length) {
      alert("You must select at least one subreddit!");
      return;
    }

    if (!pixivDetails || !pixivDetails.imageLink) {
      alert("You must provide an image before making a post!");
      return;
    }

    if (dateTime.toDate().getTime() < Date.now() && !postNow) {
      alert("The time selected is in the past. Please select a different time!");
      return;
    }

    const isAllFlairsSelected = !!postTemplates.find(
      (postTemplate) => !postTemplate.flair && postTemplate.subreddit.info.flairs.length
    );

    if (isAllFlairsSelected) {
      const notAllFlairsSelectedConfirmation = !confirm(
        "Not all flairs are selected. Are you sure you wish to continue?"
      );
      if (notAllFlairsSelectedConfirmation) return;
    }

    const _comment = includeSource ? comment + `[Source](${pixivDetails?.pixivLink})` : comment;

    const post: Post = {
      postDetails: postTemplates,
      imageLink: pixivDetails.imageLink,
      dateTimeMS: dateTime.toDate().getTime(),
      comment: _comment,
    };

    createRedditPost(post);

    if (clearOnPost) {
      setPostTemplates([]);
      setPixivDetails(undefined);
      setPaginatedResults([]);
      setGlobalTitle("");
      setGlobalTags([]);
      setComment("");
      setLink("");
      setImageUrl("");
    }
  };

  useEffect(() => {
    updatePixivDetails();
  }, [pixivDetails]);

  const paginationFilter = (result: Subreddit): boolean => {
    return !postTemplates.find((post) => result === post.subreddit);
  };

  return (
    <>
      <h1>POST</h1>
      <DashboardContent>
        <hr />
        <SubredditsSearch
          paginatedResults={paginatedResults}
          setPaginatedResults={setPaginatedResults}
          numberOfSelected={postTemplates.length}
          paginationFilter={paginationFilter}
          subreddits={subreddits}
          resultsPerPageOptions={resultsPerPageOptions}
          intialResultsPerPage={resultsPerPageOptions[1]}
          showAll
        />
        {paginatedResults.length ? (
          <>
            {paginatedResults.map((subreddit, i) => {
              return (
                <div key={i}>
                  <hr />

                  {subreddit.pivixTags.length ? (
                    <div>
                      <div>subreddit name | primary tag | Page + ___ - O auto?</div>
                      <div>image1 image2 image3</div>
                      <div>title flair nsfw crosspost comment</div>
                      <div>comment</div>
                    </div>
                  ) : (
                    <>No primary tag</>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <NoSearchResults>No Subreddits Found!</NoSearchResults>
        )}
        <CreditButtons>
          <Button onClick={createPost}>Create Post</Button>
        </CreditButtons>
      </DashboardContent>
    </>
  );
};

export default IndexPage;
