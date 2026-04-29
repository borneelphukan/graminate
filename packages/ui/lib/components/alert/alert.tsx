import * as React from "react";
import { Icon } from "../icon/icon";

type AlertVariant = "default" | "error" | "success" | "warning" | "neutral";

const variants: Record<AlertVariant, string> = {
  default: "bg-card text-card-foreground",
  error: "bg-red-300 text-red-100",
  success: "bg-green-300 text-green-100",
  warning: "bg-yellow-300 text-yellow-100",
  neutral: "bg-gray-400 text-dark",
};

interface AlertProps extends Omit<React.ComponentProps<"div">, "title"> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  onClose?: () => void;
}

function Alert({
  className,
  variant = "default",
  title,
  description,
  onClose,
  children,
  ...props
}: AlertProps) {
  const iconMap: Record<
    AlertVariant,
    React.ComponentProps<typeof Icon>["type"]
  > = {
    default: "info",
    warning: "warning",
    error: "error",
    success: "check",
    neutral: "info",
  };

  const icon = iconMap[variant];

  const baseClasses = "relative w-full rounded-lg px-4 py-3 text-sm flex items-center gap-3";
  const variantClasses = variants[variant];
  const combinedClasses = `${baseClasses} ${variantClasses} ${className || ""}`.trim();

  return (
    <div data-slot="alert" role="alert" className={combinedClasses} {...props}>
      {icon && <Icon type={icon} className="shrink-0" />}
      <div className="flex-1">
        {title && (
          <div className="font-medium leading-none tracking-tight mb-1">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <Icon type="close" size="sm" />
        </button>
      )}
    </div>
  );
}

export { Alert };
