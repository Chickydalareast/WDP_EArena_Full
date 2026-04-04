interface DynamicRuleItemProps {
    sectionIndex: number;
    ruleIndex: number;
    folders: any[];
    topics: any[];
    activeFilters: any;
    disabled: boolean;
    onRemove: () => void;
    canRemove: boolean;
}
export declare function DynamicRuleItem({ sectionIndex, ruleIndex, folders, topics, activeFilters, disabled, onRemove, canRemove }: DynamicRuleItemProps): any;
export {};
