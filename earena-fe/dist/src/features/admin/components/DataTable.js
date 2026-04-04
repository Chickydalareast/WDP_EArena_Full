'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = DataTable;
exports.PaginationBar = PaginationBar;
function DataTable({ columns, rows, empty, emptyMessage, isLoading, }) {
    const emptyText = empty ?? emptyMessage ?? 'Không có dữ liệu';
    return (<div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              {columns.map((c) => (<th key={c.key} className={'px-4 py-3 text-left font-semibold text-muted-foreground border-b border-border ' +
                (c.className || '')}>
                  {c.header}
                </th>))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (<tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  Đang tải...
                </td>
              </tr>) : rows.length === 0 ? (<tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  {emptyText}
                </td>
              </tr>) : (rows.map((r, idx) => (<tr key={idx} className="border-b border-border/60 hover:bg-accent/50">
                  {columns.map((c) => (<td key={c.key} className={'px-4 py-3 align-top text-foreground ' + (c.className || '')}>
                      {r[c.key]}
                    </td>))}
                </tr>)))}
          </tbody>
        </table>
      </div>
    </div>);
}
function PaginationBar({ page, totalPages, onPageChange, }) {
    const canPrev = page > 1;
    const canNext = page < totalPages;
    return (<div className="flex items-center justify-between gap-4 pt-4">
      <div className="text-xs text-muted-foreground">
        Trang <span className="font-semibold text-foreground">{page}</span> / {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button className={'rounded-xl px-3 py-2 text-sm border border-border bg-background/60 transition ' +
            (canPrev
                ? 'hover:bg-accent text-foreground'
                : 'opacity-50 cursor-not-allowed text-muted-foreground')} disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
          Trước
        </button>
        <button className={'rounded-xl px-3 py-2 text-sm border border-border bg-background/60 transition ' +
            (canNext
                ? 'hover:bg-accent text-foreground'
                : 'opacity-50 cursor-not-allowed text-muted-foreground')} disabled={!canNext} onClick={() => onPageChange(page + 1)}>
          Sau
        </button>
      </div>
    </div>);
}
//# sourceMappingURL=DataTable.js.map