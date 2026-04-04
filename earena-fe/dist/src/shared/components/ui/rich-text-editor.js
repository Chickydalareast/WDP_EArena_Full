'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextEditor = RichTextEditor;
const react_1 = require("react");
const react_2 = require("@tiptap/react");
const starter_kit_1 = __importDefault(require("@tiptap/starter-kit"));
require("katex/dist/katex.min.css");
const lucide_react_1 = require("lucide-react");
const toggle_1 = require("@/shared/components/ui/toggle");
const button_1 = require("@/shared/components/ui/button");
const utils_1 = require("@/shared/lib/utils");
const sonner_1 = require("sonner");
function RichTextEditor({ value, onChange, disabled, placeholder }) {
    const editor = (0, react_2.useEditor)({
        extensions: [
            starter_kit_1.default.configure({
                heading: { levels: [2, 3] },
            }),
        ],
        content: value,
        editable: !disabled,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(editor.isEmpty ? '' : html);
        },
        editorProps: {
            attributes: {
                class: (0, utils_1.cn)('min-h-[120px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50', 'prose prose-sm max-w-none focus:outline-none'),
            },
        },
    });
    (0, react_1.useEffect)(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);
    if (!editor)
        return null;
    return (<div className={(0, utils_1.cn)("flex flex-col rounded-md border border-input overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", disabled && "opacity-50 cursor-not-allowed")}>
      <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 border-b border-input">
        <toggle_1.Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={disabled}>
          <lucide_react_1.Heading2 className="h-4 w-4"/>
        </toggle_1.Toggle>
        <toggle_1.Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} disabled={disabled}>
          <lucide_react_1.Bold className="h-4 w-4"/>
        </toggle_1.Toggle>
        <toggle_1.Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()} disabled={disabled}>
          <lucide_react_1.Italic className="h-4 w-4"/>
        </toggle_1.Toggle>
        
        <div className="w-[1px] h-4 bg-border mx-1"/>
        
        <toggle_1.Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled}>
          <lucide_react_1.List className="h-4 w-4"/>
        </toggle_1.Toggle>
        <toggle_1.Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled}>
          <lucide_react_1.ListOrdered className="h-4 w-4"/>
        </toggle_1.Toggle>

        <div className="w-[1px] h-4 bg-border mx-1"/>

        <button_1.Button type="button" variant="ghost" size="sm" disabled={disabled} className="h-8 px-2 text-slate-600 hover:text-slate-900" onClick={() => {
            editor.chain().focus().insertContent('$$ $$').run();
            sonner_1.toast.info('Nhập công thức Toán học vào giữa 2 ký tự $$');
        }}>
          <lucide_react_1.Sigma className="h-4 w-4 mr-1"/> <span className="text-xs font-bold">Math</span>
        </button_1.Button>
      </div>

      <div className="cursor-text bg-white min-h-[120px]" onClick={() => editor.commands.focus()}>
        <react_2.EditorContent editor={editor}/>
      </div>
    </div>);
}
//# sourceMappingURL=rich-text-editor.js.map