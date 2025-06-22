import { PixivTag, Subreddit, Tags } from "@client/utils/types";
import Gradient from "@client/components/common/shared/gradient";
import React, { FC, useState } from "react";
import Select from "@client/components/common/shared/select";
import SubredditsSearch from "@client/components/common/subreddits-search/subreddits-search";
import TextField from "@client/components/common/shared/text-field";
import styled from "styled-components";

const FlexWrapper = styled.div`
  display: flex;
  margin-top: 5px;
  white-space: pre;
`;

const Ellipsis = styled.div`
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const ButtonBase = styled.div`
  margin: 8px 5px 0px 0px;
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
  width: 88%;
  margin-top: 10px;
`;

const NewSubredditButton = styled.div`
  margin-top: 10px;
  margin-right: 10px;
  width: 12%;
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

const ListOptions = styled.div`
  width: 15%;
  margin-right: 5px;
`;

const ListName = styled.div`
  width: 60%;
  margin-right: 5px;
  margin-right: 5px;
`;

const NoSearchResults = styled.div`
  padding: 6px 0px 6px 0px;
  color: ${(p): string => p.theme.textContrast};
`;

const SearchHeaderWrapper = styled.div`
  margin: 10px 0px 5px 0px;
`;

const EditHeader = styled.h3`
  margin: 15px 0px 5px 0px;
  text-decoration: underline;
`;

const InputFields = styled.div`
  margin: 8px 0px 0px 0px;
  width: 100%;
`;

const InputText = styled.div`
  margin: 8px 5px 0px 0px;
`;

const addSubreddit = async (name: string): Promise<Response> => {
  const response = await fetch("/api/subreddits", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return response;
};

const indexSubreddit = async (name: string): Promise<Response> => {
  const response = await fetch("/api/subreddits", {
    method: "PATCH",
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

const saveSubreddits = async (subreddits: Subreddit[]): Promise<Response> => {
  const response = await fetch("/api/subreddits", {
    method: "PUT",
    body: JSON.stringify({ subreddits }),
  });

  return response;
};

const getPixivTag = async (link: string): Promise<PixivTag | undefined> => {
  const response = await fetch("/api/pixivTag", {
    method: "POST",
    body: JSON.stringify({ link }),
  });
  if (response.ok) return (await response.json()) as PixivTag;
};

const resultsPerPageOptions = ["1", "5", "10", "20", "50", "100"];
interface SubredditsPageProps {
  readonly subreddits: Subreddit[];
}

const SubredditsPage: FC<SubredditsPageProps> = ({ subreddits }: SubredditsPageProps) => {
  const [paginatedResults, setPaginatedResults] = useState<Subreddit[]>([]);
  const [newSubreddit, setNewSubreddit] = useState<string>("");
  const [subredditList, setSubredditList] = useState(subreddits);
  const [categoryField, setCategoryField] = useState("");
  const [removeCategory, setRemoveCategory] = useState("");
  const [createPixivTag, setCreatePixivTag] = useState("");
  const [deletePixivTag, setDeletePixivTag] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>();

  const editSubreddit = (subreddit: Subreddit) => (): void => {
    setDeletePixivTag("");
    setCreatePixivTag("");
    setRemoveCategory("");
    setCategoryField("");
    setSelectedIndex(subredditList.findIndex((_subreddit) => _subreddit === subreddit));
  };

  const copyLink = (subredditName: string) => (): void => {
    navigator.clipboard.writeText(`https://www.reddit.com/r/${subredditName}`);
  };

  const handleNewSubredditChange = (subredditName: string): void => {
    setNewSubreddit(subredditName);
  };

  const handleAddSubreddit = async (): Promise<void> => {
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

  const handleCategoryChange = (categories: string[]): void => {
    if (typeof selectedIndex !== "undefined") {
      const newSubredditList = [...subredditList];
      newSubredditList[selectedIndex].categories = categories;
      setSubredditList(newSubredditList);
    }
  };

  const handleRemoveSubreddit = (name: string) => async (): Promise<void> => {
    const res = await removeSubreddit(name);
    if (res.ok) {
      const newList = await res.json();
      setSubredditList([...newList]);
    }
  };

  const handleDefaultFlairChange = (flairName: string): void => {
    if (typeof selectedIndex !== "undefined") {
      const flair = subredditList[selectedIndex]?.info.flairs.find((flair) => flair.name === flairName);
      if (flair) {
        const newSubredditList = [...subredditList];
        newSubredditList[selectedIndex].defaults.flair = flair;
        setSubredditList(newSubredditList);
      }
    }
  };

  const handleDefaultTitleChange = (title: string): void => {
    if (typeof selectedIndex !== "undefined") {
      const newSubredditList = [...subredditList];
      newSubredditList[selectedIndex].defaults.title = title;
      setSubredditList(newSubredditList);
    }
  };

  const handleDefaultTagChange = (tags: string[]): void => {
    if (typeof selectedIndex !== "undefined") {
      const newSubredditList = [...subredditList];
      newSubredditList[selectedIndex].defaults.tags = tags as Tags[];
      setSubredditList(newSubredditList);
    }
  };

  const handleDefaultPixivChange = (tagName: string): void => {
    if (typeof selectedIndex !== "undefined") {
      const newSubredditList = [...subredditList];
      const selectedPixivTag = newSubredditList[selectedIndex].pivixTags.find(
        (pixivTag) => pixivTag.enName === tagName
      );
      newSubredditList[selectedIndex].defaults.pixivTag = selectedPixivTag;
      setSubredditList(newSubredditList);
    }
  };

  const handlePageChange = (page: string): void => {
    if (typeof selectedIndex !== "undefined") {
      const newSubredditList = [...subredditList];
      newSubredditList[selectedIndex].currentPage = page;
      setSubredditList(newSubredditList);
    }
  };

  const handleCreateCategoryChange = (categoryName: string): void => {
    setCategoryField(categoryName);
  };

  const handleCreateCategory = (): void => {
    if (typeof selectedIndex !== "undefined") {
      const newSubredditList = [...subredditList];
      newSubredditList[selectedIndex].categories.push(categoryField);
      setSubredditList(newSubredditList);
      setCategoryField("");
    }
  };

  const handleDeleteCategoryChange = (category: string): void => {
    setRemoveCategory(category);
  };

  const handleDeleteCategory = (): void => {
    setRemoveCategory("");
    const newSubredditList = subredditList.map((subreddit) => {
      subreddit.categories = subreddit.categories.filter((category) => category !== removeCategory);
      return subreddit;
    });
    setSubredditList(newSubredditList);
  };

  const handleCreatePixivTagChange = (pixivTag: string): void => {
    setCreatePixivTag(pixivTag);
  };

  const handleCreatePixivTag = async (): Promise<void> => {
    const pixivTag = await getPixivTag(createPixivTag);
    if (
      pixivTag &&
      typeof selectedIndex !== "undefined" &&
      !subredditList[selectedIndex].pivixTags.find((tag) => tag.jpName === pixivTag.jpName)
    ) {
      const newSubredditList = [...subredditList];
      newSubredditList[selectedIndex].pivixTags.push(pixivTag);
      setSubredditList(newSubredditList);
    }
  };

  const handleDeletePixivTag = (): void => {
    if (typeof selectedIndex !== "undefined") {
      const newSubredditList = [...subredditList];
      newSubredditList[selectedIndex].pivixTags = newSubredditList[selectedIndex].pivixTags.filter(
        (pixivTag) => pixivTag.enName !== deletePixivTag
      );
      setSubredditList(newSubredditList);
      setDeletePixivTag("");
    }
  };

  const handleDeletePixivTagChange = (pixivTag: string): void => {
    setDeletePixivTag(pixivTag);
  };

  const handleCancel = (): void => {
    setSelectedIndex(undefined);
  };

  const handleSaveChanges = async (): Promise<void> => {
    const saveAllConfirmantion = confirm("Are you sure you'd like to your save changes?");

    if (!saveAllConfirmantion) return;

    const res = await saveSubreddits(subredditList);
    if (res.ok) {
      handleCancel();
    } else {
      alert("Save failed!");
    }
  };

  const handleReIndex = async (): Promise<void> => {
    const userIndexConfirmation = !confirm("This will remove any unsaved changes. Are you sure you want to continue?");
    if (userIndexConfirmation) return;

    if (typeof selectedIndex !== "undefined") {
      const selectedSubreddit = subredditList[selectedIndex];
      const res = await indexSubreddit(selectedSubreddit.name);
      if (res.ok) {
        const newList = await res.json();
        setSubredditList([...newList]);
      }
    }
  };

  const handleResetSelected = (): void => {
    if (typeof selectedIndex !== "undefined") {
      const newSubredditList = [...subredditList];
      const newSelectedSubreddit = newSubredditList[selectedIndex];
      newSelectedSubreddit.categories = [];
      newSelectedSubreddit.notes = "";
      newSelectedSubreddit.pivixTags = [];
      newSelectedSubreddit.defaults = {
        title: "",
        tags: [],
        flair: null,
        pixivTag: undefined,
      };
      setSubredditList(newSubredditList);
    }
  };

  const handleResetAll = (): void => {
    const resetAllConfirmantion = confirm("Are you sure you want to delete all?");
    if (!resetAllConfirmantion) return;
    if (typeof selectedIndex !== "undefined") {
      const newSubredditList = [...subredditList];
      for (const subreddit of newSubredditList) {
        subreddit.categories = [];
        subreddit.notes = "";
        subreddit.pivixTags = [];
        subreddit.defaults = {
          title: "",
          tags: [],
          flair: null,
          pixivTag: undefined,
        };
      }
      setSubredditList(newSubredditList);
    }
  };

  const handleDeleteAll = (): void => {
    const deleteAllConfirmation = confirm("Are you sure you want to delete all?");
    if (deleteAllConfirmation) setSubredditList([]);
  };

  const handleDeleteAllCategories = (): void => {
    const deleteAllCategoriesConfirmation = confirm("Are you sure you want to delete all categories?");
    if (deleteAllCategoriesConfirmation) {
      const newSubredditList = subredditList.map((subreddit) => {
        subreddit.categories = [];
        return subreddit;
      });
      setSubredditList(newSubredditList);
    }
  };

  let categoryList: string[] = [];
  subredditList.forEach((subreddit) => (categoryList = [...new Set([...categoryList, ...subreddit.categories])]));

  const selectedSubreddit = subredditList[selectedIndex || 0];

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
        resultsPerPageOptions={resultsPerPageOptions}
        intialResultsPerPage={resultsPerPageOptions[2]}
      />
      <SearchHeaderWrapper>
        <FlexWrapper>
          <ListOptions>
            <h4>Options</h4>
          </ListOptions>
          <ListName>
            <h4>Subreddit</h4>
          </ListName>
        </FlexWrapper>
      </SearchHeaderWrapper>
      {paginatedResults.length ? (
        <>
          {paginatedResults.map((subreddit, i) => {
            return (
              <SearchResult key={i}>
                <ListOptions>
                  <Icon className="bx bxs-edit-alt" onClick={editSubreddit(subreddit)} title="Edit Subreddit" />
                  <Icon className="bx bx-link" onClick={copyLink(subreddit.name)} title="Copy Link" />
                  <a href={"https://www.reddit.com" + subreddit.info.url} target="_blank" rel="noreferrer">
                    <Icon title="Open in New Tab" className="bx bx-link-external" />
                  </a>
                  <Icon className="bx bx-x" title="Delete Subreddit" onClick={handleRemoveSubreddit(subreddit.name)} />
                </ListOptions>
                <ListName>{subreddit.name}</ListName>
              </SearchResult>
            );
          })}
        </>
      ) : (
        <NoSearchResults>No Subreddits Found!</NoSearchResults>
      )}
      <Gradient type="text">
        <h2>EDIT</h2>
      </Gradient>
      <hr />
      {typeof selectedIndex !== "undefined" && selectedSubreddit ? (
        <>
          <EditHeader>DETAILS</EditHeader>
          <FlexWrapper>
            <h4>Name: </h4>
            <a href={"https://www.reddit.com" + selectedSubreddit.info.url} target="_blank" rel="noreferrer">
              {"r/" + selectedSubreddit.name}
            </a>
          </FlexWrapper>
          <FlexWrapper>
            <h4>R18+: </h4>
            {selectedSubreddit.info.isNSFW ? "Yes" : "No"}
          </FlexWrapper>
          <FlexWrapper>
            <h4>Flairs: </h4>
            <Ellipsis>
              {selectedSubreddit.info.flairs
                .map((flair) => flair.name)
                .join(", ")
                .toString()}
            </Ellipsis>
          </FlexWrapper>
          <ButtonBase>
            <Button onClick={handleReIndex}>Re-Index Subreddit</Button>
          </ButtonBase>
          <EditHeader>GENERAL</EditHeader>
          <FlexWrapper>
            <InputText>
              <ButtonBase>Flair:</ButtonBase>
            </InputText>
            <InputFields>
              <Select
                options={selectedSubreddit.info.flairs.map((flair) => flair.name)}
                onChange={handleDefaultFlairChange}
                value={selectedSubreddit.defaults.flair?.name || ""}
                isClearable
              />
            </InputFields>
          </FlexWrapper>
          <FlexWrapper>
            <InputText>
              <ButtonBase>Title:</ButtonBase>
            </InputText>
            <InputFields>
              <TextField
                onChange={handleDefaultTitleChange}
                value={selectedSubreddit.defaults.title}
                placeholder="Title..."
              />
            </InputFields>
          </FlexWrapper>
          <FlexWrapper>
            <InputText>
              <ButtonBase>Tags:</ButtonBase>
            </InputText>
            <InputFields>
              <Select
                options={["NSFW", "OC", "Spoiler"]}
                onChange={handleDefaultTagChange}
                value={selectedSubreddit.defaults.tags}
                isClearable
                isMulti
              />
            </InputFields>
          </FlexWrapper>
          <FlexWrapper>
            <InputText>
              <ButtonBase>Pixiv:</ButtonBase>
            </InputText>
            <InputFields>
              <Select
                options={selectedSubreddit.pivixTags.map((pixivTag) => pixivTag.enName)}
                onChange={handleDefaultPixivChange}
                value={selectedSubreddit.defaults.pixivTag?.enName ?? ""}
                isClearable
              />
            </InputFields>
          </FlexWrapper>
          <FlexWrapper>
            <InputText>
              <Button onClick={handleCancel}>Cancel</Button>
            </InputText>
            <InputText>
              <Button onClick={handleResetSelected}>Reset To Default</Button>
            </InputText>
          </FlexWrapper>
          <EditHeader>CATEGORIES</EditHeader>
          <InputFields>
            <Select
              options={categoryList}
              onChange={handleCategoryChange}
              value={selectedSubreddit.categories}
              isMulti
              isClearable
            />
          </InputFields>
          <FlexWrapper>
            <ButtonBase>
              <Button onClick={handleCreateCategory}>Create Category</Button>
            </ButtonBase>
            <InputFields>
              <TextField onChange={handleCreateCategoryChange} value={categoryField} placeholder="Category Name" />
            </InputFields>
          </FlexWrapper>
          <EditHeader>PIXIV TAGS</EditHeader>
          <h4>Tags: </h4>
          {selectedSubreddit.pivixTags.map((tag, i) => {
            return (
              <span key={i}>
                <a href={tag.link + "/artworks"} target="_blank" rel="noreferrer">
                  {tag.enName}{" "}
                </a>
                {i !== selectedSubreddit.pivixTags.length - 1 && " | "}
              </span>
            );
          })}
          <FlexWrapper>
            <ButtonBase>
              <Button onClick={handleCreatePixivTag}>Add Pixiv Tag</Button>
            </ButtonBase>
            <InputFields>
              <TextField onChange={handleCreatePixivTagChange} value={createPixivTag} placeholder="Tag Link" />
            </InputFields>
          </FlexWrapper>
          <FlexWrapper>
            <InputFields>
              <Select
                options={selectedSubreddit.pivixTags.map((tag) => tag.enName)}
                onChange={handleDeletePixivTagChange}
                value={deletePixivTag}
              />
            </InputFields>
            <ButtonBase>
              <Button onClick={handleDeletePixivTag}>Delete Tag</Button>
            </ButtonBase>
          </FlexWrapper>
          <EditHeader>PAGE</EditHeader>
          <FlexWrapper>
            <InputText>
              <ButtonBase>Page:</ButtonBase>
            </InputText>
            <InputFields>
              <TextField
                onChange={handlePageChange}
                value={selectedSubreddit.currentPage.toString()}
                placeholder="Page..."
              />
            </InputFields>
          </FlexWrapper>
        </>
      ) : (
        <NoSearchResults>No Subreddit Selected!</NoSearchResults>
      )}

      <Gradient type="text">
        <h2>ALL SUBREDDITS</h2>
      </Gradient>
      <hr />
      <FlexWrapper>
        <NewSubredditButton>
          <Button onClick={handleAddSubreddit}>Add Subreddit</Button>
        </NewSubredditButton>
        <NewSubredditTitle>
          <TextField
            onChange={handleNewSubredditChange}
            value={newSubreddit}
            placeholder="Subreddit Name"
            prefix="r/"
          />
        </NewSubredditTitle>
      </FlexWrapper>
      <FlexWrapper>
        <ButtonBase>
          <Button onClick={handleDeleteCategory}>Delete Category</Button>
        </ButtonBase>
        <InputFields>
          <Select options={categoryList} onChange={handleDeleteCategoryChange} value={removeCategory} />
        </InputFields>
      </FlexWrapper>
      <InputFields>
        <Button onClick={handleDeleteAllCategories}>Delete All Categories</Button>
      </InputFields>
      <FlexWrapper>
        <InputText>
          <Button onClick={handleResetAll}>Reset All To Default</Button>
        </InputText>
        <InputText>
          <Button onClick={handleDeleteAll}>Delete All Subreddits</Button>
        </InputText>
      </FlexWrapper>
      <InputFields>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </InputFields>
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

export default SubredditsPage;
