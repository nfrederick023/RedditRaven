import React, { FC, useRef, useState } from "react";
import styled from "styled-components";
import theme from "@client/utils/themes";

const SearchBarContent = styled.div`
  border: 1px solid ${theme.textContrast};
  color: ${theme.textContrast};
  border-radius: 5px;
  display: flex;
  margin: auto;
  padding: 5px;
  max-height: 32px;
  min-height: 32px;

  ${(props: { isFocused: boolean }): string =>
    props.isFocused ? `border: 1px solid ${theme.text};` : ""}

  &:hover {
    cursor: text;
  }
`;

const SearchBarInput = styled.input`
  border: 0px;
  margin: 0px 0px 0px 2px;
  color: ${theme.text};
  background-color: rgba(0, 0, 0, 0);
  &:focus {
    outline: none;
  }

  ::placeholder {
    color: ${theme.textContrast};
  }
`;

const SearchIcon = styled.i`
  font-size: 1.25rem !important;
  margin-left: 5px;
  padding-top: 1px;

  &::before {
    vertical-align: top;
  }
`;

interface SearchBarProps {
  onChange: (search: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ onChange }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  const handleSearchClick = (): void => {
    searchInput.current?.focus();
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>): void => {
    onChange(e.currentTarget.value);
  };

  const onFocus = (): void => {
    setIsFocused(true);
  };

  const onBlur = (): void => {
    setIsFocused(false);
  };

  return (
    <SearchBarContent
      onClick={handleSearchClick}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      isFocused={isFocused}
    >
      <SearchIcon className="bx bx-search" />
      <SearchBarInput
        ref={searchInput}
        onChange={handleInput}
        id="default-search"
        placeholder="Search"
        autoComplete="off"
      />
    </SearchBarContent>
  );
};

export default SearchBar;
