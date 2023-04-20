import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  DatePicker,
  LocalizationProvider,
  MobileTimePicker,
} from "@mui/x-date-pickers";
import { Subreddit, Tags } from "@client/types/types";
import Gradient from "../Common/Styled/Gradient";
import NoSSR from "@mpth/react-no-ssr";
import React, { FC, useEffect, useState } from "react";
import SearchBar from "../Common/Styled/SearchBar";
import Select from "../Common/Styled/Select";
import TextArea from "../Common/Styled/TextArea";
import TextField from "../Common/Styled/TextFrield";
import dayjs, { Dayjs } from "dayjs";
import styled from "styled-components";
import theme from "@client/utils/themes";

const DashboardContent = styled.div`
  text-align: left;
`;

const Filter = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
`;

const FilterName = styled.div`
  width: 40%;
  padding-right: 10px;
`;

const FilterCategory = styled.div`
  width: 60%;
`;

const SearchResult = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

const Icon = styled.div`
  border: 1px solid ${theme.textContrast};
  border-radius: 5px;
  padding: 5px;
  margin-right: 5px;
  transition: all 0.1s ease-in;
  user-select: none;

  color: ${theme.textContrast};

  &:hover {
    cursor: pointer;
    border-color: ${theme.text};
    color: ${theme.text};
  }
`;

const PageButtonContainer = styled.div`
  display: flex;
  margin-bottom: 3px;
`;

const PageButton = styled.div`
  color: ${theme.textContrast};
  width: 32px;
  height: 32px;
  border: 1px solid ${theme.textContrast};
  border-radius: 5px;
  text-align: center;
  display: grid;
  margin-right: 3px;
  align-content: center;
  user-select: none;

  &:hover {
    cursor: pointer;
    border: 1px solid ${theme.text};
    color: ${theme.text};
  }
  ${(props: { isSelected: boolean }): string =>
    props.isSelected
      ? `border: 1px solid ${theme.text}; color: ${theme.text};`
      : ""};
`;

const ResultsPerPageWrapper = styled.div`
  width: 60px;
  margin-right: 3px;
`;

const CommentWrapper = styled.div`
  width: 64px;
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

const ApplyAllButton = styled.div`
  margin: 8px 5px 0px 0px;
  width: 20%;
`;

const InputFields = styled.div`
  margin: 8px 5px 0px 0px;
  width: 80%;
`;

const DetailsTitle = styled.div`
  width: 30%;
`;

const GreyText = styled.div`
  color: ${theme.textContrast};
`;

const NoSearchResults = styled.div`
  padding: 6px 0px 6px 0px;
  color: ${theme.textContrast};
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
        border-color: ${theme.text}!important;
      }
    }
  }
  input {
    max-height: 30px;
    padding: 0px 5px;
    color: ${theme.textContrast};
    transition: all 0.1s ease-in;

    &:hover {
      color: ${theme.text};
    }
  }

  button {
    color: ${theme.textContrast} !important;
    transition: all 0.1s ease-in;

    &:hover {
      color: ${theme.text};
    }

    svg {
      width: 0.9em;
      height: 0.9em;
    }
  }

  fieldset {
    border-color: ${theme.textContrast}!important;
  }
`;

// interface PostDetails {
//   dateTime: number;
//   imgLink: string;
//   comment: string;
//   posts: Post[];
// }

interface Post {
  subreddit: Subreddit;
  flair: string;
  tags: Tags[];
  title: string;
}

interface IndexPageProps {
  subreddits: Subreddit[];
}

const IndexPage: FC<IndexPageProps> = ({ subreddits }: IndexPageProps) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Subreddit[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [globalTitle, setGlobalTitle] = useState("");
  const [globalTags, setGlobalTags] = useState<Tags[]>([]);
  const [comment, setComment] = useState("");
  const [dateTime, setDateTime] = useState(dayjs(new Date()));

  const resultsPerPageOptions = ["1", "5", "10", "20", "50", "100"];
  const tagOptions: Tags[] = ["Spoiler", "NSFW", "OC"];

  const getSearchResults = (): Subreddit[] => {
    return subreddits.filter((subreddit) => {
      const searchFilter = subreddit.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const categoryFilter = selectedCategories.length
        ? selectedCategories.some((selectedCategory) =>
            subreddit.categories.includes(selectedCategory)
          )
        : true;

      return searchFilter && categoryFilter;
    });
  };

  const createPost = (subreddit: Subreddit): Post => {
    return {
      subreddit: subreddit,
      title: "",
      tags: [],
      flair: "",
    };
  };

  const handleFilterChange = (newSearch: string): void => {
    setSearch(newSearch);
  };

  const handleCategoryChange = (categories: string[]): void => {
    setSelectedCategories(categories);
  };

  const handlePageChange = (page: number) => (): void => {
    setCurrentPage(page);
  };

  const handleResultsPerPageChange = (newResultsPerPage: string): void => {
    setResultsPerPage(Number(newResultsPerPage));
  };

  const handleAddSubreddit = (subreddit: Subreddit) => (): void => {
    setPosts([...posts, createPost(subreddit)]);
  };

  const handleAddAll = (): void => {
    const newPosts: Post[] = [];
    searchResultsSlice.forEach((subreddit) =>
      newPosts.push(createPost(subreddit))
    );
    setPosts([...posts, ...newPosts]);
  };

  const handleRemoveAll = () => (): void => {
    setPosts([]);
  };

  const handleFlairChange = (subreddit: Subreddit) => {
    return (flair: string): void => {
      setPosts(
        posts.map((post) => {
          if (post.subreddit === subreddit) post.flair = flair;
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

  const handleTagChange = (subreddit: Subreddit) => {
    return (tags: string[]): void => {
      setPosts(
        posts.map((post) => {
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
    setPosts(posts.filter((post) => post.subreddit !== subreddit));
  };

  const handleDateTimeChange = (date: Dayjs | null): void => {
    if (date) setDateTime(date);
  };

  const handleApplyAllTitle = (): void => {
    setPosts(
      posts.map((post) => {
        post.title = globalTitle;
        return post;
      })
    );
  };

  const handleApplyAllTags = (): void => {
    setPosts(
      posts.map((post) => {
        post.tags = globalTags;
        return post;
      })
    );
  };

  const copyLink = (subredditName: string) => (): void => {
    navigator.clipboard.writeText(`https://www.reddit.com/r/${subredditName}`);
  };

  useEffect(() => {
    setSearchResults([...getSearchResults()]);
  }, [search, selectedCategories]);

  const numberOfPages = Math.ceil(
    searchResults.length / (resultsPerPage ? resultsPerPage : 1)
  );

  let searchResultsSlice = searchResults;

  posts.forEach((post) => {
    searchResultsSlice = searchResultsSlice.filter(
      (result) => result !== post.subreddit
    );
  });

  searchResultsSlice = searchResultsSlice.slice(
    currentPage * resultsPerPage,
    currentPage * resultsPerPage + resultsPerPage
  );

  let categories: string[] = [];

  subreddits.forEach(
    (subreddit) =>
      (categories = [...new Set([...categories, ...subreddit.categories])])
  );

  if (currentPage !== 0 && currentPage > numberOfPages - 1)
    setCurrentPage(numberOfPages - 1);

  return (
    <>
      <h1>DASHBOARD</h1>

      <DashboardContent>
        <Gradient type="text">
          <h2>SEARCH</h2>
        </Gradient>
        <hr />
        <Filter>
          <FilterName>
            Name
            <SearchBar onChange={handleFilterChange} value={search} />
          </FilterName>
          <FilterCategory>
            Category
            <Select
              options={categories}
              onChange={handleCategoryChange}
              isMulti
              isClearable
            />
          </FilterCategory>
        </Filter>
        Results
        <PageButtonContainer>
          {[...new Array(numberOfPages)].map((undef, i) => {
            return (
              <PageButton
                key={i}
                isSelected={i === currentPage}
                onClick={handlePageChange(i)}
              >
                {i + 1}
              </PageButton>
            );
          })}
          <ResultsPerPageWrapper>
            <Select
              options={resultsPerPageOptions}
              onChange={handleResultsPerPageChange}
              defaultSelected={resultsPerPageOptions[2]}
            />
          </ResultsPerPageWrapper>
        </PageButtonContainer>
        {searchResultsSlice.length ? (
          <>
            {searchResultsSlice.map((subreddit, i) => {
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
        {posts.length ? (
          <>
            {posts.map((post, i) => {
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
                      isMulti
                      isClearable
                    />
                  </DetailsTags>
                  <DetailsTitle>
                    <TextField
                      onChange={handleTitleChange(post.subreddit)}
                      value={post.title}
                    />
                  </DetailsTitle>
                </DetailsWrapper>
              );
            })}
            <Icon onClick={handleRemoveAll()}>Remove All</Icon>

            <FlexWrapper>
              <ApplyAllButton>
                <Icon onClick={handleApplyAllTitle}>Apply Title to All</Icon>
              </ApplyAllButton>
              <InputFields>
                <TextField
                  onChange={handleGlobalTitleChange}
                  value={globalTitle}
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
                  isMulti
                  isClearable
                />
              </InputFields>
            </FlexWrapper>

            <NoSSR>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimeWrapper>
                  <DatePicker
                    defaultValue={dateTime}
                    onChange={handleDateTimeChange}
                  />
                  <MobileTimePicker
                    defaultValue={dateTime}
                    onChange={handleDateTimeChange}
                  />
                </DateTimeWrapper>
              </LocalizationProvider>
            </NoSSR>
          </>
        ) : (
          <GreyText>No Subreddits Selected...</GreyText>
        )}
        <Gradient type="text">
          <h2>IMAGE</h2>
        </Gradient>
        <hr />
        <div>
          <h3>Comment</h3>
          <CommentWrapper>
            <TextArea onChange={handleCommentChange} value={comment} />
          </CommentWrapper>
        </div>
      </DashboardContent>
    </>
  );
};

export default IndexPage;
