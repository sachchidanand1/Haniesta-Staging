import { forwardRef } from "react";
import { cn } from "~/lib/utils";

interface ScrollAreaProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, style }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={cn("overflow-y-auto", className)}
      >
        {children}
      </div>
    );
  },
);
