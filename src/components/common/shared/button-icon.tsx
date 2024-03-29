import { BluJayTheme } from "@client/utils/types";
import React, { FC, MouseEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Button = styled.div`
  user-select: none;
  background: ${(p: { isSelected: boolean; theme: BluJayTheme }): string =>
    p.isSelected ? p.theme.highlightDark : p.theme.button};
  border-radius: 8px;
  display: grid;
  white-space: pre;
  align-content: center;
  cursor: pointer;
  min-width: 38px;
  min-height: 38px;
  max-height: 38px;
  border: ${(p: { isSelected: boolean; theme: BluJayTheme }): string =>
      p.isSelected ? p.theme.highlightDark : p.theme.button}
    2px solid;

  &:hover {
    border: ${(p: { isSelected: boolean; theme: BluJayTheme }): string =>
        p.isSelected ? p.theme.hightlightSilver : p.theme.highlightDark}
      2px solid;
  }

  h6 {
    margin-right: 2px;
  }

  i {
    margin: auto;
    margin-top: 1px;
    padding-right: 1px;
    font-size: 1.1em !important;
  }
`;

const Text = styled.h6`
  width: ${(p: { maxLength: number }): number => p.maxLength}ch;
`;

const IconWithText = styled.i`
  padding-right: 5px;
`;

const Wrapper = styled.div`
  width: 0px;
  height: 0px;
  right: ${(p: { isOffscreen: boolean }): string => (p.isOffscreen ? "-3px" : "0px")};
  position: relative;
  display: grid;
  justify-content: ${(p: { isOffscreen: boolean }): string => (p.isOffscreen ? "right" : "center")};
  justify-self: ${(p: { isOffscreen: boolean }): string => (p.isOffscreen ? "right" : "center")};
`;

const FlexBox = styled.div`
  text-align: center;
  display: flex;
`;

const Box = styled.div`
  animation: fadein 0.5s;
  right: 1px;

  white-space: nowrap;
  margin-top: 19px;
  background: ${(p): string => p.theme.button};
  padding: 10px;
  border-radius: 8px;
`;

const SelectedBox = styled(Box)`
  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  animation: fadeInOut 0.75s linear 1 forwards;
`;

interface ButtonIconProps {
  icon?: string;
  selectedIcon?: string;
  textOn?: string;
  textOff?: string;
  isSelected?: boolean;
  hoverTextOn?: string;
  hoverTextOff?: string;
  confrimTextOn?: string;
  confrimTextOff?: string;
  onClick?: (e: MouseEvent) => void;
}

const ButtonIcon: FC<ButtonIconProps> = ({
  icon,
  textOn,
  textOff,
  isSelected,
  selectedIcon,
  hoverTextOn,
  hoverTextOff,
  confrimTextOn,
  confrimTextOff,
  onClick,
}: ButtonIconProps) => {
  const [isHover, setIsHover] = useState(false);
  const [isOffscreen, setIsOffscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hoverEl = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (): void => {
    setIsHover(true);
  };

  const handleMouseLeave = (): void => {
    setIsHover(false);
  };

  const isElOffscreen = (): boolean => {
    let isOffscreen = false;
    if (hoverEl?.current) {
      const marginSize = 30;
      const rect = hoverEl.current.getBoundingClientRect();
      const viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
      isOffscreen = rect.x + rect.width >= viewWidth - marginSize;
    }
    return isOffscreen;
  };

  const handleClick = (e: MouseEvent): void => {
    if (confrimTextOn || confrimTextOff) {
      setIsPlaying(false);
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
      }, 750);
    }
    if (onClick) onClick(e);
  };

  const _icon = isSelected ? selectedIcon : icon;
  let confirmText = confrimTextOn || confrimTextOff;
  let hoverText = hoverTextOn || hoverTextOff;
  let _text = textOn || textOff;

  if (!isSelected && confrimTextOff) confirmText = confrimTextOff;
  if (!isSelected && hoverTextOff) hoverText = hoverTextOff;
  if (!isSelected && textOff) _text = textOff;

  const maxLength = Math.max(textOn?.length || 0, textOff?.length || 0) - 1;

  useEffect((): void => {
    setIsOffscreen(isElOffscreen());
  }, [isHover]);

  return (
    <>
      <Button
        onClick={handleClick}
        isSelected={isSelected || false}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {_text ? (
          <>
            <FlexBox>
              {icon && <IconWithText className={_icon} />}
              <Text maxLength={maxLength}>{_text}</Text>
            </FlexBox>
          </>
        ) : (
          <>{icon && <i className={_icon} />}</>
        )}
        {hoverText && !isPlaying && isHover && (
          <Wrapper isOffscreen={isOffscreen}>
            <Box ref={hoverEl}>{hoverText}</Box>
          </Wrapper>
        )}
        {confirmText && isPlaying && (
          <Wrapper isOffscreen={isOffscreen}>
            <SelectedBox>{confirmText}</SelectedBox>
          </Wrapper>
        )}
      </Button>
    </>
  );
};

export default ButtonIcon;
