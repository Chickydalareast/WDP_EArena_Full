'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareCourseToCommunityButton = ShareCourseToCommunityButton;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const routes_1 = require("@/config/routes");
const button_1 = require("@/shared/components/ui/button");
const dialog_1 = require("@/shared/components/ui/dialog");
const rich_text_editor_1 = require("@/shared/components/ui/rich-text-editor");
const community_api_1 = require("../api/community-api");
const CommunityAttachmentPicker_1 = require("./CommunityAttachmentPicker");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
function ShareCourseToCommunityButton({ courseId, subjectId, variant = 'outline', }) {
    const router = (0, navigation_1.useRouter)();
    const isAuthenticated = (0, auth_store_1.useAuthStore)((s) => s.isAuthenticated);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [body, setBody] = (0, react_1.useState)('');
    const [attachments, setAttachments] = (0, react_1.useState)([]);
    const submit = async () => {
        const hasText = !!(body.trim() && body !== '<p></p>');
        if (!hasText && attachments.length === 0) {
            sonner_1.toast.error('Thêm mô tả ngắn hoặc ít nhất một ảnh kèm chia sẻ.');
            return;
        }
        try {
            await (0, community_api_1.createCommunityPost)({
                type: 'COURSE_SHARE',
                bodyJson: body.trim() ? body : '<p></p>',
                courseId,
                ...(attachments.length ? { attachments } : {}),
                ...(subjectId ? { subjectId } : {}),
            });
            sonner_1.toast.success('Đã chia sẻ lên cộng đồng');
            setOpen(false);
            setBody('');
            setAttachments([]);
        }
        catch {
            sonner_1.toast.error('Không thể chia sẻ');
        }
    };
    return (<>
      <button_1.Button type="button" variant={variant} className="w-full font-semibold" onClick={() => {
            if (!isAuthenticated) {
                router.push(routes_1.ROUTES.AUTH.LOGIN +
                    '?callbackUrl=' +
                    encodeURIComponent(window.location.pathname));
                return;
            }
            setOpen(true);
        }}>
        <lucide_react_1.Share2 className="w-4 h-4 mr-2"/>
        Chia sẻ vào cộng đồng
      </button_1.Button>
      <dialog_1.Dialog open={open} onOpenChange={setOpen}>
        <dialog_1.DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Chia sẻ khóa học</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <p className="text-sm text-muted-foreground">
            Thẻ khóa học sẽ được gắn tự động. Thêm vài dòng cảm nhận để thu hút học viên.
          </p>
          <rich_text_editor_1.RichTextEditor value={body} onChange={setBody} placeholder="Ví dụ: Khóa này hợp người mất gốc..."/>
          <CommunityAttachmentPicker_1.CommunityAttachmentPicker attachments={attachments} onChange={setAttachments}/>
          <button_1.Button className="w-full" onClick={submit}>
            Đăng lên Community
          </button_1.Button>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </>);
}
//# sourceMappingURL=ShareCourseToCommunityButton.js.map