import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";
declare const toggleVariants: any;
declare function Toggle({ className, variant, size, ...props }: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>): any;
export { Toggle, toggleVariants };
