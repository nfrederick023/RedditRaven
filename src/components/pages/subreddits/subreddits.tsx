import { Subreddit } from "@client/utils/types";
import Gradient from "@client/components/common/shared/gradient";
import React, { FC, useEffect, useState } from "react";
import SubredditsSearch from "@client/components/common/subreddits-search/subreddits-search";
import TextField from "@client/components/common/shared/text-field";
import styled from "styled-components";

const FlexWrapper = styled.div`
  display: flex;
`;

const SearchResult = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;

  div {
    margin-right: 5px;
  }
`;

const NewSubredditTitle = styled.div`
  width: 70%;
  margin-right: 10px;
  margin-top: 10px;
`;

const NewSubredditButton = styled.div`
  margin-top: 10px;
  width: 30%;
`;

const Icon = styled.div`
  border: 1px solid ${(p): string => p.theme.textContrast};
  border-radius: 5px;
  padding: 6px;
  transition: all 0.1s ease-in;
  user-select: none;

  color: ${(p): string => p.theme.textContrast};

  &:hover {
    cursor: pointer;
    border-color: ${(p): string => p.theme.text};
    color: ${(p): string => p.theme.text};
  }
`;

const NoSearchResults = styled.div`
  padding: 6px 0px 6px 0px;
  color: ${(p): string => p.theme.textContrast};
`;

const addSubreddit = async (name: string): Promise<Response> => {
  const response = await fetch("/api/subreddits", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return response;
};

const removeSubreddit = async (name: string): Promise<Response> => {
  const response = await fetch("/api/subreddits", {
    method: "DELETE",
    body: JSON.stringify({ name }),
  });
  return response;
};

interface SubredditsPageProps {
  subreddits: Subreddit[];
}

const SubredditsPage: FC<SubredditsPageProps> = ({
  subreddits,
}: SubredditsPageProps) => {
  const [paginatedResults, setPaginatedResults] = useState<Subreddit[]>([]);
  const [newSubreddit, setNewSubreddit] = useState<string>("");
  const [subredditList, setSubredditList] = useState(subreddits);

  const slectSubreddit = (subreddit: Subreddit) => (): void => {};

  const copyLink = (subredditName: string) => (): void => {
    navigator.clipboard.writeText(`https://www.reddit.com/r/${subredditName}`);
  };

  const handleNewSubredditChange = (subredditName: string): void => {
    setNewSubreddit(subredditName);
  };

  const handleAddSubreddit = () => async (): Promise<void> => {
    if (!newSubreddit) {
      alert("You must enter a subreddit name!");
      return;
    }

    const res = await addSubreddit(newSubreddit);
    if (res.ok) {
      const newList = await res.json();
      setSubredditList([...newList]);
    }
  };

  const handleRemoveSubreddit = (name: string) => async (): Promise<void> => {
    const res = await removeSubreddit(name);
    if (res.ok) {
      const newList = await res.json();
      setSubredditList([...newList]);
    }
  };

  return (
    <>
      <h1>SUBREDDITS</h1>
      <Gradient type="text">
        <h2>SEARCH</h2>
      </Gradient>
      <hr />
      <SubredditsSearch
        paginatedResults={paginatedResults}
        setPaginatedResults={setPaginatedResults}
        numberOfSelected={0}
        subreddits={subredditList}
      />
      {paginatedResults.length ? (
        <>
          {paginatedResults.map((subreddit, i) => {
            return (
              <SearchResult key={i}>
                <Icon>Select</Icon>
                <Icon
                  className="bx bx-link"
                  onClick={copyLink(subreddit.name)}
                />
                <a href={"https://www.reddit.com" + subreddit.info.url}>
                  <Icon className="bx bx-link-external" />
                </a>
                <Icon
                  className="bx bx-x"
                  onClick={handleRemoveSubreddit(subreddit.name)}
                />
                {subreddit.name}
              </SearchResult>
            );
          })}
          <FlexWrapper>
            <NewSubredditTitle>
              <TextField
                onChange={handleNewSubredditChange}
                value={newSubreddit}
                placeholder="Subreddit Name"
                prefix="r/"
              />
            </NewSubredditTitle>
            <NewSubredditButton>
              <Icon onClick={handleAddSubreddit()}>Add Subreddit</Icon>
            </NewSubredditButton>
          </FlexWrapper>
        </>
      ) : (
        <NoSearchResults>No Subreddits Found!</NoSearchResults>
      )}
      <Gradient type="text">
        <h2>EDIT</h2>
      </Gradient>
      <hr />
      <NoSearchResults>No Subreddit Selected!</NoSearchResults>
    </>
  );
};

export default SubredditsPage;
