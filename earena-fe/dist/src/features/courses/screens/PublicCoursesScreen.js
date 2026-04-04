'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicCoursesScreen = PublicCoursesScreen;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const useCourses_1 = require("../hooks/useCourses");
const CourseCard_1 = require("../components/CourseCard");
const CourseFeaturedCarousel_1 = require("../components/CourseFeaturedCarousel");
const CourseFilters_1 = require("../components/CourseFilters");
const sheet_1 = require("@/shared/components/ui/sheet");
const lucide_react_1 = require("lucide-react");
const input_1 = require("@/shared/components/ui/input");
const button_1 = require("@/shared/components/ui/button");
const useDebounce_1 = require("@/shared/hooks/useDebounce");
function PublicCoursesContent() {
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const currentKeyword = searchParams.get('keyword') || '';
    const currentPage = Number(searchParams.get('page')) || 1;
    const currentSubjectId = searchParams.get('subjectId') || undefined;
    const isFree = searchParams.get('isFree') === 'true' ? true : undefined;
    const minPriceParam = searchParams.get('minPrice');
    const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
    const maxPriceParam = searchParams.get('maxPrice');
    const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
    const currentSort = searchParams.get('sort') || 'NEWEST';
    const limit = 12;
    const [inputValue, setInputValue] = (0, react_1.useState)(currentKeyword);
    const debouncedKeyword = (0, useDebounce_1.useDebounce)(inputValue, 500);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (debouncedKeyword !== currentKeyword) {
            const params = new URLSearchParams(searchParams.toString());
            if (debouncedKeyword)
                params.set('keyword', debouncedKeyword);
            else
                params.delete('keyword');
            params.set('page', '1');
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [debouncedKeyword, currentKeyword, pathname, router, searchParams]);
    (0, react_1.useEffect)(() => setInputValue(currentKeyword), [currentKeyword]);
    const updateUrlParam = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };
    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };
    const { data, isLoading, isError } = (0, useCourses_1.usePublicCourses)({
        page: currentPage,
        limit,
        keyword: currentKeyword || undefined,
        subjectId: currentSubjectId,
        isFree,
        minPrice,
        maxPrice,
        sort: currentSort
    });
    const courseList = data?.items || [];
    const meta = data?.meta || { page: 1, limit: 12, total: 0, totalPages: 1 };
    return (<div className="w-full bg-background animate-in fade-in duration-500 pb-20">
      
      
      <div className="bg-slate-950 text-white py-12 md:py-20 px-4 relative overflow-hidden">
        
        <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 mb-2">
            <lucide_react_1.GraduationCap className="w-8 h-8 text-primary"/>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-3xl">
            Khám phá Tri thức <br className="hidden md:block"/> Vươn tới Tương lai
          </h1>

          <div className="w-full max-w-2xl mt-8 relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md transition-opacity opacity-0 group-focus-within:opacity-100"></div>
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full p-1 border-2 border-white/10 shadow-2xl">
              <div className="pl-4 pr-2 text-slate-400">
                <lucide_react_1.Search className="w-5 h-5"/>
              </div>
              <input_1.Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Tìm kiếm môn học, tên khóa học, giáo viên..." className="border-none shadow-none focus-visible:ring-0 text-slate-900 dark:text-white bg-transparent h-12 text-base w-full"/>
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-border/50 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {currentKeyword ? `Kết quả cho "${currentKeyword}"` : 'Tất cả khóa học'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Tìm thấy {meta.total} khóa học phù hợp</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            
            <div className="lg:hidden">
              <sheet_1.Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <sheet_1.SheetTrigger asChild>
                  <button_1.Button variant="outline" className="h-10 gap-2 font-semibold">
                    <lucide_react_1.SlidersHorizontal className="w-4 h-4"/> Lọc
                  </button_1.Button>
                </sheet_1.SheetTrigger>
                <sheet_1.SheetContent side="left" className="w-[300px] sm:w-[350px] p-6 overflow-y-auto">
                  <CourseFilters_1.CourseFilters onCloseMobile={() => setIsMobileFilterOpen(false)}/>
                </sheet_1.SheetContent>
              </sheet_1.Sheet>
            </div>

            
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <lucide_react_1.ArrowDownAZ className="w-4 h-4 text-muted-foreground"/>
              </div>
              <select className="w-full h-10 pl-9 pr-8 text-sm font-medium bg-muted/30 border border-border rounded-lg appearance-none outline-none focus:ring-2 focus:ring-primary cursor-pointer" value={currentSort} onChange={(e) => updateUrlParam('sort', e.target.value)}>
                <option value="NEWEST">Mới nhất</option>
                <option value="POPULAR">Phổ biến nhất</option>
                <option value="PRICE_ASC">Giá: Thấp đến cao</option>
                <option value="PRICE_DESC">Giá: Cao xuống thấp</option>
              </select>
            </div>
          </div>
        </div>

        <CourseFeaturedCarousel_1.CourseFeaturedCarousel />

        <div className="flex gap-8 items-start">
          
          
          <aside className="hidden lg:block w-1/4 shrink-0 sticky top-24 bg-card p-6 rounded-2xl border border-border shadow-sm">
             <CourseFilters_1.CourseFilters />
          </aside>

          
          <main className="w-full lg:w-3/4">
            {isLoading ? (<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <CourseCard_1.CourseCardSkeleton key={`skeleton-${i}`}/>)}
              </div>) : isError ? (<div className="flex flex-col items-center justify-center py-20 text-red-500 font-medium bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100">
                <lucide_react_1.AlertCircle className="w-12 h-12 mb-4 opacity-80"/>
                <h3 className="text-xl font-bold mb-2">Không thể tải dữ liệu</h3>
              </div>) : courseList.length === 0 ? (<div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                <lucide_react_1.BookOpen className="w-16 h-16 text-muted-foreground/30 mb-4"/>
                <h3 className="text-lg font-bold text-foreground mb-2">Không tìm thấy khóa học phù hợp</h3>
                <p className="text-sm text-muted-foreground">Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.</p>
              </div>) : (<>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courseList.map((course) => (<CourseCard_1.CourseCard key={course.id} course={course}/>))}
                </div>

                {meta.totalPages > 1 && (<div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border/50">
                    <button_1.Button variant="outline" size="icon" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded-full">
                      <lucide_react_1.ChevronLeft className="w-5 h-5"/>
                    </button_1.Button>
                    <div className="text-sm font-bold text-muted-foreground">
                      Trang <span className="text-foreground">{currentPage}</span> / {meta.totalPages}
                    </div>
                    <button_1.Button variant="outline" size="icon" onClick={() => handlePageChange(Math.min(meta.totalPages, currentPage + 1))} disabled={currentPage === meta.totalPages} className="rounded-full">
                      <lucide_react_1.ChevronRight className="w-5 h-5"/>
                    </button_1.Button>
                  </div>)}
              </>)}
          </main>
        </div>
      </div>
    </div>);
}
function PublicCoursesScreen() {
    return (<react_1.Suspense fallback={<div className="w-full h-screen flex flex-col items-center justify-center bg-background">
        <lucide_react_1.Loader2 className="w-10 h-10 animate-spin text-primary"/>
        <p className="mt-4 text-muted-foreground font-medium">Đang khởi tạo...</p>
      </div>}>
      <PublicCoursesContent />
    </react_1.Suspense>);
}
//# sourceMappingURL=PublicCoursesScreen.js.map