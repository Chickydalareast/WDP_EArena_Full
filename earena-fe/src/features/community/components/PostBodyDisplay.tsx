'use client';

import { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';

export function PostBodyDisplay({
  bodyJson,
  className,
}: {
  bodyJson: string;
  className?: string;
}) {
  const html = useMemo(() => {
    const t = bodyJson?.trim() || '';
    if (!t) return '';
    if (t.startsWith('{')) {
      try {
        const doc = JSON.parse(t) as { type?: string };
        if (doc?.type === 'doc') {
          return extractHtmlFromTiptapDoc(doc as TiptapDoc);
        }
      } catch {
        /* fall through */
      }
    }
    return t;
  }, [bodyJson]);

  if (!html) return null;

  if (html.startsWith('<')) {
    return (
      <div
        className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <p className={cn('text-sm whitespace-pre-wrap text-foreground/90', className)}>
      {html}
    </p>
  );
}

type TiptapNode = {
  type?: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: { level?: number };
};

type TiptapDoc = { content?: TiptapNode[] };

function extractHtmlFromTiptapDoc(doc: TiptapDoc): string {
  const inner = (doc.content || []).map(renderNode).join('');
  return inner || '<p></p>';
}

function renderNode(node: TiptapNode): string {
  if (!node) return '';
  if (node.type === 'text') {
    let s = escapeHtml(node.text || '');
    return s;
  }
  const kids = (node.content || []).map(renderNode).join('');
  switch (node.type) {
    case 'paragraph':
      return `<p>${kids || '<br/>'}</p>`;
    case 'heading': {
      const lv = node.attrs?.level === 3 ? 3 : 2;
      return `<h${lv}>${kids}</h${lv}>`;
    }
    case 'bulletList':
      return `<ul class="list-disc pl-5">${kids}</ul>`;
    case 'orderedList':
      return `<ol class="list-decimal pl-5">${kids}</ol>`;
    case 'listItem':
      return `<li>${kids}</li>`;
    case 'hardBreak':
      return '<br/>';
    default:
      return kids;
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
