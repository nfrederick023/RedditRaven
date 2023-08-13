import { BluJayTheme, Subreddit } from "@client/utils/types";
import React, { FC, useEffect, useState } from "react";
import SearchBar from "../shared/search-bar";
import Select from "../shared/select";
import styled from "styled-components";

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

const PageButtonContainer = styled.div`
  display: flex;
  margin-bottom: 3px;
`;

const PageButton = styled.div`
  color: ${(p): string => p.theme.textContrast};
  width: 32px;
  height: 32px;
  border: 1px solid ${(p): string => p.theme.textContrast};
  border-radius: 5px;
  text-align: center;
  display: grid;
  margin-right: 3px;
  align-content: center;
  user-select: none;

  &:hover {
    cursor: pointer;
    border: 1px solid ${(p): string => p.theme.text};
    color: ${(p): string => p.theme.text};
  }
  ${(p: { isSelected: boolean; theme: BluJayTheme }): string =>
    p.isSelected ? `border: 1px solid ${p.theme.text}; color: ${p.theme.text};` : ""};
`;

const ResultsPerPageWrapper = styled.div`
  width: 70px;
  margin-right: 3px;
`;

interface SubredditSearchProps {
  subreddits: Subreddit[];
  numberOfSelected?: number;
  paginatedResults: Subreddit[];
  resultsPerPageOptions: string[];
  intialResultsPerPage: string;
  showAll?: boolean;
  hideWithouCategory?: boolean;
  setPaginatedResults: React.Dispatch<React.SetStateAction<Subreddit[]>>;
  paginationFilter?: (result: Subreddit) => boolean;
}

const SubredditsSearch: FC<SubredditSearchProps> = ({
  subreddits,
  numberOfSelected,
  paginatedResults,
  resultsPerPageOptions,
  intialResultsPerPage,
  setPaginatedResults,
  paginationFilter,
  showAll,
  hideWithouCategory,
}: SubredditSearchProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Subreddit[]>([]);
  const [resultsPerPage, setResultsPerPage] = useState(Number(showAll ? subreddits.length : intialResultsPerPage));
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState("");

  const getSearchResults = (): Subreddit[] => {
    return subreddits.filter((subreddit) => {
      const searchFilter = subreddit.name.toLowerCase().includes(search.toLowerCase());

      const categoryFilter = selectedCategories.length
        ? selectedCategories.some((selectedCategory) => subreddit.categories.includes(selectedCategory))
        : !hideWithouCategory;

      return searchFilter && categoryFilter;
    });
  };

  const handleFilterChange = (newSearch: string): void => {
    setSearch(newSearch);
    paginateResults();
  };

  const handleCategoryChange = (categories: string[]): void => {
    setSelectedCategories(categories);
    paginateResults();
  };

  const handlePageChange = (page: number) => (): void => {
    setCurrentPage(page);
    paginateResults();
  };

  const handleResultsPerPageChange = (newResultsPerPage: string): void => {
    setResultsPerPage(Number(newResultsPerPage));
    paginateResults();
  };

  const numberOfPages = Math.ceil(
    (searchResults.length - (numberOfSelected || 0)) / (resultsPerPage ? resultsPerPage : 1)
  );

  if (currentPage !== 0 && currentPage > numberOfPages - 1) setCurrentPage(numberOfPages - 1);

  let categories: string[] = [];

  subreddits.forEach((subreddit) => (categories = [...new Set([...categories, ...subreddit.categories])]));

  const paginateResults = (): void => {
    let searchResultsSlice = getSearchResults();

    if (paginationFilter) {
      searchResultsSlice = searchResultsSlice.filter(paginationFilter);
    }

    searchResultsSlice = searchResultsSlice.slice(
      currentPage * resultsPerPage,
      currentPage * resultsPerPage + resultsPerPage
    );

    const updatePagination = searchResultsSlice.filter((result) => {
      return !paginatedResults.includes(result);
    });

    if (updatePagination.length || searchResultsSlice.length !== paginatedResults.length) {
      setPaginatedResults(searchResultsSlice);
    }
  };

  useEffect(() => {
    paginateResults();
  });

  useEffect(() => {
    setSearchResults([...getSearchResults()]);
  }, [search, selectedCategories]);

  return (
    <>
      <Filter>
        <FilterName>
          Name
          <SearchBar onChange={handleFilterChange} value={search} />
        </FilterName>
        <FilterCategory>
          Category
          <Select options={categories} onChange={handleCategoryChange} value={selectedCategories} isMulti isClearable />
        </FilterCategory>
      </Filter>
      {!showAll ? (
        <>
          Results
          <PageButtonContainer>
            {[...new Array(numberOfPages)].map((undef, i) => {
              return (
                <PageButton key={i} isSelected={i === currentPage} onClick={handlePageChange(i)}>
                  {i + 1}
                </PageButton>
              );
            })}
            <ResultsPerPageWrapper>
              <Select
                options={resultsPerPageOptions}
                onChange={handleResultsPerPageChange}
                value={resultsPerPage.toString()}
                defaultSelected={resultsPerPage.toString()}
              />
            </ResultsPerPageWrapper>
          </PageButtonContainer>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default SubredditsSearch;
