'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportDocxModal = ImportDocxModal;
const react_1 = require("react");
const mammoth = __importStar(require("mammoth"));
const sonner_1 = require("sonner");
const useImportDocxToPaper_1 = require("../hooks/useImportDocxToPaper");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const parseExamText = (rawText) => {
    const resultPayload = [];
    let currentPassageObj = null;
    const chunks = rawText.split(/(?=Câu\s+\d+\s*[:\.]|Question\s+\d+\s*[:\.])/i);
    chunks.forEach(chunk => {
        const trimmedChunk = chunk.trim();
        if (!trimmedChunk)
            return;
        const isQuestion = /^(Câu|Question)\s+\d+\s*[:\.]/i.test(trimmedChunk);
        if (isQuestion) {
            const qMatch = trimmedChunk.match(/^(?:Câu|Question)\s+\d+\s*[:\.]\s*([\s\S]*?)(?=A\.)/i);
            const aMatch = trimmedChunk.match(/A\.\s*([\s\S]*?)(?=B\.)/i);
            const bMatch = trimmedChunk.match(/B\.\s*([\s\S]*?)(?=C\.)/i);
            const cMatch = trimmedChunk.match(/C\.\s*([\s\S]*?)(?=D\.)/i);
            const dMatch = trimmedChunk.match(/D\.\s*([\s\S]*?)$/i);
            if (qMatch && aMatch && bMatch && cMatch && dMatch) {
                let questionContent = qMatch[1].trim();
                if (!questionContent) {
                    const prefixMatch = trimmedChunk.match(/^(?:Câu|Question)\s+\d+\s*[:\.]/i);
                    const prefix = prefixMatch ? prefixMatch[0].trim() : "Câu hỏi";
                    questionContent = `${prefix} (Điền vào chỗ trống / Chọn đáp án đúng)`;
                }
                const questionObj = {
                    content: questionContent,
                    answers: [
                        { id: 'A', content: aMatch[1].trim() },
                        { id: 'B', content: bMatch[1].trim() },
                        { id: 'C', content: cMatch[1].trim() },
                        { id: 'D', content: dMatch[1].trim() }
                    ]
                };
                if (currentPassageObj) {
                    currentPassageObj.subQuestions.push(questionObj);
                }
                else {
                    resultPayload.push(questionObj);
                }
            }
        }
        else {
            const isReadingPassage = trimmedChunk.toLowerCase().includes('read the following') || trimmedChunk.length > 80;
            if (isReadingPassage) {
                currentPassageObj = {
                    content: trimmedChunk,
                    subQuestions: []
                };
                resultPayload.push(currentPassageObj);
            }
            else {
                currentPassageObj = null;
            }
        }
    });
    return resultPayload;
};
function ImportDocxModal({ paperId }) {
    const { mutate: importDocx, isPending } = (0, useImportDocxToPaper_1.useImportDocxToPaper)(paperId);
    const [file, setFile] = (0, react_1.useState)(null);
    const [isParsing, setIsParsing] = (0, react_1.useState)(false);
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    const handleImport = async () => {
        if (!file)
            return;
        setIsParsing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            const parsedQuestions = parseExamText(result.value);
            if (parsedQuestions.length === 0) {
                sonner_1.toast.error('Không tìm thấy câu hỏi hợp lệ.', {
                    description: 'Đề phải đúng chuẩn: Question 1: ... A. ... B. ... C. ... D. ...'
                });
                setIsParsing(false);
                return;
            }
            importDocx({ fileName: file.name, questions: parsedQuestions }, { onSettled: () => setIsParsing(false) });
        }
        catch (error) {
            console.error(error);
            sonner_1.toast.error('Lỗi đọc file Word', { description: 'File có thể bị hỏng hoặc sai định dạng.' });
            setIsParsing(false);
        }
    };
    const isBusy = isPending || isParsing;
    return (<div className="p-8 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl text-center transition-all hover:border-blue-400">
      <lucide_react_1.UploadCloud className="w-16 h-16 text-blue-400 mx-auto mb-4"/>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Import từ file Word (DOCX)</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
        Tự động nhận diện Câu hỏi chùm (Passage). Tự động điền đáp án dạng nháp.
      </p>
      
      <div className="flex flex-col items-center gap-4">
        <label className="cursor-pointer bg-white border border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700 px-6 py-3 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2">
          <lucide_react_1.FileText className="w-5 h-5 text-blue-500"/>
          {file ? file.name : 'Chọn file từ máy tính'}
          <input type="file" accept=".docx" onChange={handleFileChange} disabled={isBusy} className="hidden"/>
        </label>

        {file && (<button_1.Button onClick={handleImport} disabled={isBusy} size="lg" className="w-full max-w-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-md">
            {isBusy && <lucide_react_1.Loader2 className="w-5 h-5 mr-2 animate-spin"/>}
            {isParsing ? 'Đang phân tích cấu trúc...' : isPending ? 'Đang lưu vào Đề...' : 'Bắt đầu Import'}
          </button_1.Button>)}
      </div>
    </div>);
}
//# sourceMappingURL=ImportDocxModal.js.map