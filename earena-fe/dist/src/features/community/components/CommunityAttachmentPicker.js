'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityAttachmentPicker = CommunityAttachmentPicker;
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const community_api_1 = require("../api/community-api");
const sonner_1 = require("sonner");
const utils_1 = require("@/shared/lib/utils");
const DEFAULT_MAX = 8;
const ACCEPT = 'image/*';
const MAX_BYTES = 8 * 1024 * 1024;
function isAllowedImageFile(file) {
    if (file.type.startsWith('image/')) {
        if (file.type === 'image/svg+xml')
            return false;
        return true;
    }
    return /\.(jpe?g|png|gif|webp|bmp|heic|heif|avif)$/i.test(file.name);
}
function CommunityAttachmentPicker({ attachments, onChange, disabled, maxImages = DEFAULT_MAX, }) {
    const reactId = (0, react_1.useId)().replace(/:/g, '');
    const fileInputId = `community-att-${reactId}`;
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const [pending, setPending] = (0, react_1.useState)([]);
    const onFiles = async (e) => {
        const files = e.target.files;
        e.target.value = '';
        if (!files?.length)
            return;
        let room = maxImages - attachments.length;
        if (room <= 0) {
            sonner_1.toast.error(`Tối đa ${maxImages} ảnh.`);
            return;
        }
        const slice = Array.from(files).slice(0, room);
        for (const file of slice) {
            if (room <= 0)
                break;
            if (!isAllowedImageFile(file)) {
                sonner_1.toast.error('Chọn file ảnh (JPEG, PNG, WebP, GIF, HEIC…).');
                continue;
            }
            if (file.size > MAX_BYTES) {
                sonner_1.toast.error('Mỗi ảnh tối đa 8MB.');
                continue;
            }
            const key = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`;
            const previewUrl = URL.createObjectURL(file);
            (0, react_dom_1.flushSync)(() => {
                setPending((p) => [...p, { key, previewUrl }]);
            });
            try {
                setIsUploading(true);
                const { url } = await (0, community_api_1.uploadCommunityImage)(file);
                onChange((prev) => {
                    if (prev.length >= maxImages)
                        return prev;
                    return [
                        ...prev,
                        {
                            url,
                            kind: 'IMAGE',
                            name: file.name,
                            mime: file.type || 'image/jpeg',
                        },
                    ];
                });
                room -= 1;
            }
            catch (e) {
                const msg = e instanceof Error ? e.message : 'Không thể tải ảnh lên.';
                sonner_1.toast.error('Lỗi tải ảnh', { description: msg });
            }
            finally {
                setIsUploading(false);
                setPending((p) => p.filter((x) => x.key !== key));
                URL.revokeObjectURL(previewUrl);
            }
        }
    };
    const remove = (idx) => {
        onChange((prev) => prev.filter((_, i) => i !== idx));
    };
    const busy = isUploading || pending.length > 0;
    const pickerBlocked = disabled || busy || attachments.length >= maxImages;
    return (<div className="space-y-2">
      <input id={fileInputId} type="file" accept={ACCEPT} multiple className="sr-only" onChange={onFiles} disabled={pickerBlocked} aria-label="Chọn ảnh đính kèm"/>
      {(attachments.length > 0 || pending.length > 0) && (<div className="flex flex-wrap gap-2">
          {pending.map((p) => (<div key={p.key} className="relative h-20 w-20 overflow-hidden rounded-md border border-border bg-muted">
              
              <img src={p.previewUrl} alt="" className="h-full w-full object-cover opacity-70"/>
              <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                <lucide_react_1.Loader2 className="h-6 w-6 animate-spin text-primary"/>
              </div>
            </div>))}
          {attachments.map((a, i) => (<div key={`${a.url}-${i}`} className="group relative h-20 w-20 overflow-hidden rounded-md border border-border bg-muted">
              
              <img src={a.url} alt="" className="h-full w-full object-cover"/>
              <button type="button" className="absolute right-0.5 top-0.5 rounded-full bg-background/90 p-0.5 opacity-0 shadow transition group-hover:opacity-100" onClick={() => remove(i)} disabled={disabled || busy} aria-label="Xóa ảnh">
                <lucide_react_1.X className="h-3.5 w-3.5"/>
              </button>
            </div>))}
        </div>)}
      <label htmlFor={fileInputId} className={(0, utils_1.cn)('inline-flex', pickerBlocked && 'pointer-events-none cursor-not-allowed opacity-50')}>
        <span className={(0, button_1.buttonVariants)({
            variant: 'outline',
            size: 'sm',
            className: 'cursor-pointer',
        })}>
          {busy ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.ImagePlus className="mr-2 h-4 w-4"/>)}
          Thêm ảnh
        </span>
      </label>
    </div>);
}
//# sourceMappingURL=CommunityAttachmentPicker.js.map