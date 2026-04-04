'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseFeaturedCarousel = CourseFeaturedCarousel;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const course_keys_1 = require("../api/course-keys");
const course_service_1 = require("../api/course.service");
const routes_1 = require("@/config/routes");
const utils_1 = require("@/shared/lib/utils");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
function CourseFeaturedCarousel() {
    const scrollRef = (0, react_1.useRef)(null);
    const { data, isLoading, isError } = (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.featuredCarousel(),
        queryFn: () => course_service_1.courseService.getFeaturedCarousel(),
        staleTime: 1000 * 60 * 2,
    });
    const items = (data?.items ?? []);
    const scroll = (dir) => {
        const el = scrollRef.current;
        if (!el)
            return;
        el.scrollBy({ left: dir * 360, behavior: 'smooth' });
    };
    if (isLoading) {
        return (<div className="mb-8 flex h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }
    if (isError || items.length === 0)
        return null;
    return (<section className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <lucide_react_1.Sparkles className="w-5 h-5 text-primary"/>
            Khóa học nổi bật
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gói Enterprise & khóa đang chạy quảng cáo có phí
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button_1.Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => scroll(-1)} aria-label="Trước">
            <lucide_react_1.ChevronLeft className="w-4 h-4"/>
          </button_1.Button>
          <button_1.Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => scroll(1)} aria-label="Sau">
            <lucide_react_1.ChevronRight className="w-4 h-4"/>
          </button_1.Button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((course) => {
            const img = course.coverImage?.url ||
                'https://placehold.co/640x360/e2e8f0/64748b?text=Course';
            const price = course.discountPrice !== undefined && course.discountPrice > 0
                ? course.discountPrice
                : course.price;
            return (<link_1.default key={course.id} href={routes_1.ROUTES.PUBLIC.COURSE_DETAIL(course.slug)} className="snap-start shrink-0 w-[min(100%,300px)] flex flex-col rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition overflow-hidden">
              <div className="relative aspect-video w-full bg-muted">
                <image_1.default src={img} alt="" fill className="object-cover" sizes="300px" unoptimized={img.includes('placehold.co')}/>
              </div>
              <div className="p-3 space-y-1">
                <p className="font-semibold line-clamp-2 text-sm">{course.title}</p>
                <p className="text-sm text-primary font-bold">
                  {price === 0 ? 'Miễn phí' : (0, utils_1.formatCurrency)(price)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {course.teacher?.fullName || 'Giảng viên'}
                </p>
              </div>
            </link_1.default>);
        })}
      </div>
    </section>);
}
//# sourceMappingURL=CourseFeaturedCarousel.js.map