'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseFilters = CourseFilters;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const useSubjects_1 = require("@/features/auth/hooks/useSubjects");
const checkbox_1 = require("@/shared/components/ui/checkbox");
const label_1 = require("@/shared/components/ui/label");
const input_1 = require("@/shared/components/ui/input");
const button_1 = require("@/shared/components/ui/button");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
function CourseFilters({ onCloseMobile }) {
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const { data: subjects, isLoading: isSubjectsLoading } = (0, useSubjects_1.useSubjects)();
    const currentSubjectId = searchParams.get('subjectId');
    const isFree = searchParams.get('isFree') === 'true';
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    const [localMin, setLocalMin] = (0, react_1.useState)(urlMinPrice || '');
    const [localMax, setLocalMax] = (0, react_1.useState)(urlMaxPrice || '');
    const [prevUrlMin, setPrevUrlMin] = (0, react_1.useState)(urlMinPrice);
    const [prevUrlMax, setPrevUrlMax] = (0, react_1.useState)(urlMaxPrice);
    if (urlMinPrice !== prevUrlMin || urlMaxPrice !== prevUrlMax) {
        setPrevUrlMin(urlMinPrice);
        setPrevUrlMax(urlMaxPrice);
        setLocalMin(urlMinPrice || '');
        setLocalMax(urlMaxPrice || '');
    }
    const updateFilters = (updates) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key);
            }
            else {
                params.set(key, value);
            }
        });
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };
    const handleApplyPrice = () => {
        const min = Number(localMin);
        const max = Number(localMax);
        if (localMin && localMax && min > max) {
            sonner_1.toast.error('Giá trị không hợp lệ', { description: 'Giá thấp nhất không được lớn hơn giá cao nhất.' });
            return;
        }
        updateFilters({
            minPrice: localMin ? localMin : null,
            maxPrice: localMax ? localMax : null,
            isFree: null
        });
        if (onCloseMobile)
            onCloseMobile();
    };
    const handleClearAll = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('subjectId');
        params.delete('isFree');
        params.delete('minPrice');
        params.delete('maxPrice');
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        if (onCloseMobile)
            onCloseMobile();
    };
    const hasActiveFilters = currentSubjectId || isFree || urlMinPrice || urlMaxPrice;
    return (<div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <lucide_react_1.Filter className="w-5 h-5 text-primary"/> Bộ lọc
                </h3>
                {hasActiveFilters && (<button_1.Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-muted-foreground hover:text-destructive px-2">
                        <lucide_react_1.Trash2 className="w-4 h-4 mr-1.5"/> Xóa lọc
                    </button_1.Button>)}
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <lucide_react_1.BookOpen className="w-4 h-4"/> Môn học
                </h4>
                <div className="space-y-3">
                    {isSubjectsLoading ? (<div className="space-y-3">
                            <skeleton_1.Skeleton className="h-4 w-3/4"/>
                            <skeleton_1.Skeleton className="h-4 w-1/2"/>
                            <skeleton_1.Skeleton className="h-4 w-2/3"/>
                        </div>) : (subjects?.map((subject) => (<div key={subject._id} className="flex items-center space-x-3">
                                <checkbox_1.Checkbox id={`subject-${subject._id}`} checked={currentSubjectId === subject._id} onCheckedChange={(checked) => {
                updateFilters({ subjectId: checked ? subject._id : null });
                if (onCloseMobile)
                    onCloseMobile();
            }}/>
                                <label_1.Label htmlFor={`subject-${subject._id}`} className="cursor-pointer hover:text-primary transition-colors leading-relaxed">
                                    {subject.name}
                                </label_1.Label>
                            </div>)))}
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <lucide_react_1.DollarSign className="w-4 h-4"/> Chi phí
                </h4>
                <div className="flex items-center space-x-3">
                    <checkbox_1.Checkbox id="filter-free" checked={isFree} onCheckedChange={(checked) => {
            updateFilters({
                isFree: checked ? 'true' : null,
                minPrice: null,
                maxPrice: null
            });
            if (onCloseMobile)
                onCloseMobile();
        }}/>
                    <label_1.Label htmlFor="filter-free" className="cursor-pointer hover:text-primary transition-colors">
                        Khóa học Miễn phí (Đã giảm giá 100%)
                    </label_1.Label>
                </div>
            </div>

            {!isFree && (<div className="space-y-4 pt-4">
                    <label_1.Label className="text-xs text-muted-foreground">Hoặc nhập khoảng giá (VNĐ)</label_1.Label>
                    <div className="flex items-center gap-2">
                        <input_1.Input type="number" placeholder="Từ" className="h-9 text-sm" value={localMin} onChange={(e) => setLocalMin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}/>
                        <span className="text-muted-foreground">-</span>
                        <input_1.Input type="number" placeholder="Đến" className="h-9 text-sm" value={localMax} onChange={(e) => setLocalMax(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}/>
                    </div>
                    <button_1.Button size="sm" variant="secondary" className="w-full h-9 font-semibold" onClick={handleApplyPrice}>
                        Áp dụng giá
                    </button_1.Button>
                </div>)}
        </div>);
}
//# sourceMappingURL=CourseFilters.js.map