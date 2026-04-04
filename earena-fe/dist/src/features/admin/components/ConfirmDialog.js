'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmDialog = ConfirmDialog;
const Modal_1 = require("./Modal");
function ConfirmDialog({ open, title = 'Xác nhận', description, confirmText = 'Xác nhận', cancelText = 'Hủy', variant = 'danger', onConfirm, onClose, }) {
    const confirmClass = variant === 'danger'
        ? 'border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500/15'
        : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15';
    return (<Modal_1.Modal open={open} title={title} onClose={onClose} widthClassName="max-w-[520px]" footer={<>
          <button className="rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" onClick={onClose}>
            {cancelText}
          </button>
          <button className={'rounded-2xl border px-4 py-2 text-sm font-semibold transition ' + confirmClass} onClick={() => {
                onConfirm();
                onClose();
            }}>
            {confirmText}
          </button>
        </>}>
      <div className="text-sm text-muted-foreground">{description || 'Bạn có chắc chắn muốn thực hiện thao tác này?'}</div>
    </Modal_1.Modal>);
}
//# sourceMappingURL=ConfirmDialog.js.map