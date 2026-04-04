'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewModal = void 0;
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const review_schema_1 = require("../types/review.schema");
const useReviewMutations_1 = require("../hooks/useReviewMutations");
const StarRating_1 = require("./StarRating");
const dialog_1 = require("@/shared/components/ui/dialog");
const form_1 = require("@/shared/components/ui/form");
const button_1 = require("@/shared/components/ui/button");
const textarea_1 = require("@/shared/components/ui/textarea");
const CreateReviewModal = ({ courseId, isOpen, onClose, title, message }) => {
    const { mutate: createReview, isPending } = (0, useReviewMutations_1.useCreateReview)(courseId);
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(review_schema_1.createReviewSchema),
        defaultValues: {
            rating: 0,
            comment: '',
        },
    });
    const handleOpenChange = (open) => {
        if (isPending)
            return;
        if (!open) {
            form.reset();
            localStorage.setItem(`has_dismissed_review_${courseId}`, 'true');
            onClose();
        }
    };
    const onSubmit = (data) => {
        createReview(data, {
            onSuccess: () => {
                form.reset();
                localStorage.setItem(`has_dismissed_review_${courseId}`, 'true');
                onClose();
            },
        });
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <dialog_1.DialogContent className="sm:max-w-[500px]">
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>{title || 'Đánh giá khóa học'}</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        {message || 'Chia sẻ cảm nhận của bạn để giúp học viên khác hiểu hơn về khóa học này nhé. (Bạn chỉ có thể đánh giá 1 lần duy nhất).'}
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <form_1.Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">

                        
                        <form_1.FormField control={form.control} name="rating" render={({ field }) => (<form_1.FormItem className="flex flex-col items-center justify-center space-y-3 py-4 border rounded-lg bg-muted/20">
                                    <form_1.FormLabel className="text-base font-medium">Bạn đánh giá bao nhiêu sao?</form_1.FormLabel>
                                    <form_1.FormControl>
                                        <StarRating_1.StarRating value={field.value} onChange={field.onChange} size={32}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                </form_1.FormItem>)}/>

                        <form_1.FormField control={form.control} name="comment" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Nhận xét chi tiết (Không bắt buộc)</form_1.FormLabel>
                                    <form_1.FormControl>
                                        <textarea_1.Textarea placeholder="Khóa học này đã giúp ích gì cho bạn?..." className="resize-none h-24" {...field}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                </form_1.FormItem>)}/>

                        <div className="flex justify-end gap-3 pt-4">
                            <button_1.Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                                Hủy bỏ
                            </button_1.Button>
                            <button_1.Button type="submit" disabled={isPending}>
                                {isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Gửi đánh giá
                            </button_1.Button>
                        </div>
                    </form>
                </form_1.Form>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
};
exports.CreateReviewModal = CreateReviewModal;
//# sourceMappingURL=CreateReviewModal.js.map