import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
declare function Tabs({ className, orientation, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>): any;
declare const tabsListVariants: any;
declare function TabsList({ className, variant, ...props }: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>): any;
declare function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>): any;
declare function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>): any;
export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
