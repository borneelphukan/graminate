import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { SpinnerCustom } from "../../components/spinner/spinner";
import { Icon, type IconType } from "../icon/icon";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 h-fit whitespace-nowrap text-base font-medium transition-all disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:!ring-[2px] focus:!ring-green-200 focus:!ring-offset-2 focus-visible:!ring-[3px] focus-visible:!ring-green-200 focus-visible:!ring-offset-2 aria-invalid:!ring-red-200 aria-invalid:border-destructive cursor-pointer group ease-out",
  {
    variants: {
      variant: {
        primary:
          "text-white [--btn-gp:-210.69%] hover:[--btn-gp:101.11%] transition-[--btn-gp] duration-200",
        success:
          "text-white [--btn-gp:-210.69%] hover:[--btn-gp:101.11%] transition-[--btn-gp] duration-200 border border-solid border-green-200",
        destructive:
          "text-white [--btn-gp:-210.69%] hover:[--btn-gp:101.11%] transition-[--btn-gp] duration-200 focus:!ring-red-200 focus-visible:!ring-red-200",
        outline: "text-dark border border-gray-300 bg-white hover:bg-gray-50",
        secondary:
          "text-green-200 border border-solid border-green-200 bg-white hover:bg-green-400 hover:text-green-200/90",
        ghost: "text-dark hover:bg-gray-400 focus:bg-gray-100 font-semibold",
        link: "text-green-200 p-0 rounded-none border-solid border-transparent border hover:border-green-200/50 hover:underline",
        home: "bg-white text-gray-900 shadow-lg hover:bg-gray-900 hover:text-white border border-solid border-gray-900",
      },
      size: {
        md: "py-1.5 px-3",
        sm: "py-0.5 px-2 text-sm",
        lg: "py-2 px-4",
        icon: "size-9",
      },
      shape: {
        default: "rounded-md",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "default",
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    icon?: {
      left?: IconType;
      right?: IconType;
    };
    label?: string;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      shape = "default",
      icon,
      isLoading = false,
      label,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isEffectivelyDisabled = isLoading || disabled;

    const hasText = !!label || !!children;
    const isIconOnly =
      size === "icon" || (!hasText && !!(icon?.left || icon?.right));

    // Complex Style Map (Gradients and Shadows)
    const getVariantStyles = (
      v: ButtonProps["variant"]
    ): React.CSSProperties => {
      switch (v) {
        case "primary":
          return {
            background:
              "radial-gradient(118.97% 279.17% at 45.98% -36.11%, rgba(4, 173, 121, 0.4) 0%, transparent 50%), linear-gradient(355.59deg, var(--color-green-200) var(--btn-gp), var(--color-green-100) 388.92%)",
            boxShadow:
              "0 2px 0.7px 0 rgba(243, 249, 248, 0.24) inset, 0 1px 0 0 #14786e inset",
          };
        case "success":
          return {
            background:
              "radial-gradient(118.97% 279.17% at 45.98% -36.11%, rgba(4, 173, 121, 0.4) 0%, transparent 50%), linear-gradient(355.59deg, var(--color-green-200) var(--btn-gp), var(--color-green-300) 388.92%)",
            boxShadow: "0 2px 0.7px 0 rgba(243, 249, 248, 0.24) inset, 0 1px 0 0 #04ad79 inset",
          };
        case "destructive":
          return {
            background:
              "radial-gradient(118.97% 279.17% at 45.98% -36.11%, rgba(229, 62, 62, 0.4) 0%, transparent 50%), linear-gradient(355.59deg, var(--color-red-200) var(--btn-gp), var(--color-red-100) 388.92%)",
            boxShadow:
              "0 2px 0.7px 0 rgba(249, 243, 243, 0.24) inset, 0 1px 0 0 #781414 inset",
          };
        default:
          return {};
      }
    };

    const renderButtonContent = () => (
      <>
        {icon?.left && <Icon type={icon.left} />}
        {isIconOnly ? children : label || children}
        {icon?.right && <Icon type={icon.right} />}
      </>
    );

    return (
      <button
        ref={ref}
        className={buttonVariants({
          variant,
          size,
          shape,
          className: [isIconOnly ? "aspect-square" : "", className]
            .filter(Boolean)
            .join(" "),
        })}
        style={getVariantStyles(variant)}
        disabled={isEffectivelyDisabled}
        {...props}
      >
        <div
          className={`flex items-center justify-center gap-2 transition-opacity duration-200 ${
            isLoading ? "opacity-0 pointer-events-none" : ""
          } ${isEffectivelyDisabled && !isLoading ? "opacity-50" : ""}`}
        >
          {renderButtonContent()}
        </div>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <SpinnerCustom />
          </div>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };



