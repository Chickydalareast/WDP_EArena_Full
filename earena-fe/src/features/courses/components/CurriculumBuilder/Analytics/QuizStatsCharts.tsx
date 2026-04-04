'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BarChart3, Inbox } from 'lucide-react';
import { QuizStatsData } from '../../../types/course.schema';

interface QuizStatsChartsProps {
    data: QuizStatsData | null; // Cho phép null
}

const COLORS = ['#22c55e', '#ef4444']; // Xanh lá (Đạt), Đỏ (Trượt)

export function QuizStatsCharts({ data }: QuizStatsChartsProps) {
    
    // [CTO FIX]: Nội suy số liệu Đạt/Trượt từ passRate và total
    const pieData = useMemo(() => {
        if (!data) return [];
        const total = data.totalCompletedSubmissions || 0;
        
        // Giả định passRate BE trả về là phần trăm (VD: 80 cho 80%). Nếu BE trả 0.8 thì sửa lại thành data.passRate
        const passRatePercent = data.passRate > 1 ? data.passRate / 100 : data.passRate; 
        
        const passed = Math.round(total * passRatePercent);
        const failed = total - passed;

        return [
            { name: 'Đạt', value: passed },
            { name: 'Trượt', value: failed },
        ];
    }, [data]);

    // [CTO FIX]: Đọc mảng scoreDistribution thay vì Object
    const barData = useMemo(() => {
        if (!data?.scoreDistribution || !Array.isArray(data.scoreDistribution)) return [];
        
        return data.scoreDistribution.map((item: any, index: number) => ({
            range: item.range || item.name || `Khúc ${index + 1}`, // An toàn với mọi cấu trúc item
            count: item.count || item.value || 0
        }));
    }, [data]);

    // Empty State an toàn tuyệt đối
    if (!data || data.totalCompletedSubmissions === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                <Inbox className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">Chưa có lượt thi nào để hiển thị thống kê.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-muted-foreground flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" /> Tỉ lệ Đạt / Trượt
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => [`${value} lượt`, 'Số lượng']} 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center pointer-events-none">
                        <span className="text-2xl font-bold text-foreground">{data.totalCompletedSubmissions}</span>
                        <span className="text-[10px] uppercase text-muted-foreground font-bold">Lượt thi</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-muted-foreground">Phổ điểm học viên</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="range" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`${value} học sinh`, 'Số lượng']}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground italic">
                            Chưa đủ dữ liệu vẽ phổ điểm
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}