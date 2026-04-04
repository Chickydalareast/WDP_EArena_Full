'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatrixAdHocBuilder = void 0;
const react_1 = __importDefault(require("react"));
const react_hook_form_1 = require("react-hook-form");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const form_1 = require("@/shared/components/ui/form");
const input_1 = require("@/shared/components/ui/input");
const AdHocRuleItem_1 = __importDefault(require("./AdHocRuleItem"));
const AdHocRuleList = ({ paperId, sectionIndex, folders, topics, disabled }) => {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: `adHocSections.${sectionIndex}.rules`,
    });
    return (<div className="space-y-4">
            {fields.map((field, ruleIndex) => (<AdHocRuleItem_1.default key={field.id} paperId={paperId} sectionIndex={sectionIndex} ruleIndex={ruleIndex} folders={folders} topics={topics} disabled={disabled} onRemove={() => remove(ruleIndex)} canRemove={fields.length > 1}/>))}
            <button_1.Button type="button" variant="outline" size="sm" onClick={() => append({ limit: 1, folderIds: [], topicIds: [], difficulties: [], tags: [] })} disabled={disabled} className="bg-white hover:bg-slate-50 text-blue-600 border-blue-200 hover:text-blue-700 font-medium">
                <lucide_react_1.Plus className="w-4 h-4 mr-2"/> Thêm Luật Bốc
            </button_1.Button>
        </div>);
};
const MatrixAdHocBuilder = ({ paperId, folders, topics, disabled }) => {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: 'adHocSections',
    });
    return (<div className="space-y-6">
            {fields.map((field, sectionIndex) => (<div key={field.id} className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                        <form_1.FormField control={control} name={`adHocSections.${sectionIndex}.name`} render={({ field: nameField }) => (<form_1.FormItem className="flex-1 max-w-sm">
                                    <form_1.FormControl>
                                        <input_1.Input placeholder="Tên phần thi (VD: Trắc nghiệm)" className="font-bold border-none bg-slate-50 text-lg focus-visible:ring-1" disabled={disabled} {...nameField}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                </form_1.FormItem>)}/>
                        <button_1.Button type="button" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors" disabled={disabled || fields.length === 1} onClick={() => remove(sectionIndex)}>
                            <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/> Xóa Phần Thi
                        </button_1.Button>
                    </div>

                    
                    <AdHocRuleList paperId={paperId} sectionIndex={sectionIndex} folders={folders} topics={topics} disabled={disabled}/>
                </div>))}

            <button_1.Button type="button" variant="outline" className="w-full py-8 border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-400 font-bold transition-all" disabled={disabled} onClick={() => append({
            name: `Phần ${fields.length + 1}`,
            orderIndex: fields.length,
            rules: [{ limit: 1, folderIds: [], topicIds: [], difficulties: [], tags: [] }]
        })}>
                <lucide_react_1.Plus className="w-5 h-5 mr-2 text-slate-400"/> THÊM PHẦN THI MỚI
            </button_1.Button>
        </div>);
};
exports.MatrixAdHocBuilder = MatrixAdHocBuilder;
//# sourceMappingURL=MatrixAdHocBuilder.js.map