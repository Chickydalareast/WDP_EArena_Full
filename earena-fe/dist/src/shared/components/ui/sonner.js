"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toaster = void 0;
const lucide_react_1 = require("lucide-react");
const next_themes_1 = require("next-themes");
const sonner_1 = require("sonner");
const Toaster = ({ ...props }) => {
    const { theme = "light" } = (0, next_themes_1.useTheme)();
    return (<sonner_1.Toaster theme={theme || "light"} className="toaster group" closeButton={true} toastOptions={{
            classNames: {
                toast: "group toast !bg-card !text-card-foreground !border-border shadow-lg border-l-4 !border-l-primary p-4 gap-3",
                description: "!text-muted-foreground text-xs leading-relaxed mt-1",
                title: "!text-foreground font-semibold text-sm",
                actionButton: "!bg-primary !text-primary-foreground font-medium",
                cancelButton: "!bg-muted !text-muted-foreground",
                closeButton: "!bg-background !text-muted-foreground hover:!text-foreground !border-border shadow-sm right-2 top-2",
            },
        }} icons={{
            success: <lucide_react_1.CircleCheckIcon className="size-4"/>,
            info: <lucide_react_1.InfoIcon className="size-4"/>,
            warning: <lucide_react_1.TriangleAlertIcon className="size-4"/>,
            error: <lucide_react_1.OctagonXIcon className="size-4"/>,
            loading: <lucide_react_1.Loader2Icon className="size-4 animate-spin"/>,
        }} style={{
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
        }} {...props}/>);
};
exports.Toaster = Toaster;
//# sourceMappingURL=sonner.js.map