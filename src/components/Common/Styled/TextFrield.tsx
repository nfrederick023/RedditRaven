import React, { FC, useRef, useState } from "react";
import styled from "styled-components";
import theme from "@client/utils/themes";

const TextFieldContent = styled.div`
  border-bottom: 1px solid ${theme.textContrast};
  color: ${theme.textContrast};
  display: flex;
  margin: auto;
  padding: 5px;
  max-height: 32px;
  min-height: 32px;

  ${(props: { isFocused: boolean }): string =>
    props.isFocused ? `border-bottom: 1px solid ${theme.text};` : ""}

  &:hover {
    cursor: text;
  }
`;

const TextFieldInput = styled.input`
  border: 0px;
  margin: 0px 0px 0px 2px;
  color: ${theme.text};
  background-color: rgba(0, 0, 0, 0);
  width: 100%;

  &:focus {
    outline: none;
  }

  ::placeholder {
    color: ${theme.textContrast};
  }
`;

interface TextFieldProps {
  onChange: (text: string) => void;
  value: string;
}

const TextField: FC<TextFieldProps> = ({ onChange, value }: TextFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const handleClick = (): void => {
    input.current?.focus();
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
    <TextFieldContent
      onClick={handleClick}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      isFocused={isFocused}
    >
      <TextFieldInput
        ref={input}
        onChange={handleInput}
        placeholder="Title"
        value={value}
      />
    </TextFieldContent>
  );
};

export default TextField;
