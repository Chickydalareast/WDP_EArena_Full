"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadCsv = downloadCsv;
function downloadCsv({ filename, headers, rows, }) {
    const escape = (v) => {
        if (v === null || v === undefined)
            return '';
        const s = String(v);
        const needsWrap = /[\n\r,"]/.test(s);
        const escaped = s.replace(/\"/g, '""');
        return needsWrap ? `"${escaped}"` : escaped;
    };
    const headerLine = headers.map((h) => escape(h.label)).join(',');
    const lines = rows.map((r) => headers.map((h) => escape(r[h.key])).join(','));
    const csv = '\ufeff' + [headerLine, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
//# sourceMappingURL=csv.js.map