'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSettingsForm = CourseSettingsForm;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const zod_1 = require("zod");
const course_schema_1 = require("../types/course.schema");
const useCourseSettings_1 = require("../hooks/useCourseSettings");
const useCloudinaryUpload_1 = require("@/shared/hooks/useCloudinaryUpload");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const textarea_1 = require("@/shared/components/ui/textarea");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const progress_1 = require("@/shared/components/ui/progress");
const switch_1 = require("@/shared/components/ui/switch");
const select_1 = require("@/shared/components/ui/select");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const image_1 = __importDefault(require("next/image"));
const formSchema = course_schema_1.baseUpdateCourseSchema
    .omit({ benefits: true, requirements: true })
    .extend({
    benefits: zod_1.z.string().optional(),
    requirements: zod_1.z.string().optional(),
    promotionalVideoId: zod_1.z.string().nullable().optional(),
    coverImageId: zod_1.z.string().nullable().optional(),
})
    .superRefine((data, ctx) => {
    if (typeof data.price === 'number' && typeof data.discountPrice === 'number') {
        if (data.discountPrice > data.price) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Giá khuyến mãi không được lớn hơn giá gốc",
                path: ["discountPrice"],
            });
        }
    }
});
function CourseSettingsForm({ courseId }) {
    const { data: course, isLoading: isCourseLoading } = (0, useCourseSettings_1.useCourseSettings)(courseId);
    const { data: stats, isLoading: isStatsLoading } = (0, useCourseSettings_1.useCourseDashboardStats)(courseId);
    const { mutate: updateCourse, isPending: isUpdatingDB } = (0, useCourseSettings_1.useUpdateCourse)(courseId);
    const { mutate: deleteCourse, isPending: isDeleting } = (0, useCourseSettings_1.useDeleteCourse)(courseId);
    const { uploadDirectly: uploadImage, isUploading: isUploadingImage } = (0, useCloudinaryUpload_1.useCloudinaryUpload)();
    const { uploadDirectly: uploadVideo, isUploading: isUploadingVideo, progress: videoProgress } = (0, useCloudinaryUpload_1.useCloudinaryUpload)();
    const [coverImageUrl, setCoverImageUrl] = (0, react_1.useState)(null);
    const [uploadedVideoName, setUploadedVideoName] = (0, react_1.useState)(null);
    const { register, control, handleSubmit, setValue, watch, formState: { errors, isDirty }, reset } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(formSchema),
    });
    (0, react_1.useEffect)(() => {
        if (course) {
            reset({
                title: course.title,
                price: course.price,
                discountPrice: course.discountPrice,
                description: course.description || '',
                benefits: course.benefits?.join('\n') || '',
                requirements: course.requirements?.join('\n') || '',
                coverImageId: course.coverImage?.id || undefined,
                promotionalVideoId: course.promotionalVideoId || undefined,
                progressionMode: course.progressionMode || 'FREE',
                isStrictExam: course.isStrictExam || false,
            });
            setCoverImageUrl(course.coverImage?.url || null);
            setUploadedVideoName(null);
        }
    }, [course, reset]);
    const currentVideoId = watch('promotionalVideoId');
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            const res = await uploadImage(file, 'course_thumbnail');
            if (res?.id) {
                setValue('coverImageId', res.id, { shouldDirty: true });
                setCoverImageUrl(res.url || URL.createObjectURL(file));
                sonner_1.toast.success('Cập nhật ảnh bìa thành công');
            }
        }
        catch (error) { }
        finally {
            e.target.value = '';
        }
    };
    const handleVideoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            const res = await uploadVideo(file, 'course_promotional_video');
            if (res?.id) {
                setValue('promotionalVideoId', res.id, { shouldDirty: true });
                setUploadedVideoName(file.name);
                sonner_1.toast.success('Đã tải lên video giới thiệu trực tiếp');
            }
        }
        catch (error) { }
        finally {
            e.target.value = '';
        }
    };
    const handleRemoveVideo = () => {
        setValue('promotionalVideoId', null, { shouldDirty: true });
        setUploadedVideoName(null);
    };
    const handleDeleteCourse = () => {
        if (window.confirm('Bạn có chắc chắn muốn Xóa / Lưu trữ khóa học này không? Hành động này không thể hoàn tác.')) {
            deleteCourse();
        }
    };
    const isPendingReview = course?.status === course_schema_1.CourseStatus.PENDING_REVIEW;
    const totalStudents = stats?.totalStudents || 0;
    const isFormLocked = isUpdatingDB || isUploadingImage || isUploadingVideo || isPendingReview || isDeleting;
    const isModeLocked = totalStudents > 0;
    const onSubmit = (data) => {
        if (isPendingReview)
            return;
        const payload = {
            ...data,
            benefits: data.benefits ? data.benefits.split('\n').filter(b => b.trim() !== '') : [],
            requirements: data.requirements ? data.requirements.split('\n').filter(r => r.trim() !== '') : [],
            promotionalVideoId: data.promotionalVideoId === null ? null : data.promotionalVideoId,
            coverImageId: data.coverImageId === null ? null : data.coverImageId,
        };
        updateCourse(payload);
    };
    if (isCourseLoading || isStatsLoading)
        return <skeleton_1.Skeleton className="w-full h-[600px] rounded-xl"/>;
    return (<div className="space-y-6">
      {isPendingReview && (<div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3 text-yellow-700">
          <lucide_react_1.AlertCircle className="w-5 h-5 shrink-0 mt-0.5"/>
          <div>
            <h4 className="font-bold text-sm">Khóa học đang được kiểm duyệt</h4>
            <p className="text-xs mt-1">Hệ thống đã khóa tính năng chỉnh sửa để đảm bảo tính toàn vẹn dữ liệu trong quá trình Admin thẩm định.</p>
          </div>
        </div>)}

      {course?.status === course_schema_1.CourseStatus.REJECTED && course.rejectionReason && (<div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 text-red-700">
          <lucide_react_1.AlertCircle className="w-5 h-5 shrink-0 mt-0.5"/>
          <div>
            <h4 className="font-bold text-sm">Khóa học bị từ chối xuất bản</h4>
            <p className="text-xs mt-1 font-medium">Lý do: {course.rejectionReason}</p>
          </div>
        </div>)}

      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 bg-card border border-border rounded-xl p-6 shadow-sm ${isPendingReview ? 'opacity-70 pointer-events-none' : ''}`}>

        <div className="space-y-4 bg-muted/30 p-5 rounded-lg border border-border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <lucide_react_1.Lock className="w-4 h-4 text-primary"/> Cấu hình Học tập & Kiểm tra
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Thiết lập luật chơi cho học viên. Dữ liệu này được làm mới mỗi 5 phút.
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                Học viên hiện tại: {totalStudents}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-medium">Chế độ học (Progression Mode)</label>
              <react_hook_form_1.Controller control={control} name="progressionMode" render={({ field }) => (<select_1.Select onValueChange={field.onChange} value={field.value} disabled={isFormLocked || isModeLocked}>
                    <select_1.SelectTrigger className={isModeLocked ? 'bg-muted cursor-not-allowed' : ''}>
                      <select_1.SelectValue placeholder="Chọn chế độ học"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="FREE">Tự do (Học bài nào cũng được)</select_1.SelectItem>
                      <select_1.SelectItem value="STRICT_LINEAR">Tuần tự (Bắt buộc từ trên xuống)</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>)}/>
              {isModeLocked && (<p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                  <lucide_react_1.Lock className="w-3 h-3"/> Đã có học viên ghi danh, bị khóa thay đổi để bảo vệ tiến độ.
                </p>)}
            </div>

            <div className="space-y-3 flex flex-col justify-center">
              <div className="flex items-center justify-between border rounded-lg p-3 bg-background">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Bắt buộc Thi Qua Môn</label>
                  <p className="text-xs text-muted-foreground">Chỉ áp dụng khi chọn chế độ Tuần tự.</p>
                </div>
                <react_hook_form_1.Controller control={control} name="isStrictExam" render={({ field }) => (<switch_1.Switch checked={field.value} onCheckedChange={field.onChange} disabled={isFormLocked || isModeLocked || watch('progressionMode') === 'FREE'}/>)}/>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Thông tin Cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên khóa học <span className="text-red-500">*</span></label>
              <input_1.Input {...register('title')} disabled={isFormLocked}/>
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                <input_1.Input type="number" {...register('price')} disabled={isFormLocked}/>
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Giá khuyến mãi (VNĐ)</label>
                <input_1.Input type="number" {...register('discountPrice')} disabled={isFormLocked}/>
                {errors.discountPrice && <p className="text-xs text-red-500">{errors.discountPrice.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả khóa học</label>
            <textarea_1.Textarea {...register('description')} rows={4} disabled={isFormLocked}/>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Truyền thông & Hiển thị</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border border-dashed">
              <label className="text-sm font-medium">Ảnh bìa khóa học (Cover Image)</label>
              <div className="flex gap-4 items-start">
                <div className="relative w-40 h-24 bg-muted rounded-md overflow-hidden border border-border flex items-center justify-center shrink-0">
                  {coverImageUrl ? (<image_1.default src={coverImageUrl} alt="Cover" fill className="object-cover"/>) : (<span className="text-xs text-muted-foreground">Chưa có ảnh</span>)}
                </div>
                <div className="space-y-2 flex-grow">
                  <input_1.Input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" id="cover-upload" onChange={handleImageUpload} disabled={isFormLocked}/>
                  <button_1.Button type="button" variant="secondary" onClick={() => document.getElementById('cover-upload')?.click()} disabled={isFormLocked} className="w-full">
                    {isUploadingImage ? <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <lucide_react_1.UploadCloud className="mr-2 h-4 w-4"/>}
                    {isUploadingImage ? 'Đang tải...' : 'Chọn ảnh mới'}
                  </button_1.Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border border-dashed">
              <label className="text-sm font-medium flex items-center gap-2">
                <lucide_react_1.Video className="w-4 h-4 text-blue-500"/> Video Giới thiệu
              </label>
              <div className="space-y-3">
                {!isUploadingVideo && !currentVideoId && (<div className="flex items-center gap-3">
                    <input_1.Input type="file" accept="video/mp4,video/webm" className="hidden" id="promo-video-upload" onChange={handleVideoUpload} disabled={isFormLocked}/>
                    <button_1.Button type="button" variant="secondary" onClick={() => document.getElementById('promo-video-upload')?.click()} disabled={isFormLocked}>
                      <lucide_react_1.UploadCloud className="mr-2 h-4 w-4"/> Tải lên Video MP4
                    </button_1.Button>
                  </div>)}
                {isUploadingVideo && (<div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium"><span className="text-muted-foreground">Đang tải lên...</span><span className="text-blue-600">{videoProgress}%</span></div>
                    <progress_1.Progress value={videoProgress} className="h-2"/>
                  </div>)}
                {!isUploadingVideo && currentVideoId && (<div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-md">
                    <span className="text-sm font-medium text-green-600 truncate max-w-[200px] flex items-center gap-2">
                      <lucide_react_1.CheckCircle2 className="w-4 h-4 shrink-0"/> {uploadedVideoName || 'Đã gắn Video'}
                    </span>
                    <button_1.Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={handleRemoveVideo} disabled={isFormLocked}><lucide_react_1.X className="w-4 h-4"/></button_1.Button>
                  </div>)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button_1.Button type="submit" disabled={isFormLocked || !isDirty} className="min-w-[150px]">
            {isUpdatingDB ? <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <lucide_react_1.Save className="mr-2 h-4 w-4"/>}
            {isUpdatingDB ? 'Đang lưu...' : 'Lưu Cài đặt'}
          </button_1.Button>
        </div>
      </form>

      <div className="border border-red-200 bg-red-50/30 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
            <lucide_react_1.Trash2 className="w-5 h-5"/> Cài đặt Nguy hiểm
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Nếu khóa học đã có người mua, hệ thống sẽ tự động chuyển sang <strong>Trạng thái Lưu trữ (Archived)</strong> thay vì xóa vĩnh viễn để bảo vệ học viên cũ.
          </p>
        </div>
        <button_1.Button type="button" variant="destructive" onClick={handleDeleteCourse} disabled={isFormLocked || isDeleting}>
          {isDeleting ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
          Xóa Khóa Học
        </button_1.Button>
      </div>
    </div>);
}
//# sourceMappingURL=CourseSettingsForm.js.map