'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoteCourseModal = PromoteCourseModal;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const course_service_1 = require("../api/course.service");
const course_keys_1 = require("../api/course-keys");
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const utils_1 = require("@/shared/lib/utils");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
const OPTIONS = [
    { days: 7, label: '7 ngày' },
    { days: 14, label: '14 ngày' },
    { days: 30, label: '30 ngày' },
];
function PromoteCourseModal({ open, onOpenChange, courseId, courseTitle, }) {
    const qc = (0, react_query_1.useQueryClient)();
    const [days, setDays] = (0, react_1.useState)(7);
    const { data: featured } = (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.featuredCarousel(),
        queryFn: () => course_service_1.courseService.getFeaturedCarousel(),
        enabled: open,
        staleTime: 60_000,
    });
    const pricePerDay = featured?.promoPricePerDay ?? 50_000;
    const { data: wallet } = (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.walletBalance(),
        queryFn: async () => {
            return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.WALLETS.ME);
        },
        enabled: open,
    });
    const total = pricePerDay * days;
    const promote = (0, react_query_1.useMutation)({
        mutationFn: () => course_service_1.courseService.promoteCourse(courseId, days),
        onSuccess: () => {
            sonner_1.toast.success('Đã kích hoạt quảng cáo — khóa học sẽ hiện trên slider.');
            qc.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.featuredCarousel() });
            qc.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.teacherCourses() });
            qc.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.walletBalance() });
            onOpenChange(false);
        },
        onError: (e) => {
            const msg = e instanceof Error ? e.message : 'Không thực hiện được';
            sonner_1.toast.error(msg);
        },
    });
    const balance = wallet?.balance ?? 0;
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Quảng cáo khóa học</dialog_1.DialogTitle>
          <dialog_1.DialogDescription className="line-clamp-2">
            {courseTitle}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        <p className="text-sm text-muted-foreground">
          Trừ Coin trong ví. Khóa đã xuất bản sẽ xuất hiện trên slider &quot;Khóa học nổi bật&quot; ở trang danh
          sách khóa học công khai.
        </p>
        <div className="flex flex-wrap gap-2 py-2">
          {OPTIONS.map((o) => (<button_1.Button key={o.days} type="button" variant={days === o.days ? 'default' : 'outline'} size="sm" onClick={() => setDays(o.days)}>
              {o.label}
            </button_1.Button>))}
        </div>
        <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Giá ước tính / ngày</span>
            <span className="font-medium">{(0, utils_1.formatCurrency)(pricePerDay)}</span>
          </div>
          <div className="flex justify-between font-bold text-primary">
            <span>Tổng thanh toán</span>
            <span>{(0, utils_1.formatCurrency)(total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Số dư ví</span>
            <span>{(0, utils_1.formatCurrency)(balance)}</span>
          </div>
        </div>
        <button_1.Button className="w-full" disabled={promote.isPending || balance < total} onClick={() => promote.mutate()}>
          {promote.isPending ? (<lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>) : ('Xác nhận & thanh toán')}
        </button_1.Button>
        {balance < total && (<p className="text-xs text-destructive text-center">Số dư ví không đủ.</p>)}
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
//# sourceMappingURL=PromoteCourseModal.js.map