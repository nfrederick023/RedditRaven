import React, { FC } from "react";
import styled from "styled-components";
import theme from "@client/utils/themes";

const ContrastTexWrapper = styled.span`
  color: ${(p): string => p.theme.textContrast};
  ${(props: { type: ContrastTypes }): string => {
    if (props.type === "light")
      return `color: ${(p): string => p.theme.textContrastLight};`;
    if (props.type === "regular")
      return `color: ${(p): string => p.theme.textContrast};`;
    return "";
  }}
`;

type ContrastTypes = "light" | "regular";

interface ContrastTextProps {
  children: React.ReactNode;
  type: ContrastTypes;
}

const ContrastText: FC<ContrastTextProps> = ({
  children,
  type,
}: ContrastTextProps) => {
  return <ContrastTexWrapper type={type}>{children}</ContrastTexWrapper>;
};

export default ContrastText;
