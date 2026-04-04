'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseCard = CourseCard;
exports.CourseCardSkeleton = CourseCardSkeleton;
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const useBillingFlows_1 = require("@/features/billing/hooks/useBillingFlows");
const routes_1 = require("@/config/routes");
const utils_1 = require("@/shared/lib/utils");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
function CourseCard({ course }) {
    const router = (0, navigation_1.useRouter)();
    const { handleCheckout, isProcessing } = (0, useBillingFlows_1.useCheckoutFlow)();
    const finalPrice = course.discountPrice !== undefined ? course.discountPrice : course.price;
    const isFree = finalPrice === 0;
    const teacherInfo = course.teacher || { fullName: 'Giảng viên EArena', avatar: '' };
    const safeImageUrl = course.coverImage?.url || 'https://placehold.co/600x400/EEE/31343C?text=EArena+Course';
    const blurProps = course.coverImage?.blurHash?.startsWith('data:image')
        ? { placeholder: "blur", blurDataURL: course.coverImage.blurHash } : {};
    const onPrimaryActionClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (course.isEnrolled) {
            router.push(routes_1.ROUTES.STUDENT.STUDY_ROOM(course.id));
            return;
        }
        handleCheckout(course);
    };
    return (<div className="group flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 relative">

      
      <link_1.default href={routes_1.ROUTES.PUBLIC.COURSE_DETAIL(course.slug)} className="absolute inset-0 z-10" aria-label={`Xem chi tiết khóa học ${course.title}`}/>

      {isProcessing && (<div className="absolute inset-0 bg-background/60 z-30 flex items-center justify-center backdrop-blur-sm">
          <lucide_react_1.Loader2 className="w-8 h-8 animate-spin text-primary drop-shadow-md"/>
        </div>)}

      
      <div className="relative aspect-[16/10] w-full bg-muted overflow-hidden border-b border-border/50">
        <image_1.default src={safeImageUrl} alt={course.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" {...blurProps}/>

        {course.subject?.name && (<div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm z-10 uppercase tracking-wider border border-white/10 pointer-events-none">
            {course.subject.name}
          </div>)}

        <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
          {course.isEnrolled && (<div className="bg-primary/90 text-primary-foreground backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
              Đã Sở Hữu
            </div>)}
          {!course.isEnrolled && isFree && (<div className="bg-green-500/90 text-white backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
              Miễn phí
            </div>)}
        </div>
      </div>

      
      <div className="flex flex-col flex-1 p-5 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
            {teacherInfo.avatar ? (<image_1.default src={teacherInfo.avatar} alt={teacherInfo.fullName} width={24} height={24} className="object-cover w-full h-full"/>) : (<span className="text-[10px] font-bold text-primary">{teacherInfo.fullName.charAt(0)}</span>)}
          </div>
          <span className="text-xs text-muted-foreground font-semibold truncate transition-colors">
            {teacherInfo.fullName}
          </span>
        </div>

        
        <div className="flex items-center gap-1.5 mb-2">
          {course.averageRating && course.averageRating > 0 ? (<>
              <lucide_react_1.Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500"/>
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500">
                {Number(course.averageRating).toFixed(1)}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                ({course.totalReviews} đánh giá)
              </span>
            </>) : (<span className="text-[11px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
               Chưa có đánh giá
             </span>)}
        </div>

        <h3 className="text-base font-extrabold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
          {course.title}
        </h3>

        <div className="flex-1"/>

        <div className="flex items-end justify-between mt-4 pt-4 border-t border-border/60 pointer-events-auto relative z-20">

          <div className="flex flex-col">
            {!course.isEnrolled && course.discountPrice !== undefined && course.discountPrice > 0 && course.discountPrice < course.price && (<span className="text-xs text-muted-foreground line-through decoration-red-500/50 font-medium">
                {(0, utils_1.formatCurrency)(course.price)}
              </span>)}

            {course.isEnrolled ? (<span className="text-sm font-bold text-primary">Tiếp tục học</span>) : (<span className="text-lg font-extrabold text-primary tracking-tight">
                {isFree ? 'Miễn phí' : (0, utils_1.formatCurrency)(finalPrice)}
              </span>)}
          </div>

          <button_1.Button size="sm" onClick={onPrimaryActionClick} disabled={isProcessing} className={`rounded-full px-4 font-bold shadow-md transition-all ${course.isEnrolled ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}>
            {isProcessing ? (<lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/>) : course.isEnrolled ? (<>Vào lớp <lucide_react_1.MonitorPlay className="ml-1.5 w-4 h-4"/></>) : isFree ? (<>Học ngay <lucide_react_1.BookOpen className="ml-1.5 w-4 h-4"/></>) : (<>Mua ngay <lucide_react_1.ShoppingCart className="ml-1.5 w-4 h-4"/></>)}
          </button_1.Button>

        </div>
      </div>
    </div>);
}
function CourseCardSkeleton() {
    return (<div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <skeleton_1.Skeleton className="relative aspect-[16/10] w-full rounded-none"/>
      <div className="flex flex-col flex-1 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <skeleton_1.Skeleton className="w-6 h-6 rounded-full"/>
          <skeleton_1.Skeleton className="h-3 w-24 rounded-full"/>
        </div>
        <skeleton_1.Skeleton className="h-5 w-full rounded-md"/>
        <skeleton_1.Skeleton className="h-5 w-2/3 rounded-md"/>
        <div className="flex-1"/>
        <div className="flex items-end justify-between mt-4 pt-4 border-t border-border/60">
          <skeleton_1.Skeleton className="h-6 w-24 rounded-md"/>
          <skeleton_1.Skeleton className="h-9 w-28 rounded-full"/>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=CourseCard.js.map