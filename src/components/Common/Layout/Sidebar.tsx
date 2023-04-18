import { useWindowWidth } from "@react-hook/window-size";
import Gradient from "../Styled/Gradient";
import NoSSR from "@mpth/react-no-ssr";
import React, { FC, useEffect, useState } from "react";
import SideBarButton from "./SideBarButton";
import styled from "styled-components";
import theme from "@client/utils/themes";

const SidebarWapper = styled.div`
  background: ${theme.backgroundContrast};

  min-width: 210px;
  max-width: 210px;
  transition: 0.2s;
  user-select: none;
  min-height: 100vh;
  position: sticky;
  z-index: 1;

  @media (max-width: ${theme.tabletScreenSize}px) {
    position: fixed;
    min-width: 100%;
    height: 100%;

    ${(props: { isCollapsed: boolean }): string =>
      props.isCollapsed ? "min-width: 60px; left: -60px;" : ""}
  }

  ${(props: { isCollapsed: boolean }): string =>
    props.isCollapsed ? "max-width: 48px; min-width: 48px;" : ""}
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

  @media (max-width: ${theme.tabletScreenSize}px) {
    max-width: 100%;
    width: 100%;
  }
`;

const Logo = styled.div`
  width: 100%;
  padding: 5px;
  margin-bottom: 5px;
  text-align: center;
  @media (max-width: ${theme.tabletScreenSize}px) {
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
  border-right: ${theme.backgroundContrast} 1px solid;
  position: absolute;
  right: 0px;
  min-height: inherit;
  width: 20px;
  &:hover {
    transition: 0.2s;
    border-right: ${theme.highlightLight} 1px solid;
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
    if (width <= theme.mobileScreenSize) {
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
          {width <= theme.tabletScreenSize ? (
            <BarsIcon
              onClick={handleIsCollapsedChange}
              className="bx bx-menu bx-lg"
            />
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
                  <Gradient type="text">
                    <h1>REDDIT</h1>
                  </Gradient>
                  <h1>RAVEN</h1>
                </Logo>
                <SideBarButton
                  title={"Dashboard"}
                  icon={"bx bxs-dashboard"}
                  url={""}
                />

                <SideBarButton
                  title={"Schedule"}
                  icon={"bx bx-time"}
                  url={"favorites"}
                />

                <SideBarButton
                  title={"Subreddits"}
                  icon={"bx bx-list-ul bx-sm"}
                  url={"all"}
                />

                <SideBarButton
                  title={"Stats"}
                  icon={"bx bx-stats"}
                  url={"library"}
                />
              </>
            )}
          </SidebarContent>
        </SidebarWapper>
      </NoSSR>
    </>
  );
};

export default Sidebar;
