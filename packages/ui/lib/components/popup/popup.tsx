import type { ReactNode } from "react";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";

export type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  icon?: ReactNode;
  confirmButtonText?: string;
  confirmButtonColorClass?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  onConfirm?: () => void;
  variant?: "success" | "error" | "info" | "warning";
}

const Popup = ({
  isOpen,
  onClose,
  title,
  text,
  icon,
  confirmButtonText = "OK",
  confirmButtonColorClass,
  cancelButtonText = "Cancel",
  showCancelButton = false,
  onConfirm,
  variant,
}: PopupProps) => {
  if (!isOpen) return null;

  let buttonColorClass = confirmButtonColorClass;
  if (!buttonColorClass && variant) {
    switch (variant) {
      case "success":
        buttonColorClass = "bg-green-200 hover:bg-green-100";
        break;
      case "error":
        buttonColorClass = "bg-red-200 hover:bg-red-100";
        break;
      case "info":
        buttonColorClass = "bg-blue-200 hover:bg-blue-100";
        break;
      case "warning":
        buttonColorClass = "bg-yellow-200 hover:bg-yellow-100";
        break;
      default:
        buttonColorClass = "bg-green-200 hover:bg-green-100";
    }
  } else if (!buttonColorClass) {
    buttonColorClass = "bg-green-200 hover:bg-green-100";
  }

  let defaultIcon: ReactNode;
  switch (variant) {
    case "success":
      defaultIcon = (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-400">
          <Icon type="check" className="text-green-200 text-2xl" />
        </div>
      );
      break;
    case "error":
      defaultIcon = (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-400">
          <Icon type="close" className="text-red-200 text-2xl" />
        </div>
      );
      break;
    case "info":
      defaultIcon = (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
          <Icon type="info" className="text-blue-200 text-2xl" />
        </div>
      );
      break;
    case "warning":
      defaultIcon = (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-200">
          <Icon type="warning" />
        </div>
      );
      break;
    default:
      defaultIcon = null;
  }

  const displayIcon = icon || defaultIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400/20 shadow-sm p-6 overflow-hidden">
          <div className="text-center">
            {displayIcon && <div className="mb-4">{displayIcon}</div>}
            <h3 className="text-lg font-medium text-dark dark:text-light mb-2">
              {title}
            </h3>
            <p className="text-dark dark:text-light/80">{text}</p>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            {showCancelButton && (
              <Button
                variant="secondary"
                label={cancelButtonText}
                onClick={onClose}
              />
            )}
            <Button
              variant="primary"
              label={confirmButtonText}
              onClick={onConfirm || onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Popup };
