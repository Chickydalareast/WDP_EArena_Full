"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sheet = Sheet;
exports.SheetTrigger = SheetTrigger;
exports.SheetClose = SheetClose;
exports.SheetContent = SheetContent;
exports.SheetHeader = SheetHeader;
exports.SheetFooter = SheetFooter;
exports.SheetTitle = SheetTitle;
exports.SheetDescription = SheetDescription;
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const radix_ui_1 = require("radix-ui");
const utils_1 = require("@/shared/lib/utils");
function Sheet({ ...props }) {
    return <radix_ui_1.Dialog.Root data-slot="sheet" {...props}/>;
}
function SheetTrigger({ ...props }) {
    return <radix_ui_1.Dialog.Trigger data-slot="sheet-trigger" {...props}/>;
}
function SheetClose({ ...props }) {
    return <radix_ui_1.Dialog.Close data-slot="sheet-close" {...props}/>;
}
function SheetPortal({ ...props }) {
    return <radix_ui_1.Dialog.Portal data-slot="sheet-portal" {...props}/>;
}
function SheetOverlay({ className, ...props }) {
    return (<radix_ui_1.Dialog.Overlay data-slot="sheet-overlay" className={(0, utils_1.cn)("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", className)} {...props}/>);
}
function SheetContent({ className, children, side = "right", showCloseButton = true, ...props }) {
    return (<SheetPortal>
      <SheetOverlay />
      <radix_ui_1.Dialog.Content data-slot="sheet-content" className={(0, utils_1.cn)("fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500", side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm", side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm", side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top", side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", className)} {...props}>
        {children}
        {showCloseButton && (<radix_ui_1.Dialog.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary">
            <lucide_react_1.XIcon className="size-4"/>
            <span className="sr-only">Close</span>
          </radix_ui_1.Dialog.Close>)}
      </radix_ui_1.Dialog.Content>
    </SheetPortal>);
}
function SheetHeader({ className, ...props }) {
    return (<div data-slot="sheet-header" className={(0, utils_1.cn)("flex flex-col gap-1.5 p-4", className)} {...props}/>);
}
function SheetFooter({ className, ...props }) {
    return (<div data-slot="sheet-footer" className={(0, utils_1.cn)("mt-auto flex flex-col gap-2 p-4", className)} {...props}/>);
}
function SheetTitle({ className, ...props }) {
    return (<radix_ui_1.Dialog.Title data-slot="sheet-title" className={(0, utils_1.cn)("font-semibold text-foreground", className)} {...props}/>);
}
function SheetDescription({ className, ...props }) {
    return (<radix_ui_1.Dialog.Description data-slot="sheet-description" className={(0, utils_1.cn)("text-sm text-muted-foreground", className)} {...props}/>);
}
//# sourceMappingURL=sheet.js.map