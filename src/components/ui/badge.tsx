import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-red-500 text-white hover:bg-red-500/80",
      outline: "text-foreground",
      success:
        "border-transparent bg-green-500 text-white hover:bg-green-500/80",
      warning:
        "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
    };

    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold
          transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          ${variants[variant]} ${className}
        `}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";

export { Badge };
