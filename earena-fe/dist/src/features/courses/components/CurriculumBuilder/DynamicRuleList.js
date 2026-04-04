'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicRuleList = DynamicRuleList;
const react_1 = __importDefault(require("react"));
const react_hook_form_1 = require("react-hook-form");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const DynamicRuleItem_1 = require("./DynamicRuleItem");
function DynamicRuleList({ sectionIndex, folders, topics, activeFilters, disabled }) {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: `dynamicConfig.adHocSections.${sectionIndex}.rules`,
    });
    return (<div className="space-y-3">
            {fields.map((field, ruleIndex) => (<DynamicRuleItem_1.DynamicRuleItem key={field.id} sectionIndex={sectionIndex} ruleIndex={ruleIndex} folders={folders} topics={topics} activeFilters={activeFilters} disabled={disabled} onRemove={() => remove(ruleIndex)} canRemove={fields.length > 1}/>))}
            
            <button_1.Button type="button" variant="secondary" size="sm" onClick={() => append({ limit: 5, folderIds: [], topicIds: [], difficulties: [], tags: [] })} disabled={disabled} className="mt-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100">
                <lucide_react_1.Plus className="w-4 h-4 mr-2"/> Thêm tiêu chí bốc
            </button_1.Button>
        </div>);
}
//# sourceMappingURL=DynamicRuleList.js.map