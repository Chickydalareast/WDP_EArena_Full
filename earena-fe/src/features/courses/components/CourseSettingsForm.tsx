'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { baseUpdateCourseSchema, UpdateCourseDTO, CourseStatus } from '../types/course.schema';
import { useCourseSettings, useUpdateCourse } from '../hooks/useCourseSettings';

// [CTO UPGRADE]: Sử dụng hook "Max Ping" duy nhất cho cả Ảnh và Video
import { useCloudinaryUpload } from '@/shared/hooks/useCloudinaryUpload'; 

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Progress } from '@/shared/components/ui/progress';
import { Loader2, Save, UploadCloud, Video, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const formSchema = baseUpdateCourseSchema
  .omit({ benefits: true, requirements: true })
  .extend({
    benefits: z.string().optional(),
    requirements: z.string().optional(),
    promotionalVideoId: z.string().nullable().optional(),
    coverImageId: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (typeof data.price === 'number' && typeof data.discountPrice === 'number') {
      if (data.discountPrice > data.price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Giá khuyến mãi không được lớn hơn giá gốc",
          path: ["discountPrice"],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

export function CourseSettingsForm({ courseId }: { courseId: string }) {
  const { data: course, isLoading } = useCourseSettings(courseId);
  const { mutate: updateCourse, isPending: isUpdatingDB } = useUpdateCourse(courseId);

  // [CTO UPGRADE]: Khởi tạo 2 instance của hook Max Ping
  const { uploadDirectly: uploadImage, isUploading: isUploadingImage } = useCloudinaryUpload();
  const { uploadDirectly: uploadVideo, isUploading: isUploadingVideo, progress: videoProgress } = useCloudinaryUpload();

  // Local UI State cho việc Preview
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // Đồng bộ Server State vào Form
  useEffect(() => {
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
      });
      setCoverImageUrl(course.coverImage?.url || null);
      setUploadedVideoName(null);
    }
  }, [course, reset]);

  const currentVideoId = watch('promotionalVideoId');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Ép kiểu (as any) tạm thời nếu MediaContextType chưa có strict type cho 'course_thumbnail'
      const res = await uploadImage(file, 'course_thumbnail' as any); 
      if (res?.id) {
        setValue('coverImageId', res.id, { shouldDirty: true });
        setCoverImageUrl(res.url || URL.createObjectURL(file));
        toast.success('Cập nhật ảnh bìa thành công');
      }
    } catch (error) {
      // Lỗi đã được parse và báo Toast trong hook useCloudinaryUpload
    } finally {
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadVideo(file, 'course_promotional_video' as any);
      if (res?.id) {
        setValue('promotionalVideoId', res.id, { shouldDirty: true });
        setUploadedVideoName(file.name);
        toast.success('Đã tải lên video giới thiệu trực tiếp (Direct-to-Cloud)');
      }
    } catch (error) {
      // Xử lý lỗi ngầm bên trong hook
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveVideo = () => {
    setValue('promotionalVideoId', null, { shouldDirty: true });
    setUploadedVideoName(null);
  };

  // [CTO UPGRADE]: Logic Khóa UI khi đang chờ duyệt
  const isPendingReview = course?.status === CourseStatus.PENDING; // Lưu ý: dựa theo schema, thường là PENDING thay vì PENDING_REVIEW
  const isFormLocked = isUpdatingDB || isUploadingImage || isUploadingVideo || isPendingReview;

  const onSubmit = (data: FormValues) => {
    // Không cho submit nếu đang pending
    if (isPendingReview) return;

    const payload: UpdateCourseDTO = {
      ...data,
      benefits: data.benefits ? data.benefits.split('\n').filter(b => b.trim() !== '') : [],
      requirements: data.requirements ? data.requirements.split('\n').filter(r => r.trim() !== '') : [],
      promotionalVideoId: data.promotionalVideoId === null ? null : data.promotionalVideoId,
      coverImageId: data.coverImageId === null ? null : data.coverImageId,
    };

    updateCourse(payload);
  };

  if (isLoading) return <Skeleton className="w-full h-[600px] rounded-xl" />;

  return (
    <div className="space-y-6">
      {/* CẢNH BÁO: Bị Khóa (UI Lock Banner) */}
      {isPendingReview && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3 text-yellow-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Khóa học đang được kiểm duyệt</h4>
            <p className="text-xs mt-1">Hệ thống đã khóa tính năng chỉnh sửa để đảm bảo tính toàn vẹn dữ liệu trong quá trình Admin thẩm định. Bạn không thể cập nhật thông tin lúc này.</p>
          </div>
        </div>
      )}

      {/* CẢNH BÁO: Bị Từ chối (Rejection Banner) */}
      {course?.status === CourseStatus.REJECTED && course.rejectReason && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Khóa học bị từ chối xuất bản</h4>
            <p className="text-xs mt-1 font-medium">Lý do: {course.rejectReason}</p>
            <p className="text-xs mt-2 italic">Vui lòng khắc phục các vấn đề trên và gửi yêu cầu duyệt lại.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm ${isPendingReview ? 'opacity-70 pointer-events-none' : ''}`}>
        
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Thông tin Cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên khóa học <span className="text-red-500">*</span></label>
              <Input {...register('title')} disabled={isFormLocked} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                <Input type="number" {...register('price')} disabled={isFormLocked} />
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Giá khuyến mãi (VNĐ)</label>
                <Input type="number" {...register('discountPrice')} disabled={isFormLocked} />
                {errors.discountPrice && <p className="text-xs text-red-500">{errors.discountPrice.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả khóa học</label>
            <Textarea {...register('description')} rows={4} disabled={isFormLocked} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Truyền thông & Hiển thị</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* KHỐI 1: ẢNH BÌA */}
            <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border border-dashed">
              <label className="text-sm font-medium">Ảnh bìa khóa học (Cover Image)</label>
              <div className="flex gap-4 items-start">
                <div className="relative w-40 h-24 bg-muted rounded-md overflow-hidden border border-border flex items-center justify-center shrink-0">
                  {coverImageUrl ? (
                    <Image src={coverImageUrl} alt="Cover" fill className="object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Chưa có ảnh</span>
                  )}
                </div>
                <div className="space-y-2 flex-grow">
                  <Input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" id="cover-upload" onChange={handleImageUpload} disabled={isFormLocked} />
                  <Button type="button" variant="secondary" onClick={() => document.getElementById('cover-upload')?.click()} disabled={isFormLocked} className="w-full">
                    {isUploadingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    {isUploadingImage ? 'Đang tải lên...' : 'Chọn ảnh mới'}
                  </Button>
                  <p className="text-[11px] text-muted-foreground">Khuyên dùng tỷ lệ 16:9, dung lượng {'<'} 5MB</p>
                </div>
              </div>
            </div>

            {/* KHỐI 2: VIDEO GIỚI THIỆU (Refactored to Max Ping) */}
            <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border border-dashed">
              <label className="text-sm font-medium flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-500" /> Video Giới thiệu (Promotional Video)
              </label>
              <div className="space-y-3">

                {!isUploadingVideo && !currentVideoId && (
                  <div className="flex items-center gap-3">
                    <Input type="file" accept="video/mp4,video/webm" className="hidden" id="promo-video-upload" onChange={handleVideoUpload} disabled={isFormLocked} />
                    <Button type="button" variant="secondary" onClick={() => document.getElementById('promo-video-upload')?.click()} disabled={isFormLocked}>
                      <UploadCloud className="mr-2 h-4 w-4" /> Tải lên Video MP4
                    </Button>
                    <span className="text-xs text-muted-foreground">Tối đa 2GB</span>
                  </div>
                )}

                {isUploadingVideo && (
                  <div className="space-y-2 animate-in fade-in duration-300 bg-background p-3 rounded-md border border-border">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Đang tải lên an toàn (Direct-to-Cloud)...</span>
                      <span className="text-blue-600">{videoProgress}%</span>
                    </div>
                    <Progress value={videoProgress} className="h-2 bg-slate-100" indicatorColor="bg-blue-500" />
                  </div>
                )}

                {!isUploadingVideo && currentVideoId && (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-md">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-sm font-medium text-green-600 truncate max-w-[200px]">
                        {uploadedVideoName ? uploadedVideoName : 'Đã gắn Video giới thiệu'}
                      </span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-100" onClick={handleRemoveVideo} disabled={isFormLocked}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Trang bị & Yêu cầu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Học sinh nhận được gì? (Mỗi dòng 1 lợi ích)</label>
              <Textarea {...register('benefits')} rows={5} placeholder="VD: Nắm vững 100% kiến thức nền tảng..." disabled={isFormLocked} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yêu cầu đầu vào (Mỗi dòng 1 yêu cầu)</label>
              <Textarea {...register('requirements')} rows={5} placeholder="VD: Đã học xong chương trình Toán 10..." disabled={isFormLocked} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isFormLocked || !isDirty} className="min-w-[150px]">
            {isUpdatingDB ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isUpdatingDB ? 'Đang lưu...' : 'Lưu Cài đặt'}
          </Button>
        </div>
      </form>
    </div>
  );
}