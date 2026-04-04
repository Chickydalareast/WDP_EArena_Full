'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostBodyDisplay = PostBodyDisplay;
const react_1 = require("react");
const utils_1 = require("@/shared/lib/utils");
function PostBodyDisplay({ bodyJson, className, }) {
    const html = (0, react_1.useMemo)(() => {
        const t = bodyJson?.trim() || '';
        if (!t)
            return '';
        if (t.startsWith('{')) {
            try {
                const doc = JSON.parse(t);
                if (doc?.type === 'doc') {
                    return extractHtmlFromTiptapDoc(doc);
                }
            }
            catch {
            }
        }
        return t;
    }, [bodyJson]);
    if (!html)
        return null;
    if (html.startsWith('<')) {
        return (<div className={(0, utils_1.cn)('prose prose-sm dark:prose-invert max-w-none', className)} dangerouslySetInnerHTML={{ __html: html }}/>);
    }
    return (<p className={(0, utils_1.cn)('text-sm whitespace-pre-wrap text-foreground/90', className)}>
      {html}
    </p>);
}
function extractHtmlFromTiptapDoc(doc) {
    const inner = (doc.content || []).map(renderNode).join('');
    return inner || '<p></p>';
}
function renderNode(node) {
    if (!node)
        return '';
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
function escapeHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
//# sourceMappingURL=PostBodyDisplay.js.map