'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicQuizBuilder = DynamicQuizBuilder;
const react_1 = __importDefault(require("react"));
const react_hook_form_1 = require("react-hook-form");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const DynamicSectionItem_1 = require("./DynamicSectionItem");
function DynamicQuizBuilder({ folders, topics, activeFilters, disabled }) {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: "dynamicConfig.adHocSections"
    });
    return (<div className="space-y-6">
            {fields.map((field, sectionIndex) => (<DynamicSectionItem_1.DynamicSectionItem key={field.id} sectionIndex={sectionIndex} folders={folders} topics={topics} activeFilters={activeFilters} disabled={disabled} onRemove={() => remove(sectionIndex)} canRemove={fields.length > 1}/>))}

            <button_1.Button type="button" variant="outline" className="w-full py-8 border-2 border-dashed border-purple-300 bg-purple-50/50 text-purple-600 hover:bg-purple-100 hover:border-purple-400 font-bold transition-all" disabled={disabled} onClick={() => append({
            name: `Phần ${fields.length + 1}`,
            orderIndex: fields.length,
            rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [] }]
        })}>
                <lucide_react_1.Plus className="w-5 h-5 mr-2 text-purple-400"/> THÊM PHẦN THI / LUẬT BỐC
            </button_1.Button>
        </div>);
}
//# sourceMappingURL=DynamicQuizBuilder.js.map