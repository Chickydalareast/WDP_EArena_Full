'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyReviewModal = void 0;
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const review_schema_1 = require("../types/review.schema");
const useReviewMutations_1 = require("../hooks/useReviewMutations");
const dialog_1 = require("@/shared/components/ui/dialog");
const form_1 = require("@/shared/components/ui/form");
const button_1 = require("@/shared/components/ui/button");
const textarea_1 = require("@/shared/components/ui/textarea");
const ReplyReviewModal = ({ courseId, reviewId, onClose }) => {
    const { mutate: replyReview, isPending } = (0, useReviewMutations_1.useReplyReview)(courseId);
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(review_schema_1.replyReviewSchema),
        defaultValues: {
            reply: '',
        },
    });
    const isOpen = !!reviewId;
    const handleOpenChange = (open) => {
        if (isPending)
            return;
        if (!open) {
            form.reset();
            onClose();
        }
    };
    const onSubmit = (data) => {
        if (!reviewId)
            return;
        replyReview({ reviewId, payload: data }, {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <dialog_1.DialogContent className="sm:max-w-[500px]">
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Phản hồi học viên</dialog_1.DialogTitle>
                </dialog_1.DialogHeader>

                <form_1.Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <form_1.FormField control={form.control} name="reply" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Nội dung phản hồi</form_1.FormLabel>
                                    <form_1.FormControl>
                                        <textarea_1.Textarea placeholder="Cảm ơn bạn đã góp ý..." className="resize-none h-32" {...field}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                </form_1.FormItem>)}/>

                        <div className="flex justify-end gap-3 pt-4">
                            <button_1.Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                                Hủy
                            </button_1.Button>
                            <button_1.Button type="submit" disabled={isPending}>
                                {isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Gửi phản hồi
                            </button_1.Button>
                        </div>
                    </form>
                </form_1.Form>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
};
exports.ReplyReviewModal = ReplyReviewModal;
//# sourceMappingURL=ReplyReviewModal.js.map