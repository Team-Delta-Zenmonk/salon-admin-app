import React from "react";
import { cn } from "@/lib/utils";
import { EllipsisCell } from "@/components/ellipse-cell";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, leftIcon, rightIcon, id, value, title, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const valString = value !== undefined && value !== null ? String(value) : "";
    const computedTitle = title ?? (valString ? valString : undefined);

    const inputElement = (
      <input
        id={inputId}
        type={type}
        ref={ref}
        value={value}
        title={computedTitle}
        className={cn(
          "flex h-10 w-full min-w-0 truncate rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
          "transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50",
          leftIcon && "pl-9",
          rightIcon && "pr-9",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          className
        )}
        {...props}
      />
    );

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold tracking-wide text-foreground">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground z-10">
              {leftIcon}
            </div>
          )}
          {valString ? (
            <EllipsisCell value={valString} className="w-full min-w-0 block">
              {inputElement}
            </EllipsisCell>
          ) : (
            inputElement
          )}
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-muted-foreground z-10">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
