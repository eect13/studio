import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold min-h-11 px-5 transition-[opacity,transform,background-color,border-color] duration-150 ease-out active:scale-[0.98] disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-lime text-ink hover:opacity-90",
        ghost: "border border-line bg-transparent text-fg hover:border-lime/50",
        gold: "bg-gold text-gold-ink hover:opacity-90",
        atriumGhost: "border border-atrium-line bg-transparent text-fg hover:border-gold/50",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function Button({
  className,
  variant,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}
