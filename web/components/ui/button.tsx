import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "press inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium outline-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "surface-raised-sm text-ink",
        primary: "surface-brass",
        destructive: "surface-rust",
        quiet:
          "border border-transparent text-ink-soft hover:border-line hover:bg-panel hover:text-ink",
      },
      size: {
        sm: "h-7 gap-1.5 px-2.5 text-[0.8125rem]",
        md: "h-9 px-3.5 text-sm",
        lg: "h-10 px-5 text-sm",
        icon: "size-9",
        "icon-sm": "size-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
