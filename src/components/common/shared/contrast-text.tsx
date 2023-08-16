import { BluJayTheme } from "@client/utils/types";
import React, { FC } from "react";
import styled from "styled-components";

const ContrastTexWrapper = styled.span`
  color: ${(p: { type: ContrastTypes; theme: BluJayTheme }): string => p.theme.textContrast};
  ${(p): string => {
    if (p.type === "light") return `color: ${p.theme.textContrastLight};`;
    if (p.type === "regular") return `color: ${p.theme.textContrast};`;
    return "";
  }}
`;

type ContrastTypes = "light" | "regular";

interface ContrastTextProps {
  children: React.ReactNode;
  type: ContrastTypes;
}

const ContrastText: FC<ContrastTextProps> = ({ children, type }: ContrastTextProps) => {
  return <ContrastTexWrapper type={type}>{children}</ContrastTexWrapper>;
};

export default ContrastText;
