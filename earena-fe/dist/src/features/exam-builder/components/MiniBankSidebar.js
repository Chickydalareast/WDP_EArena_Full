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
exports.MiniBankSidebar = MiniBankSidebar;
const react_1 = __importStar(require("react"));
const question_bank_store_1 = require("@/features/question-bank/stores/question-bank.store");
const useActiveFilters_1 = require("@/features/exam-builder/hooks/useActiveFilters");
const useBankQueries_1 = require("@/features/question-bank/hooks/useBankQueries");
const useDebounce_1 = require("@/shared/hooks/useDebounce");
const MiniQuestionCard_1 = require("./MiniQuestionCard");
const TreeSelectMulti_1 = require("@/features/exam-builder/components/TreeSelectMulti");
const input_1 = require("@/shared/components/ui/input");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
function MiniBankSidebar({ existingQuestionIds }) {
    const { activePayload, setFilters, resetFilters } = (0, question_bank_store_1.useQuestionBankStore)();
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const debouncedSearch = (0, useDebounce_1.useDebounce)(searchTerm, 500);
    const { data: filtersResponse, isLoading: isLoadingFilters } = (0, useActiveFilters_1.useActiveFilters)(activePayload);
    const foldersTree = (filtersResponse?.folders ?? []);
    const { data: questionsResponse, isFetching: isFetchingQuestions } = (0, useBankQueries_1.useBankQuestions)({
        ...activePayload,
        search: debouncedSearch,
        limit: 50,
    });
    const questions = questionsResponse?.items || questionsResponse?.data || [];
    const hasActiveFilters = activePayload.folderIds && activePayload.folderIds.length > 0;
    return (<div className="h-full flex flex-col bg-slate-50 border-l border-border relative">

            <div className="p-4 bg-card border-b border-border shrink-0 space-y-3 shadow-sm z-10 relative">
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-foreground flex items-center gap-2">
                        <lucide_react_1.Database className="w-4 h-4 text-primary"/> Ngân Hàng Câu Hỏi
                    </h3>
                    
                    {hasActiveFilters && (<button_1.Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={resetFilters} title="Xóa bộ lọc">
                            <lucide_react_1.FilterX className="w-4 h-4"/>
                        </button_1.Button>)}
                </div>

                {isLoadingFilters ? (<skeleton_1.Skeleton className="h-10 w-full rounded-md bg-slate-200"/>) : (<TreeSelectMulti_1.TreeSelectMulti data={foldersTree} selectedIds={activePayload.folderIds || []} onChange={(ids) => setFilters({ folderIds: ids })}/>)}

                <div className="relative">
                    <lucide_react_1.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <input_1.Input placeholder="Tìm theo nội dung..." className="pl-8 bg-slate-50 border-border focus-visible:ring-primary" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 relative">
                
                {isFetchingQuestions && (<div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex justify-center pt-10">
                        <lucide_react_1.Loader2 className="w-6 h-6 animate-spin text-primary drop-shadow-md"/>
                    </div>)}

                {!isFetchingQuestions && questions.length === 0 ? (<div className="text-center p-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl bg-white">
                        Không tìm thấy câu hỏi phù hợp.
                    </div>) : (questions.map((q) => (<MiniQuestionCard_1.MiniQuestionCard key={q._id || q.id} question={q} isAlreadyAdded={existingQuestionIds.includes(q._id || q.id)}/>)))}
            </div>

        </div>);
}
//# sourceMappingURL=MiniBankSidebar.js.map