import { BluJayTheme } from "@client/utils/types";
import React, { FC, useRef, useState } from "react";
import styled from "styled-components";

const SearchBarContent = styled.div`
  border: 1px solid ${(p): string => p.theme.textContrast};
  color: ${(p): string => p.theme.textContrast};
  border-radius: 5px;
  display: flex;
  margin: auto;
  padding: 5px;
  max-height: 32px;
  min-height: 32px;

  ${(p: { isFocused: boolean; theme: BluJayTheme }): string =>
    p.isFocused ? `border: 1px solid ${p.theme.text};` : ""}

  &:hover {
    cursor: text;
  }
`;

const SearchBarInput = styled.input`
  border: 0px;
  margin: 0px 0px 0px 2px;
  color: ${(p): string => p.theme.text};
  background-color: rgba(0, 0, 0, 0);
  width: 100%;

  &:focus {
    outline: none;
  }

  ::placeholder {
    color: ${(p): string => p.theme.textContrast};
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
  value: string;
}

const SearchBar: FC<SearchBarProps> = ({ onChange, value }: SearchBarProps) => {
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
        value={value}
      />
    </SearchBarContent>
  );
};

export default SearchBar;
