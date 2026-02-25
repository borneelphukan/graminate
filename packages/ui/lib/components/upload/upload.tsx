import * as React from "react";
import {
  useDropzone,
  type DropzoneOptions,
  type FileRejection,
} from "react-dropzone";
import { cn } from "../../utils";
import { Icon } from "../icon/icon";
import { Button } from "../button/button";

interface UploadProps extends Omit<DropzoneOptions, "onDrop"> {
  value?: File[];
  onValueChange?: (files: File[]) => void;
  className?: string;
  maxSizeInMB?: number;
  showList?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const Upload = React.forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      value = [],
      onValueChange,
      className,
      maxSizeInMB = 5,
      showList = true,
      maxSize = maxSizeInMB * 1024 * 1024,
      accept,
      multiple = false,
      ...props
    },
    ref
  ) => {
    const onDrop = React.useCallback(
      (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
          console.warn("Files rejected:", fileRejections);
        }

        const newFiles = multiple
          ? [...value, ...acceptedFiles]
          : acceptedFiles;
        onValueChange?.(newFiles);
      },
      [multiple, onValueChange, value]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      maxSize,
      accept,
      multiple,
      ...props,
    });

    const removeFile = (indexToRemove: number) => {
      const newFiles = value.filter((_, index) => index !== indexToRemove);
      onValueChange?.(newFiles);
    };

    const acceptString = accept
      ? Object.values(accept)
          .flat()
          .map((ext) => ext.replace(".", "").toUpperCase())
          .join(", ")
      : "";

    return (
      <div ref={ref} className={cn("flex flex-col gap-4", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "border-dashed border-[oklch(var(--neutral-dark-gray)_/_30%)] hover:border-[oklch(var(--neutral-dark-gray)_/_50%)] cursor-pointer rounded-[var(--radius-lg)] border p-8 text-center transition-colors",
            isDragActive && "border-brand-green bg-brand-green/5",
            "flex flex-col items-center justify-center gap-2"
          )}
        >
          <input {...getInputProps()} />
          <div className="text-neutral-dark-gray/40 mb-2">
            <Icon
              type="description"
              size="lg"
              className="!text-5xl text-neutral-300"
            />
          </div>
          <div className="text-neutral-dark-gray">
            <span className="font-semibold text-brand-green">Select File</span>{" "}
            or Drag and Drop
          </div>
          <div className="text-neutral-dark-gray/60 text-sm">
            Dateien | max. {maxSizeInMB} MB
          </div>
        </div>
        {acceptString && (
          <div className="text-neutral-dark-gray/60 text-xs mt-1">
            Supported File Formats: {acceptString}
          </div>
        )}

        {showList && value.length > 0 && (
          <div className="flex flex-col gap-2">
            {value.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="bg-neutral-light-gray/50 border-neutral-dark-gray/10 flex items-center justify-between rounded-[var(--radius-md)] border p-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex size-10 shrink-0 items-center justify-center">
                    <Icon type="description" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-neutral-900">
                      {file.name}
                    </span>
                    <span className="text-neutral-dark-gray/60 text-xs">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <Icon
                    type="delete"
                    className="text-neutral-dark-gray/60 hover:text-red-500"
                  />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Upload.displayName = "Upload";

export { Upload, type UploadProps };
