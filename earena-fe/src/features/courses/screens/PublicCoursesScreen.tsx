'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { usePublicCourses } from '../hooks/useCourses';
import { CourseCard, CourseCardSkeleton } from '../components/CourseCard';
import { CourseFilters } from '../components/CourseFilters';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import { Search, AlertCircle, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Loader2, SlidersHorizontal, ArrowDownAZ } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { useDebounce } from '@/shared/hooks/useDebounce';

function PublicCoursesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Đọc & Parse State từ URL chặt chẽ
  const currentKeyword = searchParams.get('keyword') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSubjectId = searchParams.get('subjectId') || undefined;
  const isFree = searchParams.get('isFree') === 'true' ? true : undefined;
  
  // Parse số an toàn
  const minPriceParam = searchParams.get('minPrice');
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPriceParam = searchParams.get('maxPrice');
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
  
  const currentSort = (searchParams.get('sort') as 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'POPULAR') || 'NEWEST';
  const limit = 12;

  const [inputValue, setInputValue] = useState(currentKeyword);
  const debouncedKeyword = useDebounce(inputValue, 500);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Đồng bộ Keyword
  useEffect(() => {
    if (debouncedKeyword !== currentKeyword) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedKeyword) params.set('keyword', debouncedKeyword);
      else params.delete('keyword');
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedKeyword, currentKeyword, pathname, router, searchParams]);

  useEffect(() => setInputValue(currentKeyword), [currentKeyword]);

  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Gọi Hook Fetch Data với full params mới
  const { data, isLoading, isError } = usePublicCourses({
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

  return (
    <div className="w-full bg-background animate-in fade-in duration-500 pb-20">
      
      {/* --- HERO BANNER (Giữ nguyên) --- */}
      <div className="bg-slate-950 text-white py-12 md:py-20 px-4 relative overflow-hidden">
        {/* ... (Phần đồ họa nền giữ nguyên) ... */}
        <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 mb-2">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-3xl">
            Khám phá Tri thức <br className="hidden md:block" /> Vươn tới Tương lai
          </h1>

          <div className="w-full max-w-2xl mt-8 relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md transition-opacity opacity-0 group-focus-within:opacity-100"></div>
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full p-1 border-2 border-white/10 shadow-2xl">
              <div className="pl-4 pr-2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tìm kiếm môn học, tên khóa học, giáo viên..."
                className="border-none shadow-none focus-visible:ring-0 text-slate-900 dark:text-white bg-transparent h-12 text-base w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- BODY: LAYOUT BỘ LỌC & DANH SÁCH --- */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Thanh công cụ Sắp xếp & Nút lọc Mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-border/50 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {currentKeyword ? `Kết quả cho "${currentKeyword}"` : 'Tất cả khóa học'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Tìm thấy {meta.total} khóa học phù hợp</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Nút bật Drawer Lọc trên Mobile */}
            <div className="lg:hidden">
              <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-10 gap-2 font-semibold">
                    <SlidersHorizontal className="w-4 h-4" /> Lọc
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-6 overflow-y-auto">
                  <CourseFilters onCloseMobile={() => setIsMobileFilterOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Custom Select cho Sắp xếp (Dùng HTML native mix Tailwind để tránh xin file thêm) */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <ArrowDownAZ className="w-4 h-4 text-muted-foreground" />
              </div>
              <select 
                className="w-full h-10 pl-9 pr-8 text-sm font-medium bg-muted/30 border border-border rounded-lg appearance-none outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                value={currentSort}
                onChange={(e) => updateUrlParam('sort', e.target.value)}
              >
                <option value="NEWEST">Mới nhất</option>
                <option value="POPULAR">Phổ biến nhất</option>
                <option value="PRICE_ASC">Giá: Thấp đến cao</option>
                <option value="PRICE_DESC">Giá: Cao xuống thấp</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          
          {/* Cột trái: Sidebar Bộ lọc (Chỉ hiện trên Desktop) */}
          <aside className="hidden lg:block w-1/4 shrink-0 sticky top-24 bg-card p-6 rounded-2xl border border-border shadow-sm">
             <CourseFilters />
          </aside>

          {/* Cột phải: Lưới Khóa học */}
          <main className="w-full lg:w-3/4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={`skeleton-${i}`} />)}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-500 font-medium bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100">
                <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Không thể tải dữ liệu</h3>
              </div>
            ) : courseList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                <BookOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Không tìm thấy khóa học phù hợp</h3>
                <p className="text-sm text-muted-foreground">Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courseList.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border/50">
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded-full">
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="text-sm font-bold text-muted-foreground">
                      Trang <span className="text-foreground">{currentPage}</span> / {meta.totalPages}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(Math.min(meta.totalPages, currentPage + 1))} disabled={currentPage === meta.totalPages} className="rounded-full">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export function PublicCoursesScreen() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Đang khởi tạo...</p>
      </div>
    }>
      <PublicCoursesContent />
    </Suspense>
  );
}