import * as React from "react";

interface TooltipContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delayDuration?: number;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(
  undefined,
);

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within TooltipProvider");
  }
  return context;
};

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  delayDuration = 700,
}) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  open: controlledOpen,
  onOpenChange,
  delayDuration = 700,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  return (
    <TooltipContext.Provider
      value={{ open, onOpenChange: handleOpenChange, delayDuration }}
    >
      {children}
    </TooltipContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      className = "",
      children,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const { onOpenChange, delayDuration } = useTooltip();
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
      timeoutRef.current = setTimeout(() => {
        onOpenChange(true);
      }, delayDuration);
      onMouseEnter?.(event);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onOpenChange(false);
      onMouseLeave?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      onOpenChange(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      onOpenChange(false);
      onBlur?.(event);
    };

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={ref}
        className={`inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
  }
>(
  (
    {
      className = "",
      children,
      side = "top",
      align = "center",
      sideOffset = 4,
      ...props
    },
    ref,
  ) => {
    const { open } = useTooltip();

    if (!open) return null;

    const sideClasses = {
      top: "bottom-full mb-2",
      bottom: "top-full mt-2",
      left: "right-full mr-2",
      right: "left-full ml-2",
    };

    const alignClasses = {
      start: side === "top" || side === "bottom" ? "left-0" : "top-0",
      center:
        side === "top" || side === "bottom"
          ? "left-1/2 -translate-x-1/2"
          : "top-1/2 -translate-y-1/2",
      end: side === "top" || side === "bottom" ? "right-0" : "bottom-0",
    };

    return (
      <div
        ref={ref}
        className={`absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${sideClasses[side]} ${alignClasses[align]} ${className}`}
        style={{
          marginTop: side === "bottom" ? sideOffset : undefined,
          marginBottom: side === "top" ? sideOffset : undefined,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
