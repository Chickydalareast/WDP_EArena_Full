import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
declare function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>): any;
declare function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>): any;
declare function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>): any;
declare function SheetContent({ className, children, side, showCloseButton, ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left";
    showCloseButton?: boolean;
}): any;
declare function SheetHeader({ className, ...props }: React.ComponentProps<"div">): any;
declare function SheetFooter({ className, ...props }: React.ComponentProps<"div">): any;
declare function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>): any;
declare function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>): any;
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, };
