import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  DatePicker,
  LocalizationProvider,
  MobileTimePicker,
} from "@mui/x-date-pickers";
import { FileUpload } from "@client/components/common/shared/file-upload";
import {
  PixivDetails,
  Post,
  PostTemplate,
  Subreddit,
  Tags,
} from "@client/utils/types";
import Gradient from "@client/components/common/shared/gradient";
import Link from "next/link";
import NoSSR from "@mpth/react-no-ssr";
import React, { FC, useEffect, useState } from "react";
import Select from "@client/components/common/shared/select";
import SubredditsSearch from "@client/components/common/subreddits-search/subreddits-search";
import TextArea from "@client/components/common/shared/text-area";
import TextField from "@client/components/common/shared/text-field";
import dayjs, { Dayjs } from "dayjs";
import styled from "styled-components";

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

  div {
    margin-right: 5px;
  }
`;

const Icon = styled.div`
  border: 1px solid ${(p): string => p.theme.textContrast};
  border-radius: 5px;
  padding: 5px;
  transition: all 0.1s ease-in;
  user-select: none;

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

  > div {
    margin-right: 5px;
  }
`;

const DetailsSubreddit = styled.div`
  width: 20%;
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
  width: 30%;
  align-self: center;
  display: flex;
  > div {
    width: 100%;
  }
`;

const ButtonBase = styled.div`
  margin: 8px 5px 0px 0px;
`;

const ApplyAllButton = styled(ButtonBase)`
  width: 150px;
`;

const CreditButtons = styled(ButtonBase)``;

const ClearButton = styled(ButtonBase)`
  margin-left: auto;
  margin-right: 0px;
  width: 15%;
`;

const InputFields = styled.div`
  margin: 8px 5px 0px 0px;
  width: 70%;
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
  margin-top: 20px;
  accent-color: ${(p): string => p.theme.highlightDark};
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

const createRedditPost = async (post: Post): Promise<void> => {
  await fetch("/api/createPost", {
    method: "POST",
    body: JSON.stringify({ post }),
  });
};

const tagOptions: Tags[] = ["Spoiler", "NSFW", "OC"];

interface IndexPageProps {
  subreddits: Subreddit[];
}

const IndexPage: FC<IndexPageProps> = ({ subreddits }: IndexPageProps) => {
  const [paginatedResults, setPaginatedResults] = useState<Subreddit[]>([]);
  const [postTemplates, setPostTemplates] = useState<PostTemplate[]>([]);
  const [globalTitle, setGlobalTitle] = useState("");
  const [globalTags, setGlobalTags] = useState<Tags[]>([]);
  const [comment, setComment] = useState("");
  const [dateTime, setDateTime] = useState(
    dayjs(new Date()).add(30, "minutes")
  );
  const [link, setLink] = useState("");
  const [imgurl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(true);
  const [pixivDetails, setPixivDetails] = useState<PixivDetails>();

  const createPostTemplate = (subreddit: Subreddit): PostTemplate => {
    return {
      subreddit: subreddit,
      title: "",
      tags: [],
      flair: "",
    };
  };

  const handleAddSubreddit = (subreddit: Subreddit) => (): void => {
    setPostTemplates([...postTemplates, createPostTemplate(subreddit)]);
  };

  const handleAddAll = (): void => {
    const newPosts: PostTemplate[] = [];
    paginatedResults.forEach((subreddit) =>
      newPosts.push(createPostTemplate(subreddit))
    );
    setPostTemplates([...postTemplates, ...newPosts]);
  };

  const handleRemoveAll = () => (): void => {
    setPostTemplates([]);
  };

  const handleFlairChange = (subreddit: Subreddit) => {
    return (flair: string): void => {
      setPostTemplates(
        postTemplates.map((post) => {
          if (post.subreddit === subreddit) post.flair = flair;
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
    setPostTemplates(
      postTemplates.filter((post) => post.subreddit !== subreddit)
    );
  };

  const handleDateTimeChange = (date: Dayjs | null): void => {
    if (date) setDateTime(date);
  };

  const handleApplyAllTitle = (): void => {
    setPostTemplates(
      postTemplates.map((post) => {
        post.title = globalTitle;
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

    if (
      newLink.includes("https://www.pixiv.net/") &&
      newLink.includes("/artworks/")
    )
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

  const handleAddSource = (): void => {
    setComment(comment + `[Source](${pixivDetails?.pixivLink})`);
  };

  const handleClearComment = (): void => {
    setComment("");
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

    if (dateTime.toDate().getTime() < Date.now()) {
      alert(
        "The time selected is in the past. Please select a different time!"
      );
      return;
    }

    const post: Post = {
      postDetails: postTemplates,
      imageLink: pixivDetails.imageLink,
      dateTimeMS: dateTime.toDate().getTime(),
      comment,
    };

    createRedditPost(post);
  };

  useEffect(() => {
    updatePixivDetails();
  }, [pixivDetails]);

  const paginationFilter = (result: Subreddit): boolean => {
    return !postTemplates.find((post) => result === post.subreddit);
  };

  return (
    <>
      <h1>DASHBOARD</h1>
      <DashboardContent>
        <Gradient type="text">
          <h2>IMAGE</h2>
        </Gradient>
        <hr />
        <FlexWrapper>
          <ImageOptionsWrapper>
            <h4>Pixiv Link</h4>
            <InputFieldMax>
              <TextField
                onChange={handleLinkChange}
                value={link}
                placeholder="Link"
              />
            </InputFieldMax>
            <label>
              <Checkbox
                type="checkbox"
                checked={preview}
                onChange={handlePreviewChange}
              />
              Display Image Preview
            </label>
          </ImageOptionsWrapper>
          <VerticleDivider />
          <ImageOptionsWrapper>
            <h4>Upload</h4>
            <FileUploadWrapper>
              <FileUpload
                onChange={(event): void => {
                  handleImageChange(event.target.files?.[0]);
                }}
                onDrop={(event): void => {
                  handleImageChange(event.dataTransfer.files?.[0]);
                }}
              />
            </FileUploadWrapper>
          </ImageOptionsWrapper>
        </FlexWrapper>
        {preview ? (
          <FlexWrapper>
            <ImagePreviewWrapper>
              {imgurl && <ImagePreview src={imgurl} />}
            </ImagePreviewWrapper>
            <ImageDetails>
              <h4>Image Details</h4>
              <hr />
              <FlexWrapper>
                <h4>Artist: </h4>
                <Link href={pixivDetails?.artistLink || ""}>
                  {pixivDetails?.artist || ""}
                </Link>
              </FlexWrapper>
              <FlexWrapper>
                <h4>PixivID: </h4>
                <Link href={pixivDetails?.pixivLink || ""}>
                  {pixivDetails?.pixivID || ""}
                </Link>
              </FlexWrapper>
              <FlexWrapper>
                <h4>Title: </h4>
                {pixivDetails?.title || ""}
              </FlexWrapper>
              <FlexWrapper>
                <h4>Description: </h4>
              </FlexWrapper>
              {pixivDetails?.description?.substring(0, 100)}
              {imgurl && (
                <FlexWrapper>
                  <Link href={pixivDetails?.imageLink || ""}>
                    Link to Image
                  </Link>
                </FlexWrapper>
              )}
            </ImageDetails>
          </FlexWrapper>
        ) : (
          <></>
        )}
        <Gradient type="text">
          <h2>SEARCH</h2>
        </Gradient>
        <hr />
        <SubredditsSearch
          paginatedResults={paginatedResults}
          setPaginatedResults={setPaginatedResults}
          numberOfSelected={postTemplates.length}
          paginationFilter={paginationFilter}
          subreddits={subreddits}
        />
        {paginatedResults.length ? (
          <>
            {paginatedResults.map((subreddit, i) => {
              return (
                <SearchResult key={i}>
                  <Icon
                    className="bx bx-plus"
                    onClick={handleAddSubreddit(subreddit)}
                  />
                  <Icon
                    className="bx bx-link"
                    onClick={copyLink(subreddit.name)}
                  />
                  <a href={"https://www.reddit.com" + subreddit.info.url}>
                    <Icon className="bx bx-link-external" />
                  </a>
                  {subreddit.name}
                </SearchResult>
              );
            })}
            <Icon onClick={handleAddAll}>Add All</Icon>
          </>
        ) : (
          <NoSearchResults>No Subreddits Found!</NoSearchResults>
        )}
        <Gradient type="text">
          <h2>DETAILS</h2>
        </Gradient>
        <hr />
        <FlexWrapper>
          <DetailsSubreddit>
            <h4>Subreddit</h4>
          </DetailsSubreddit>
          <DetailsFlair>
            <h4>Flair</h4>
          </DetailsFlair>
          <DetailsTags>
            <h4>Tags</h4>
          </DetailsTags>
          <DetailsTitle>
            <h4>Title</h4>
          </DetailsTitle>
        </FlexWrapper>
        {postTemplates.length ? (
          <>
            {postTemplates.map((post, i) => {
              return (
                <DetailsWrapper key={i}>
                  <DetailsSubreddit>
                    <Icon
                      className="bx bx-x"
                      onClick={handleRemoveSubreddit(post.subreddit)}
                    />
                    {post.subreddit.name}
                  </DetailsSubreddit>
                  <DetailsFlair>
                    {post.subreddit.info.flairs.length ? (
                      <Select
                        options={post.subreddit.info.flairs.map(
                          (flair) => flair.name
                        )}
                        value={post.flair}
                        onChange={handleFlairChange(post.subreddit)}
                      />
                    ) : (
                      <GreyText>No Flair</GreyText>
                    )}
                  </DetailsFlair>
                  <DetailsTags>
                    <Select
                      options={tagOptions}
                      onChange={handleTagChange(post.subreddit)}
                      value={post.tags}
                      isMulti
                      isClearable
                    />
                  </DetailsTags>
                  <DetailsTitle>
                    <TextField
                      onChange={handleTitleChange(post.subreddit)}
                      value={post.title}
                      placeholder="Title"
                    />
                  </DetailsTitle>
                </DetailsWrapper>
              );
            })}
          </>
        ) : (
          <NoSubreddits>No Subreddits Selected...</NoSubreddits>
        )}
        <Icon onClick={handleRemoveAll()}>Remove All</Icon>
        <FlexWrapper>
          <ApplyAllButton>
            <Icon onClick={handleApplyAllTitle}>Apply Title to All</Icon>
          </ApplyAllButton>
          <InputFields>
            <TextField
              onChange={handleGlobalTitleChange}
              value={globalTitle}
              placeholder="Title"
            />
          </InputFields>
        </FlexWrapper>
        <FlexWrapper>
          <ApplyAllButton>
            <Icon onClick={handleApplyAllTags}>Apply Tags to All</Icon>
          </ApplyAllButton>
          <InputFields>
            <Select
              options={tagOptions}
              onChange={handleGlobalTagsChange}
              value={globalTags}
              isMulti
              isClearable
            />
          </InputFields>
        </FlexWrapper>
        <Divider />
        <h4>Comment</h4>
        <CommentWrapper>
          <TextArea onChange={handleCommentChange} value={comment} />
        </CommentWrapper>
        <FlexWrapper>
          <CreditButtons>
            <Icon onClick={handleAddSource}>Add Source</Icon>
          </CreditButtons>
          <CreditButtons>
            <Icon onClick={handleCreditArtist}>Credit Artist</Icon>
          </CreditButtons>
          <ClearButton>
            <Icon onClick={handleClearComment}>Clear</Icon>
          </ClearButton>
        </FlexWrapper>
        <Divider />
        <h4>Date & Time</h4>
        <NoSSR>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimeWrapper>
              <DatePicker
                defaultValue={dateTime}
                minDate={dayjs(Date.now())}
                onChange={handleDateTimeChange}
              />
              <MobileTimePicker
                defaultValue={dateTime}
                minTime={dayjs(Date.now())}
                onChange={handleDateTimeChange}
              />
              <label>
                <Checkbox
                  type="checkbox"
                  checked={preview}
                  onChange={handlePreviewChange}
                />
                Post Now
              </label>
            </DateTimeWrapper>
          </LocalizationProvider>
        </NoSSR>
        <CreditButtons>
          <Icon onClick={createPost}>Create Post</Icon>
        </CreditButtons>
        <label>
          <Checkbox
            type="checkbox"
            checked={preview}
            onChange={handlePreviewChange}
          />
          Clear All Fields After Posting
        </label>
      </DashboardContent>
    </>
  );
};

export default IndexPage;
