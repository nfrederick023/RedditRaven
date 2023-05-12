import { BluJayTheme } from "@client/utils/types";
import React from "react";
import styled from "styled-components";

export type FileUploadProps = {
  imageButton?: boolean;
  hoverLabel?: string;
  dropLabel?: string;
  width?: string;
  height?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
};

const FileUploadWrapper = styled.div`
  width: 100%;
  height: 100%;
  color: ${(p): string => p.theme.textContrast};

  &:hover {
    color: ${(p): string => p.theme.text};
  }

  color: ${(p: { isDragOver: boolean; theme: BluJayTheme }): string =>
    p.isDragOver ? p.theme.text : p.theme.textContrast};
`;

const FileUploadInput = styled.input`
  display: none;
`;

const FileUploadLabel = styled.label`
  cursor: pointer;
`;

const LabelWrapper = styled.div`
  display: grid;
  height: 100%;
`;

const UploadIcon = styled.i`
  font-size: 2em;
  margin: auto;
  margin-bottom: 0px;
`;

const LabelText = styled.div`
  margin: auto;
  margin-top: 0px;
`;

export const FileUpload: React.FC<FileUploadProps> = (
  props: FileUploadProps
) => {
  const imageButton = props.imageButton ?? false;
  const hoverLabel = props.hoverLabel ?? "Click or drag to upload file";
  const dropLabel = props.dropLabel ?? "Drop file here";

  const [labelText, setLabelText] = React.useState<string>(hoverLabel);
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);
  const [isMouseOver, setIsMouseOver] = React.useState<boolean>(false);
  const stopDefaults = (e: React.DragEvent): void => {
    e.stopPropagation();
    e.preventDefault();
  };
  const dragEvents = {
    onMouseEnter: (): void => {
      setIsMouseOver(true);
    },
    onMouseLeave: (): void => {
      setIsMouseOver(false);
    },
    onDragEnter: (e: React.DragEvent): void => {
      stopDefaults(e);
      setIsDragOver(true);
      setLabelText(dropLabel);
    },
    onDragLeave: (e: React.DragEvent): void => {
      stopDefaults(e);
      setIsDragOver(false);
      setLabelText(hoverLabel);
    },
    onDragOver: stopDefaults,
    onDrop: (e: React.DragEvent<HTMLElement>): void => {
      stopDefaults(e);
      setLabelText(hoverLabel);
      setIsDragOver(false);
      props.onDrop(e);
    },
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    props.onChange(event);
  };

  return (
    <FileUploadWrapper isDragOver={isDragOver}>
      <FileUploadInput
        onChange={handleChange}
        onClick={(event): void => {
          event.currentTarget.value = "";
        }}
        id="file-upload"
        type="file"
      />

      <FileUploadLabel htmlFor="file-upload" {...dragEvents}>
        {(!imageButton || isDragOver || isMouseOver) && (
          <LabelWrapper>
            <UploadIcon className="bx bx-cloud-upload"></UploadIcon>
            <LabelText>{labelText}</LabelText>
          </LabelWrapper>
        )}
      </FileUploadLabel>
    </FileUploadWrapper>
  );
};
