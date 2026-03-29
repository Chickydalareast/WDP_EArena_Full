'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import 'katex/dist/katex.min.css';

import { Bold, Italic, List, ListOrdered, Heading2, Sigma } from 'lucide-react';
import { Toggle } from '@/shared/components/ui/toggle';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, disabled, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      // Đã loại bỏ hoàn toàn @tiptap/extension-image theo kiến trúc Option 1
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
        class: cn(
          'min-h-[120px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          'prose prose-sm max-w-none focus:outline-none'
        ),
      },
      // Đã loại bỏ handlePaste và handleDrop xử lý file ảnh
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={cn("flex flex-col rounded-md border border-input overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", disabled && "opacity-50 cursor-not-allowed")}>
      <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 border-b border-input">
        <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={disabled}>
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} disabled={disabled}>
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()} disabled={disabled}>
          <Italic className="h-4 w-4" />
        </Toggle>
        
        <div className="w-[1px] h-4 bg-border mx-1" />
        
        <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled}>
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled}>
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <div className="w-[1px] h-4 bg-border mx-1" />

        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          disabled={disabled}
          className="h-8 px-2 text-slate-600 hover:text-slate-900"
          onClick={() => {
            editor.chain().focus().insertContent('$$ $$').run();
            toast.info('Nhập công thức Toán học vào giữa 2 ký tự $$');
          }}
        >
          <Sigma className="h-4 w-4 mr-1" /> <span className="text-xs font-bold">Math</span>
        </Button>
      </div>

      <div className="cursor-text bg-white min-h-[120px]" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}