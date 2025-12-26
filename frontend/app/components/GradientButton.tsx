// components/GradientButton.tsx
import Link, { LinkProps } from "next/link";
import React from "react";

type Size = "sm" | "base" | "lg";

type CommonProps = {
  className?: string;
  children: React.ReactNode;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
};

type ButtonVariantProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
  };

type LinkVariantProps = CommonProps &
  LinkProps & {
    as: "link";
  };

type GradientButtonProps = ButtonVariantProps | LinkVariantProps;

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-white " +
  "bg-gradient-to-r from-primary to-primary-hover " +
  "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30" +
  "transition-all duration-200 transform hover:scale-105";

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  base: "px-4 py-3.5 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function GradientButton(props: GradientButtonProps) {
  const {
    className,
    children,
    size = "base",
    loading = false,
    disabled = false,
    ...rest
  } = props;

  const isDisabled = disabled || loading;

  const classes =
    baseClasses +
    " " +
    sizeClasses[size] +
    " " +
    (isDisabled ? " opacity-60 cursor-not-allowed hover:scale-100" : "") +
    (className ? " " + className : "");

  if (props.as === "link") {
    const { as, ...linkRest } = rest as Omit<LinkVariantProps, "loading" | "disabled">;

    // For links, we mimic disabled by preventing pointer events
    return (
      <Link
        {...(linkRest as LinkProps)}
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : undefined}
        className={classes + (isDisabled ? " pointer-events-none" : "")}
      >
        {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
            children
        )}
      </Link>
    );
  }

  const { as, ...buttonRest } = rest as Omit<
    ButtonVariantProps,
    "loading" | "disabled"
  >;

  return (
    <button
      {...(buttonRest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      disabled={isDisabled}
      className={classes}
    >
        {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
            children
        )}
    </button>
  );
}
