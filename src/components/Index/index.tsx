import { Subreddit } from "@client/types/types";
import Gradient from "../Common/Styled/Gradient";
import React, { FC, useEffect, useState } from "react";
import SearchBar from "../Common/Styled/SearchBar";
import Select from "../Common/Styled/Select";
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
  position: relative;
`;

const SearchResult = styled.div`
  display: flex;
  padding: 5px;

  &:hover {
    div {
      visibility: visible;
      opacity: 1;
    }
  }
`;

const AddButton = styled.div`
  border: 1px solid ${theme.textContrast};
  border-radius: 5px;
  padding: 5px;
  visibility: hidden;
  opacity: 0;
  transition: all 0.1s ease-in;
  user-select: none;
  &:hover {
    cursor: pointer;
  }
`;

const PageButtonContainer = styled.div`
  display: flex;
`;

const PageButton = styled.div`
  color: ${theme.textContrast};
  width: 32px;
  height: 32px;
  border: 1px solid ${theme.textContrast};
  border-radius: 5px;
  text-align: center;
  display: grid;
  margin: 3px;
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
  position: relative;
  width: 60px;
  margin: 3px;
`;

interface IndexPageProps {
  subreddits: Subreddit[];
}

const IndexPage: FC<IndexPageProps> = ({ subreddits }: IndexPageProps) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Subreddit[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(2);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const recentVideos = [...subreddits].sort(
    ({ name: a }, { name: b }) => Number(b) - Number(a)
  );

  const resultsPerPageOptions = ["1", "5", "10", "20", "50", "100"];

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

  useEffect(() => {
    setSearchResults([...getSearchResults()]);
  }, [search, selectedCategories]);

  const numberOfPages = Math.ceil(
    searchResults.length / (resultsPerPage ? resultsPerPage : 1)
  );

  const searchResultsSlice = searchResults.slice(
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
      <Gradient type="text">
        <h1>Dashboard</h1>
      </Gradient>
      <DashboardContent>
        <h3>Search</h3>
        <Filter>
          <FilterName>
            Name
            <SearchBar onChange={handleFilterChange} />
          </FilterName>
          <FilterCategory>
            Category
            <Select
              options={categories}
              onChange={handleCategoryChange}
              isMulti
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
        <div>
          {searchResultsSlice.length ? (
            <>
              {searchResultsSlice.map((subreddit, i) => {
                return (
                  <SearchResult key={i}>
                    {subreddit.name} <AddButton> Add Subreddit</AddButton>
                  </SearchResult>
                );
              })}
            </>
          ) : (
            <SearchResult>No Subreddits Found!</SearchResult>
          )}
        </div>
        <div>
          <h3>Details</h3>
        </div>
        <div>
          <h3>Image</h3>
        </div>
        <div>
          <h3>Comment</h3>
        </div>
      </DashboardContent>
    </>
  );
};

export default IndexPage;
