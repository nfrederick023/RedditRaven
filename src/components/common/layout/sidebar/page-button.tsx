import { useRouter } from "next/router";
import Gradient from "../../shared/gradient";
import React, { FC } from "react";
import styled from "styled-components";

const ButtonWrapper = styled.div`
  width: 100%;
  color: ${(p): string => p.theme.textContrast};
  border-radius: 5px;
  margin-left: 10px;
  line-height: 5px;

  height: 38px;

  &:hover {
    cursor: pointer;
    color: ${(p): string => p.theme.text};
  }

  > span {
    border-radius: 12px;
    height: 34px;
    align-items: center;
    display: flex;
    padding-left: 8px;
  }
`;

const Icon = styled.i`
  padding-right: 10px;
  font-size: 1.5rem;
  padding-bottom: 1px;
  vertical-align: middle;
`;

const WhiteColor = styled.div`
  color: white;
`;

interface PageButtonProps {
  title: string;
  icon: string;
  url: string;
}

const PageButton: FC<PageButtonProps> = ({
  title,
  icon,
  url,
}: PageButtonProps) => {
  const isSelected = window.location.pathname === url;
  const router = useRouter();
  const navigateToPage = (): void => {
    router.push(url);
  };
  return (
    <>
      <ButtonWrapper onClick={navigateToPage}>
        {isSelected ? (
          <Gradient type="background">
            <WhiteColor>
              <Icon className={icon} />
              {title}
            </WhiteColor>
          </Gradient>
        ) : (
          <span>
            <Icon className={icon} />
            {title}
          </span>
        )}
      </ButtonWrapper>
    </>
  );
};

export default PageButton;
