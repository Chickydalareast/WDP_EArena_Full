'use client';

import { useState } from 'react';
import * as mammoth from 'mammoth';
import { toast } from 'sonner';
import { useImportDocxToPaper } from '../hooks/useImportDocxToPaper';
import { Button } from '@/shared/components/ui/button';
import { UploadCloud, Loader2, FileText } from 'lucide-react';

interface ImportDocxModalProps {
  paperId: string;
}

const parseExamText = (rawText: string) => {
  const resultPayload: any[] = [];
  let currentPassageObj: any = null;

  const chunks = rawText.split(/(?=Câu\s+\d+\s*[:\.]|Question\s+\d+\s*[:\.])/i);

  chunks.forEach(chunk => {
    const trimmedChunk = chunk.trim();
    if (!trimmedChunk) return;

    const isQuestion = /^(Câu|Question)\s+\d+\s*[:\.]/i.test(trimmedChunk);

    if (isQuestion) {
      // 1. NẾU LÀ CÂU HỎI: Bóc tách Nội dung và 4 Đáp án
      const qMatch = trimmedChunk.match(/^(?:Câu|Question)\s+\d+\s*[:\.]\s*([\s\S]*?)(?=A\.)/i);
      const aMatch = trimmedChunk.match(/A\.\s*([\s\S]*?)(?=B\.)/i);
      const bMatch = trimmedChunk.match(/B\.\s*([\s\S]*?)(?=C\.)/i);
      const cMatch = trimmedChunk.match(/C\.\s*([\s\S]*?)(?=D\.)/i);
      const dMatch = trimmedChunk.match(/D\.\s*([\s\S]*?)$/i);

      if (qMatch && aMatch && bMatch && cMatch && dMatch) {
        // --- SMART FALLBACK CHO CÂU ĐIỀN KHUYẾT ---
        let questionContent = qMatch[1].trim();
        
        // Nếu nội dung câu hỏi rỗng (như Question 1 -> 12 trong đề tiếng Anh)
        if (!questionContent) {
          // Lấy lại cái tiền tố "Question 1" hoặc "Câu 1"
          const prefixMatch = trimmedChunk.match(/^(?:Câu|Question)\s+\d+\s*[:\.]/i);
          const prefix = prefixMatch ? prefixMatch[0].trim() : "Câu hỏi";
          questionContent = `${prefix} (Điền vào chỗ trống / Chọn đáp án đúng)`;
        }

        const questionObj = {
          content: questionContent, // Đã được bảo vệ, không bao giờ rỗng
          answers: [
            { id: 'A', content: aMatch[1].trim() }, 
            { id: 'B', content: bMatch[1].trim() },
            { id: 'C', content: cMatch[1].trim() },
            { id: 'D', content: dMatch[1].trim() }
          ]
        };

        // Nếu đang nằm trong một đoạn văn (Passage), nhét nó vào mảng con
        if (currentPassageObj) {
          currentPassageObj.subQuestions.push(questionObj);
        } else {
          resultPayload.push(questionObj);
        }
      }
    } else {
      const isReadingPassage = trimmedChunk.toLowerCase().includes('read the following') || trimmedChunk.length > 80;
      
      if (isReadingPassage) {
        currentPassageObj = {
          content: trimmedChunk,
          subQuestions: [] 
        };
        resultPayload.push(currentPassageObj);
      } else {
        currentPassageObj = null; 
      }
    }
  });

  return resultPayload;
};

export function ImportDocxModal({ paperId }: ImportDocxModalProps) {
  const { mutate: importDocx, isPending } = useImportDocxToPaper(paperId);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      const parsedQuestions = parseExamText(result.value);

      if (parsedQuestions.length === 0) {
        toast.error('Không tìm thấy câu hỏi hợp lệ.', {
          description: 'Đề phải đúng chuẩn: Question 1: ... A. ... B. ... C. ... D. ...'
        });
        setIsParsing(false);
        return;
      }

      importDocx(
        { fileName: file.name, questions: parsedQuestions },
        { onSettled: () => setIsParsing(false) }
      );

    } catch (error) {
      console.error(error);
      toast.error('Lỗi đọc file Word', { description: 'File có thể bị hỏng hoặc sai định dạng.' });
      setIsParsing(false);
    }
  };

  const isBusy = isPending || isParsing;

  return (
    <div className="p-8 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl text-center transition-all hover:border-blue-400">
      <UploadCloud className="w-16 h-16 text-blue-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-slate-800 mb-2">Import từ file Word (DOCX)</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
        Tự động nhận diện Câu hỏi chùm (Passage). Tự động điền đáp án dạng nháp.
      </p>
      
      <div className="flex flex-col items-center gap-4">
        <label className="cursor-pointer bg-white border border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700 px-6 py-3 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          {file ? file.name : 'Chọn file từ máy tính'}
          <input type="file" accept=".docx" onChange={handleFileChange} disabled={isBusy} className="hidden" />
        </label>

        {file && (
          <Button onClick={handleImport} disabled={isBusy} size="lg" className="w-full max-w-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-md">
            {isBusy && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {isParsing ? 'Đang phân tích cấu trúc...' : isPending ? 'Đang lưu vào Đề...' : 'Bắt đầu Import'}
          </Button>
        )}
      </div>
    </div>
  );
}