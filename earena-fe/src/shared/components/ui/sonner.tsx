"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useTheme()

  return (
    <Sonner
      theme={(theme as ToasterProps["theme"]) || "light"}
      className="toaster group"
      closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-card !text-card-foreground !border-border shadow-lg border-l-4 !border-l-primary p-4 gap-3",
          description: "!text-muted-foreground text-xs leading-relaxed mt-1",
          title: "!text-foreground font-semibold text-sm",
          actionButton:
            "!bg-primary !text-primary-foreground font-medium",
          cancelButton:
            "!bg-muted !text-muted-foreground",
          closeButton:
            "!bg-background !text-muted-foreground hover:!text-foreground !border-border shadow-sm right-2 top-2",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }