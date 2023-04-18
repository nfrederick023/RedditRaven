import React, { FC, useState } from "react";
import styled from "styled-components";
import theme from "@client/utils/themes";

const SelectBoxWrapper = styled.div`
  position: relative;
`;

const SelectBox = styled.div`
  border: 1px solid ${theme.textContrast};
  color: ${theme.textContrast};
  border-radius: 5px;
  box-shadow: 0 0 0 0px;
  padding: 4px 0px 0px 4px;
  min-height: 32px;
  display: flex;

  user-select: none;
  &:hover {
    cursor: pointer;
    border: 1px solid ${theme.text};
  }

  ${(props: { isFocused: boolean }): string =>
    props.isFocused ? `border: 1px solid ${theme.text};` : ""}

  i {
    color: ${theme.textContrast};

    &:hover {
      color: ${theme.text};
    }
  }
`;

const UnselectedBox = styled.div`
  position: absolute;
  max-height: 250px;
  overflow-y: auto;
  width: 100%;
  padding: 5px;
  margin-top: 10px;
  background-color: ${theme.backgroundContrast};
  border-radius: 5px;
  z-index: 100;
`;

const UnselectedOption = styled.div`
  padding: 5px;
  color: ${theme.textContrast};
  border: 1px solid ${theme.backgroundContrast};

  &:hover {
    color: ${theme.text};
    cursor: pointer;
    border: 1px solid ${theme.textContrast};
    border-radius: 5px;
  }
`;

const SelectedBox = styled.div`
  width: 95%;
  display: flex;
  flex-wrap: wrap;
`;

const SelectedOption = styled.div`
  border: 1px solid ${theme.textContrast};
  border-radius: 5px;
  margin: 0px 4px 4px 0px;
  padding: 0px 0px 1px 6px;
  font-size: 85%;

  ${(props: { isMulti: boolean | undefined }): string =>
    props.isMulti ? "" : "border: 0px; font-size: 1rem;"}
`;

const SelectedIcon = styled.i`
  font-size: 110%;
  padding-top: 1px;
  margin-right: 3px;

  ::before {
    vertical-align: middle;
  }
`;

const RightIcons = styled.i`
  text-align: right;
  display: flex;

  i {
    font-size: 1.25rem;
    margin: 1px 3px 0px 3px;
  }
`;

const ClearButton = styled.div`
  border-right: 1px solid ${theme.textContrast};
  height: 85%;
`;

const PlaceHolderText = styled.div`
  margin: auto;
  margin-right: 0px;
  margin-left: 10px;
  padding-bottom: 5px;
`;

type SelectOptions = string[] & string;

interface SelectProps {
  options: string[];
  isMulti?: boolean;
  isClearable?: boolean;
  defaultSelected?: string;
  onChange: (options: SelectOptions) => void;
}

const Select: FC<SelectProps> = ({
  options,
  isMulti,
  isClearable,
  defaultSelected,
  onChange,
}: SelectProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isUnselectedFocus, setIsUnselectedFocus] = useState(false);
  const handleAddOption = (option: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    let newOptions: string[];
    if (isMulti) {
      newOptions = [...selectedOptions, option];
      onChange(newOptions as SelectOptions);
    } else {
      newOptions = [option];
      onChange(option as SelectOptions);
      setIsOpen(false);
    }
    setSelectedOptions(newOptions);
  };

  const handleRemoveOption = (option: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const newOptions = [
      ...selectedOptions.filter((selectedOption) => selectedOption !== option),
    ];
    setSelectedOptions(newOptions);
    onChange(newOptions as SelectOptions);
  };

  const handleRemoveAll = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setSelectedOptions([]);
    if (isMulti) {
      onChange([] as string[] as SelectOptions);
    } else {
      onChange(
        defaultSelected
          ? (defaultSelected as SelectOptions)
          : ("Select..." as SelectOptions)
      );
    }
  };

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const mouseDown = (): void => {
    setIsUnselectedFocus(true);
  };

  const mouseUp = (): void => {
    setIsUnselectedFocus(false);
  };

  const onBlur = (): void => {
    if (!isUnselectedFocus) {
      setIsOpen(false);
    }
  };

  if (!selectedOptions.length && defaultSelected)
    setSelectedOptions([defaultSelected]);

  const unselectedOptions = options.filter(
    (option) => !selectedOptions.includes(option)
  );

  return (
    <SelectBoxWrapper>
      <SelectBox
        tabIndex={0}
        onClick={handleClick}
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        onBlur={onBlur}
        isFocused={isOpen}
      >
        <SelectedBox>
          {selectedOptions.length ? (
            <>
              {selectedOptions.map((selectedOption, i) => {
                return (
                  <SelectedOption key={i} isMulti={isMulti}>
                    {selectedOption}
                    {isMulti && (
                      <SelectedIcon
                        className="bx bx-x"
                        onClick={handleRemoveOption(selectedOption)}
                      ></SelectedIcon>
                    )}
                  </SelectedOption>
                );
              })}
            </>
          ) : (
            <PlaceHolderText>Select...</PlaceHolderText>
          )}
        </SelectedBox>
        <RightIcons>
          {isClearable && (
            <ClearButton onClick={handleRemoveAll}>
              <i className="bx bx-x"></i>
            </ClearButton>
          )}
          <div>
            <i className="bx bxs-chevron-down"></i>
          </div>
        </RightIcons>
      </SelectBox>

      {isOpen && (
        <UnselectedBox
          tabIndex={0}
          onMouseDown={mouseDown}
          onMouseUp={mouseUp}
          onBlur={onBlur}
        >
          {unselectedOptions.length ? (
            <>
              {unselectedOptions.map((option, i) => {
                return (
                  <UnselectedOption key={i} onClick={handleAddOption(option)}>
                    {option}
                  </UnselectedOption>
                );
              })}
            </>
          ) : (
            <UnselectedOption>No Options</UnselectedOption>
          )}
        </UnselectedBox>
      )}
    </SelectBoxWrapper>
  );
};

export default Select;
