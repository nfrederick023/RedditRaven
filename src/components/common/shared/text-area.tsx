import { BluJayTheme } from "@client/utils/types";
import React, { FC, useRef, useState } from "react";
import styled from "styled-components";

const TextAreaContent = styled.div`
  border: 1px solid ${(p): string => p.theme.textContrast};
  color: ${(p): string => p.theme.textContrast};
  display: flex;
  margin: auto;
  border-radius: 5px;
  height: inherit;

  ${(p: { isFocused: boolean; theme: BluJayTheme }): string =>
    p.isFocused ? `border: 1px solid ${p.theme.text};` : ""}

  &:hover {
    cursor: text;
  }
`;

const TextAreaInput = styled.textarea`
  border: 0px;
  margin: 0px 0px 0px 2px;
  color: ${(p): string => p.theme.text};
  background-color: rgba(0, 0, 0, 0);
  resize: none;
  width: 100%;
  &:focus {
    outline: none;
  }

  ::placeholder {
    color: ${(p): string => p.theme.textContrast};
  }
`;

interface TextAreaProps {
  onChange: (text: string) => void;
  value: string;
}

const TextArea: FC<TextAreaProps> = ({ onChange, value }: TextAreaProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);

  const handleClick = (): void => {
    input.current?.focus();
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>): void => {
    onChange(e.currentTarget.value);
  };

  const onFocus = (): void => {
    setIsFocused(true);
  };

  const onBlur = (): void => {
    setIsFocused(false);
  };

  return (
    <TextAreaContent
      onClick={handleClick}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      isFocused={isFocused}
    >
      <TextAreaInput
        ref={input}
        onChange={handleInput}
        placeholder="Comment"
        value={value}
      />
    </TextAreaContent>
  );
};

export default TextArea;
