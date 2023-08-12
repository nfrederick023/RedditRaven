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
interface ClassicPageProps {
  subreddits: Subreddit[];
}

const ClassicPage: FC<ClassicPageProps> = ({ subreddits }: ClassicPageProps) => {
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
      <h1>CLASSIC</h1>
      <DashboardContent>
        <Gradient type="text">
          <h2>IMAGE</h2>
        </Gradient>
        <hr />
        <FlexWrapper>
          <ImageOptionsWrapper>
            <h4>Pixiv Link</h4>
            <InputFieldMax>
              <TextField onChange={handleLinkChange} value={link} placeholder="Link" />
            </InputFieldMax>
            <label>
              <Checkbox type="checkbox" checked={preview} onChange={handlePreviewChange} />
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
            <ImagePreviewWrapper>{imgurl && <ImagePreview src={imgurl} />}</ImagePreviewWrapper>
            <ImageDetails>
              <h4>Image Details</h4>
              <hr />
              <FlexWrapper>
                <h4>Artist: </h4>
                <a href={pixivDetails?.artistLink || ""} target="_blank" rel="noreferrer">
                  {pixivDetails?.artist || ""}
                </a>
              </FlexWrapper>
              <FlexWrapper>
                <h4>PixivID: </h4>
                <a href={pixivDetails?.pixivLink || ""} target="_blank" rel="noreferrer">
                  {pixivDetails?.pixivID || ""}
                </a>
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
                  <a href={pixivDetails?.imageLink || ""} target="_blank" rel="noreferrer">
                    Link to Image
                  </a>
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
          resultsPerPageOptions={resultsPerPageOptions}
          intialResultsPerPage={resultsPerPageOptions[1]}
        />
        <SearchHeaderWrapper>
          <FlexWrapper>
            <DetailsOptions>
              <h4>Options</h4>
            </DetailsOptions>
            <DetailsFlair>
              <h4>Subreddit</h4>
            </DetailsFlair>

            <DetailsTags>
              <h4>Pixiv Tags</h4>
            </DetailsTags>
          </FlexWrapper>
        </SearchHeaderWrapper>
        {paginatedResults.length ? (
          <>
            {paginatedResults.map((subreddit, i) => {
              return (
                <SearchResult key={i}>
                  <DetailsOptions>
                    <Icon className="bx bx-plus" onClick={handleAddSubreddit(subreddit)} title="Select" />
                    <Icon className="bx bx-link" onClick={copyLink(subreddit.name)} title="Copy Link" />
                    <a href={"https://www.reddit.com" + subreddit.info.url} target="_blank" rel="noreferrer">
                      <Icon className="bx bx-link-external" title="Open in New Tab" />
                    </a>
                    <Icon className="bx bx-note" onClick={viewNote(subreddit)} title={subreddit.notes} />
                  </DetailsOptions>
                  <DetailsFlair>{subreddit.name}</DetailsFlair>
                  {subreddit.pivixTags.length ? (
                    <DetailsTags>
                      {"[ "}
                      {subreddit.pivixTags.map((tag, i) => {
                        return (
                          <span key={i}>
                            <a
                              href={tag.link + "/artworks?p=" + (tagPage ? tagPage : 1)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {tag.enName}
                            </a>
                            {i !== subreddit.pivixTags.length - 1 && " | "}
                          </span>
                        );
                      })}
                      {" ]"}
                    </DetailsTags>
                  ) : (
                    <></>
                  )}
                </SearchResult>
              );
            })}
            <Button onClick={handleAddAll}>Add All</Button>
            <FlexWrapper>
              <InputText>
                <ButtonBase>Tag Page:</ButtonBase>
              </InputText>
              <InputText>
                <TextField onChange={handleTagPageChange} value={tagPage} placeholder="Page No." />
              </InputText>
              <CheckboxLabel>
                <Checkbox type="checkbox" checked={displayPixivTags} onChange={handleDisplayPixivTagsChange} />
                Display Pixiv Tags in Details
              </CheckboxLabel>
            </FlexWrapper>
          </>
        ) : (
          <NoSearchResults>No Subreddits Found!</NoSearchResults>
        )}
        <Gradient type="text">
          <h2>DETAILS</h2>
        </Gradient>
        <hr />
        <FlexWrapper>
          <DetailsOptions>
            <h4>Options</h4>
          </DetailsOptions>
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
                <span key={i}>
                  <DetailsWrapper>
                    <DetailsOptions>
                      <Icon className="bx bx-x" onClick={handleRemoveSubreddit(post.subreddit)} title="Unselect" />
                      <Icon className="bx bx-link" onClick={copyLink(post.subreddit.name)} title="Copy Link" />
                      <a href={"https://www.reddit.com" + post.subreddit.info.url} target="_blank" rel="noreferrer">
                        <Icon className="bx bx-link-external" title="Open in New Tab" />
                      </a>
                      <Icon className="bx bx-note" onClick={viewNote(post.subreddit)} title={post.subreddit.notes} />
                    </DetailsOptions>
                    <DetailsSubreddit>{post.subreddit.name}</DetailsSubreddit>
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
                      <TextField onChange={handleTitleChange(post.subreddit)} value={post.title} placeholder="Title" />
                    </DetailsTitle>
                  </DetailsWrapper>
                  {post.subreddit.pivixTags.length && displayPixivTags ? (
                    <DetailsWrapper>
                      <h5>Pixiv Tags: </h5>
                      <DetailsTags>
                        {"[ "}
                        {post.subreddit.pivixTags.map((tag, i) => {
                          return (
                            <span key={i}>
                              <a
                                href={tag.link + "/artworks?p=" + (tagPage ? tagPage : 1)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {tag.enName}
                              </a>
                              {i !== post.subreddit.pivixTags.length - 1 && " | "}
                            </span>
                          );
                        })}
                        {" ]"}
                      </DetailsTags>
                    </DetailsWrapper>
                  ) : (
                    <></>
                  )}
                </span>
              );
            })}
          </>
        ) : (
          <NoSubreddits>No Subreddits Selected...</NoSubreddits>
        )}
        <Button onClick={handleRemoveAll()}>Remove All</Button>
        <FlexWrapper>
          <ApplyAllButton>
            <Button onClick={handleApplyAllTitle}>Add to All Title</Button>
          </ApplyAllButton>
          <InputFields>
            <TextField onChange={handleGlobalTitleChange} value={globalTitle} placeholder="Title" />
          </InputFields>
        </FlexWrapper>
        <FlexWrapper>
          <ApplyAllButton>
            <Button onClick={handleApplyAllTags}>Apply Tags to All</Button>
          </ApplyAllButton>
          <InputFields>
            <Select options={tagOptions} onChange={handleGlobalTagsChange} value={globalTags} isMulti isClearable />
          </InputFields>
        </FlexWrapper>
        <CreditButtons>
          <Button onClick={handleCreditArtistInTitle}>Credit Artist All Titles</Button>
        </CreditButtons>
        <Divider />
        <h4>Comment</h4>
        <CommentWrapper>
          <TextArea onChange={handleCommentChange} value={comment} placeholder={"Comment..."} />
        </CommentWrapper>
        <FlexWrapper>
          <CreditButtons>
            <Button onClick={handleAddSource}>Add Source</Button>
          </CreditButtons>
          <CreditButtons>
            <Button onClick={handleCreditArtist}>Credit Artist</Button>
          </CreditButtons>
          <CheckboxLabel>
            <Checkbox type="checkbox" checked={includeSource} onChange={handleIncludeSourceChange} />
            Default Include Source
          </CheckboxLabel>
          <ClearButton>
            <Button onClick={handleClearComment}>Clear</Button>
          </ClearButton>
        </FlexWrapper>
        <Divider />
        <h4>Date & Time</h4>
        <NoSSR>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimeWrapper>
              <DatePicker defaultValue={dateTime} minDate={dayjs(Date.now())} onChange={handleDateTimeChange} />
              <MobileTimePicker defaultValue={dateTime} minTime={dayjs(Date.now())} onChange={handleDateTimeChange} />
              <CheckboxLabel>
                <Checkbox type="checkbox" checked={postNow} onChange={handlePostNowChange} />
                Post Now
              </CheckboxLabel>
            </DateTimeWrapper>
          </LocalizationProvider>
        </NoSSR>
        <CreditButtons>
          <Button onClick={createPost}>Create Post</Button>
        </CreditButtons>
        <CheckboxLabel>
          <Checkbox type="checkbox" checked={clearOnPost} onChange={handleClearOnPostChange} />
          Clear All Fields After Posting
        </CheckboxLabel>
      </DashboardContent>
    </>
  );
};

export default ClassicPage;
