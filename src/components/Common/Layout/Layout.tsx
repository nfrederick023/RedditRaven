import React, { FC } from "react";
import Sidebar from "./Sidebar";
import styled from "styled-components";

const FlexContainer = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  margin: 20px;
  width: 90%;
  max-width: 1200px;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }: LayoutProps) => {
  return (
    <FlexContainer>
      <Sidebar />
      <MainContent>
        <ContentWrapper>{children}</ContentWrapper>
      </MainContent>
    </FlexContainer>
  );
};

export default Layout;
