import { screenSizes } from "@client/utils/themes";
import { useWindowWidth } from "@react-hook/window-size";
import NoSSR from "@mpth/react-no-ssr";
import PageButton from "./page-button";
import React, { FC, useEffect, useState } from "react";
import styled from "styled-components";

const SidebarWapper = styled.div`
  background: ${(p): string => p.theme.backgroundContrast};

  min-width: 210px;
  max-width: 210px;
  transition: 0.2s;
  user-select: none;
  min-height: 100vh;
  position: sticky;
  z-index: 1;

  @media (max-width: ${screenSizes.tabletScreenSize}px) {
    position: fixed;
    min-width: 100%;
    height: 100%;

    ${(props: { isCollapsed: boolean }): string => (props.isCollapsed ? "min-width: 60px; left: -60px;" : "")}
  }

  ${(props: { isCollapsed: boolean }): string => (props.isCollapsed ? "max-width: 1px; min-width: 1px;" : "")}
`;

const SidebarContent = styled.div`
  max-width: inherit;
  min-width: inherit;
  justify-content: center;
  display: flex;
  position: fixed;
  flex-wrap: wrap;
  padding-right: 10px;
  padding-top: 20px;

  @media (max-width: ${screenSizes.tabletScreenSize}px) {
    max-width: 100%;
    width: 100%;
  }
`;

const Logo = styled.div`
  width: 100%;
  padding: 5px;
  margin-bottom: 5px;
  text-align: center;

  @media (max-width: ${screenSizes.tabletScreenSize}px) {
    font-size: 1.75em;
    padding-top: 50px;
    padding-left: 20px;
  }
`;

const BarsIcon = styled.i`
  position: fixed;
  left: 10px;
  top: -2px;
  font-size: 3rem !important;
  z-index: 2;
`;

const MinimizeButton = styled.div`
  position: absolute;
  min-width: inherit;
  min-height: 100%;
  z-index: -1;
`;

const ArrowIconContainer = styled.div`
  border-right: ${(p): string => p.theme.backgroundContrast} 1px solid;
  position: absolute;
  right: 0px;
  min-height: inherit;
  width: 20px;
  &:hover {
    transition: 0.2s;
    border-right: ${(p): string => p.theme.highlightLight} 1px solid;
    cursor: pointer;
  }
`;

const ArrowIcon = styled.div`
  position: absolute;
  min-height: inherit;
  right: -10px;
  width: 30px;
  &:hover {
    cursor: pointer;
  }
`;

const Sidebar: FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const width = useWindowWidth({ wait: 10 });

  useEffect(() => {
    if (width <= screenSizes.mobileScreenSize) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, []);

  const handleIsCollapsedChange = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <NoSSR>
        <SidebarWapper isCollapsed={isCollapsed}>
          {width <= screenSizes.tabletScreenSize ? (
            <BarsIcon onClick={handleIsCollapsedChange} className="bx bx-menu bx-lg" />
          ) : (
            <MinimizeButton>
              <ArrowIconContainer>
                <ArrowIcon onClick={handleIsCollapsedChange} />
              </ArrowIconContainer>
            </MinimizeButton>
          )}
          <SidebarContent>
            {!isCollapsed && (
              <>
                <Logo>
                  <h1>REDDIT</h1>
                  <h1>RAVEN</h1>
                </Logo>
                <PageButton title={"Post"} icon={"bx bxs-dashboard"} url={"/"} />
                <PageButton title={"Classic"} icon={"bx bxs-cube"} url={"/classic"} />

                <PageButton title={"Schedule"} icon={"bx bx-time"} url={"/schedule"} />

                <PageButton title={"Subreddits"} icon={"bx bx-list-ul"} url={"/subreddits"} />

                <PageButton title={"Stats"} icon={"bx bx-stats"} url={"/stats"} />
              </>
            )}
          </SidebarContent>
        </SidebarWapper>
      </NoSSR>
    </>
  );
};

export default Sidebar;
