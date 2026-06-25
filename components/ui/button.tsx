import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "outline" | "danger";
  size?: "default" | "sm" | "icon";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
        variant === "default" && "bg-ink text-white shadow-sm hover:bg-[#223732] hover:shadow-md",
        variant === "secondary" && "bg-brand text-white shadow-sm shadow-brand/15 hover:bg-brand-dark hover:shadow-md hover:shadow-brand/20",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100/80 hover:text-ink",
        variant === "outline" && "border border-slate-200 bg-white text-ink shadow-sm hover:border-slate-300 hover:bg-slate-50",
        variant === "danger" && "bg-red-50 text-red-700 hover:bg-red-100",
        size === "default" && "h-11 px-4 text-sm",
        size === "sm" && "h-9 rounded-lg px-3 text-xs",
        size === "icon" && "h-10 w-10 p-0",
        className,
      )}
      {...props}
    />
  );
}
