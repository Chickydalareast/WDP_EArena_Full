import Link from 'next/link';
import { ChevronLeft, PenTool, Bot } from 'lucide-react';
import { InitExamForm } from '@/features/exam-builder/components/InitExamForm';
import { GenerateExamForm } from '@/features/exam-builder/components/GenerateExamForm';

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/shared/components/ui/tabs';

export default function CreateExamPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Tạo Đề Thi Mới
          </h1>
        </div>
        <Link 
          href="/teacher/exams" 
          className="flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-4 py-2 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Hủy & Quay lại
        </Link>
      </div>

      {/* TABS PHÂN LUỒNG UX */}
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8 h-12">
          <TabsTrigger value="manual" className="text-base font-semibold">
            <PenTool className="w-4 h-4 mr-2" /> Tạo Thủ Công
          </TabsTrigger>
          <TabsTrigger value="auto" className="text-base font-semibold">
            <Bot className="w-4 h-4 mr-2" /> Gen Ma Trận (Auto)
          </TabsTrigger>
        </TabsList>

        {/* LUỒNG 1: THỦ CÔNG */}
        <TabsContent value="manual" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="mb-6 text-slate-500 text-sm text-center">
            Tạo khung vỏ đề trước, sau đó bạn sẽ tự do kéo thả, import hoặc thêm câu hỏi vào không gian soạn thảo.
          </div>
          <InitExamForm />
        </TabsContent>

        {/* LUỒNG 2: TỰ ĐỘNG BẰNG MA TRẬN */}
        <TabsContent value="auto" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
           <div className="mb-6 text-slate-500 text-sm text-center">
            Hệ thống sẽ tự động trộn và bốc câu hỏi từ Ngân hàng dựa trên Ma trận bạn cung cấp.
          </div>
          <GenerateExamForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}