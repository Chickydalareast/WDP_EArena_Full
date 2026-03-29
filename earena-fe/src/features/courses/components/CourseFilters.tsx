'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSubjects } from '@/features/auth/hooks/useSubjects';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Filter, DollarSign, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function CourseFilters({ onCloseMobile }: { onCloseMobile?: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { data: subjects, isLoading: isSubjectsLoading } = useSubjects();

    const currentSubjectId = searchParams.get('subjectId');
    const isFree = searchParams.get('isFree') === 'true';
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');

    const [localMin, setLocalMin] = useState(urlMinPrice || '');
    const [localMax, setLocalMax] = useState(urlMaxPrice || '');
    const [prevUrlMin, setPrevUrlMin] = useState(urlMinPrice);
    const [prevUrlMax, setPrevUrlMax] = useState(urlMaxPrice);

    if (urlMinPrice !== prevUrlMin || urlMaxPrice !== prevUrlMax) {
        setPrevUrlMin(urlMinPrice);
        setPrevUrlMax(urlMaxPrice);
        setLocalMin(urlMinPrice || '');
        setLocalMax(urlMaxPrice || '');
    }

    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key);
            } else {
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
            toast.error('Giá trị không hợp lệ', { description: 'Giá thấp nhất không được lớn hơn giá cao nhất.' });
            return;
        }

        updateFilters({
            minPrice: localMin ? localMin : null,
            maxPrice: localMax ? localMax : null,
            isFree: null
        });

        if (onCloseMobile) onCloseMobile();
    };

    const handleClearAll = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('subjectId');
        params.delete('isFree');
        params.delete('minPrice');
        params.delete('maxPrice');
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        if (onCloseMobile) onCloseMobile();
    };

    const hasActiveFilters = currentSubjectId || isFree || urlMinPrice || urlMaxPrice;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" /> Bộ lọc
                </h3>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-muted-foreground hover:text-destructive px-2">
                        <Trash2 className="w-4 h-4 mr-1.5" /> Xóa lọc
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Môn học
                </h4>
                <div className="space-y-3">
                    {isSubjectsLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ) : (
                        subjects?.map((subject) => (
                            <div key={subject._id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`subject-${subject._id}`}
                                    checked={currentSubjectId === subject._id}
                                    onCheckedChange={(checked) => {
                                        updateFilters({ subjectId: checked ? subject._id : null });
                                        if (onCloseMobile) onCloseMobile();
                                    }}
                                />
                                <Label htmlFor={`subject-${subject._id}`} className="cursor-pointer hover:text-primary transition-colors leading-relaxed">
                                    {subject.name}
                                </Label>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Chi phí
                </h4>
                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="filter-free"
                        checked={isFree}
                        onCheckedChange={(checked) => {
                            updateFilters({
                                isFree: checked ? 'true' : null,
                                minPrice: null,
                                maxPrice: null
                            });
                            if (onCloseMobile) onCloseMobile();
                        }}
                    />
                    <Label htmlFor="filter-free" className="cursor-pointer hover:text-primary transition-colors">
                        Khóa học Miễn phí (Đã giảm giá 100%)
                    </Label>
                </div>
            </div>

            {!isFree && (
                <div className="space-y-4 pt-4">
                    <Label className="text-xs text-muted-foreground">Hoặc nhập khoảng giá (VNĐ)</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Từ"
                            className="h-9 text-sm"
                            value={localMin}
                            onChange={(e) => setLocalMin(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="number"
                            placeholder="Đến"
                            className="h-9 text-sm"
                            value={localMax}
                            onChange={(e) => setLocalMax(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}
                        />
                    </div>
                    <Button size="sm" variant="secondary" className="w-full h-9 font-semibold" onClick={handleApplyPrice}>
                        Áp dụng giá
                    </Button>
                </div>
            )}
        </div>
    );
}