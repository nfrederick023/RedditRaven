import { BluJayTheme } from "@client/utils/types";
import React, { FC, useRef, useState } from "react";
import styled from "styled-components";

const TextFieldContent = styled.div`
  border-bottom: 1px solid ${(p): string => p.theme.textContrast};
  color: ${(p): string => p.theme.textContrast};
  display: flex;
  padding: 5px;
  max-height: 32px;
  min-height: 32px;

  ${(p: { isFocused: boolean; theme: BluJayTheme }): string =>
    p.isFocused ? `border-bottom: 1px solid ${p.theme.text};` : ""}

  &:hover {
    cursor: text;
  }
`;

const TextFieldInput = styled.input`
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

interface TextFieldProps {
  onChange: (text: string) => void;
  value: string;
  placeholder: string;
  prefix?: string;
}

const TextField: FC<TextFieldProps> = ({
  onChange,
  value,
  placeholder,
  prefix,
}: TextFieldProps) => {
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
      {prefix}
      <TextFieldInput
        ref={input}
        onChange={handleInput}
        placeholder={placeholder}
        value={value}
      />
    </TextFieldContent>
  );
};

export default TextField;
