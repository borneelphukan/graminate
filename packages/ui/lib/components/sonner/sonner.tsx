import { useTheme } from "next-themes";
import {
  Toaster as Sonner,
  toast as sonnerToast,
  type ToasterProps,
  type ExternalToast,
} from "sonner";
import { LoaderIcon } from "lucide-react";
import { Icon } from "../icon/icon";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl py-4 px-6 gap-3 items-start w-full",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:font-normal group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          title: "group-[.toast]:font-semibold group-[.toast]:text-base",
          icon: "group-[.toast]:mt-1 group-[.toast]:mr-1",
        },
      }}
      icons={{
        success: (
          <Icon type="check" className="text-brand-tech-green font-bold" />
        ),
        info: <Icon type="info" className="text-blue-500" />,
        warning: <Icon type="warning" className="text-yellow-400" />,
        error: <Icon type="warning" className="text-red-500" />,
        loading: (
          <LoaderIcon className="size-5 animate-spin text-neutral-400" />
        ),
      }}
      {...props}
    />
  );
};

type ExtendedToastOptions = ExternalToast & {
  label?: string;
};

const toast = ((
  message: string | React.ReactNode | (() => React.ReactNode),
  data?: ExternalToast
) => {
  return sonnerToast(message, data);
}) as typeof sonnerToast & {
  success: (
    message: string | React.ReactNode | (() => React.ReactNode),
    options?: ExtendedToastOptions
  ) => string | number;
};

Object.assign(toast, sonnerToast);

toast.success = (
  message: string | React.ReactNode | (() => React.ReactNode),
  options?: ExtendedToastOptions
) => {
  if (options?.label) {
    return sonnerToast.success(message, {
      ...options,
      description: (
        <div className="flex items-center gap-2">
          <span className="bg-neutral-600/20 text-neutral-600 text-xs px-1.5 py-0.5 rounded-md font-medium">
            {options.label}
          </span>
          <span>
            {typeof options.description === "function"
              ? options.description()
              : options.description}
          </span>
        </div>
      ),
    });
  }
  return sonnerToast.success(message, options);
};

export { Toaster, toast };
