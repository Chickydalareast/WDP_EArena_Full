'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherCourseCard = TeacherCourseCard;
exports.TeacherCourseCardSkeleton = TeacherCourseCardSkeleton;
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const course_schema_1 = require("../types/course.schema");
const utils_1 = require("@/shared/lib/utils");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const routes_1 = require("@/config/routes");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
const button_1 = require("@/shared/components/ui/button");
const PromoteCourseModal_1 = require("./PromoteCourseModal");
const STATUS_CONFIG = {
    [course_schema_1.CourseStatus.DRAFT]: { label: 'Bản Nháp', className: 'bg-slate-500 text-white' },
    [course_schema_1.CourseStatus.PENDING_REVIEW]: { label: 'Chờ Duyệt', className: 'bg-yellow-500 text-yellow-950 animate-pulse' },
    [course_schema_1.CourseStatus.REJECTED]: { label: 'Bị Từ Chối', className: 'bg-red-500 text-white' },
    [course_schema_1.CourseStatus.PUBLISHED]: { label: 'Đang On Air', className: 'bg-green-500 text-white shadow-green-500/50' },
    [course_schema_1.CourseStatus.ARCHIVED]: { label: 'Lưu Trữ', className: 'bg-gray-500 text-white' },
};
function TeacherCourseCard({ course }) {
    const [promoteOpen, setPromoteOpen] = (0, react_1.useState)(false);
    const statusKey = Object.keys(STATUS_CONFIG).includes(course.status)
        ? course.status
        : course_schema_1.CourseStatus.DRAFT;
    const status = STATUS_CONFIG[statusKey];
    return (<div className="group flex flex-col h-full bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      
      
      <link_1.default href={routes_1.ROUTES.TEACHER.COURSE_DETAIL(course.id)} className="relative aspect-video w-full bg-muted overflow-hidden flex items-center justify-center">
        {course.coverImage?.url ? (<image_1.default src={course.coverImage.url} alt={course.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105"/>) : (<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center text-primary/30 group-hover:scale-105 transition-transform duration-500">
             <lucide_react_1.GraduationCap className="w-12 h-12 mb-2"/>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">EArena Course</span>
          </div>)}
        
        
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${status.className}`}>
          {status.label}
        </div>

        {course.status === course_schema_1.CourseStatus.REJECTED && (<div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 text-center z-20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-white">
              <lucide_react_1.AlertCircle className="w-8 h-8 text-red-400"/>
              <p className="text-xs font-medium">Bị từ chối. Cần chỉnh sửa lại nội dung!</p>
            </div>
          </div>)}
      </link_1.default>

      
      <div className="flex flex-col flex-1 p-5">
        
        
        <div className="flex items-start justify-between gap-3 mb-3">
          <link_1.default href={routes_1.ROUTES.TEACHER.COURSE_DETAIL(course.id)} className="flex-1 hover:text-primary transition-colors">
            <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug" title={course.title}>
              {course.title}
            </h3>
          </link_1.default>
          
          
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full">
                <lucide_react_1.MoreVertical className="w-4 h-4"/>
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end" className="w-56 font-medium">
              <dropdown_menu_1.DropdownMenuItem asChild>
                <link_1.default href={routes_1.ROUTES.TEACHER.COURSE_CURRICULUM(course.id)} className="cursor-pointer flex items-center py-2">
                  <lucide_react_1.BookOpen className="mr-2 w-4 h-4 text-primary"/> Quản lý giáo án
                </link_1.default>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem asChild>
                <link_1.default href={routes_1.ROUTES.TEACHER.COURSE_SETTINGS(course.id)} className="cursor-pointer flex items-center py-2">
                  <lucide_react_1.Settings className="mr-2 w-4 h-4 text-muted-foreground"/> Cài đặt chung
                </link_1.default>
              </dropdown_menu_1.DropdownMenuItem>
              
              <dropdown_menu_1.DropdownMenuSeparator />

              {course.status === 'PUBLISHED' && (<dropdown_menu_1.DropdownMenuItem className="cursor-pointer flex items-center py-2 text-primary" onSelect={(e) => {
                e.preventDefault();
                setPromoteOpen(true);
            }}>
                  <lucide_react_1.Megaphone className="mr-2 w-4 h-4"/> Quảng cáo (slider)
                </dropdown_menu_1.DropdownMenuItem>)}
              
              <dropdown_menu_1.DropdownMenuItem asChild>
                <link_1.default href={`${routes_1.ROUTES.PUBLIC.COURSE_DETAIL(course.slug)}#reviews`} target="_blank" className="cursor-pointer flex items-center py-2">
                  <lucide_react_1.MessageSquare className="mr-2 w-4 h-4 text-amber-500"/> Phản hồi đánh giá
                </link_1.default>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem asChild>
                <link_1.default href={routes_1.ROUTES.PUBLIC.COURSE_DETAIL(course.slug)} target="_blank" className="cursor-pointer flex items-center py-2">
                  <lucide_react_1.ExternalLink className="mr-2 w-4 h-4 text-muted-foreground"/> Xem trang Public
                </link_1.default>
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </div>

        
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
           <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/50">
              <lucide_react_1.Users className="w-4 h-4 text-blue-500"/>
              <span className="font-bold text-foreground">{course.studentCount?.toLocaleString('vi-VN') || 0}</span> học viên
           </div>
           
           <div className="flex items-center gap-1.5 text-muted-foreground">
             <lucide_react_1.Star className={(0, utils_1.cn)("w-4 h-4", course.averageRating && course.averageRating > 0 ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/50")}/>
             <span className="font-bold text-foreground">
               {course.averageRating && course.averageRating > 0 ? Number(course.averageRating).toFixed(1) : 'Chưa có'}
             </span>
             {course.totalReviews && course.totalReviews > 0 ? (<span className="text-[11px] opacity-70">({course.totalReviews})</span>) : null}
           </div>
        </div>

        
        <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-border">
          <div className="flex items-center justify-between">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Giá bán</span>
             <strong className="text-primary text-base font-black">
               {course.price === 0 ? 'Miễn phí' : (0, utils_1.formatCurrency)(course.price)}
             </strong>
          </div>
          
          <link_1.default href={routes_1.ROUTES.TEACHER.COURSE_DETAIL(course.id)} className="w-full">
            <button_1.Button variant="default" className="w-full font-bold shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              Quản lý Khóa học <lucide_react_1.ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"/>
            </button_1.Button>
          </link_1.default>
        </div>

        <PromoteCourseModal_1.PromoteCourseModal open={promoteOpen} onOpenChange={setPromoteOpen} courseId={course.id} courseTitle={course.title}/>
      </div>
    </div>);
}
function TeacherCourseCardSkeleton() {
    return (<div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      <skeleton_1.Skeleton className="relative aspect-video w-full rounded-none"/>
      <div className="flex flex-col flex-1 p-5 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <skeleton_1.Skeleton className="h-6 w-full rounded-md"/>
          <skeleton_1.Skeleton className="h-8 w-8 rounded-full shrink-0"/>
        </div>
        <div className="flex gap-4">
          <skeleton_1.Skeleton className="h-6 w-24 rounded-md"/>
          <skeleton_1.Skeleton className="h-6 w-16 rounded-md"/>
        </div>
        <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-border">
          <div className="flex justify-between items-center">
            <skeleton_1.Skeleton className="h-4 w-16"/>
            <skeleton_1.Skeleton className="h-6 w-24"/>
          </div>
          <skeleton_1.Skeleton className="h-10 w-full rounded-md"/>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=TeacherCourseCard.js.map