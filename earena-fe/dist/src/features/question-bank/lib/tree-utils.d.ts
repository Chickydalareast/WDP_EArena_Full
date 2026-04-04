import { VirtualFolderNode, QuestionMapping } from '../types/question-bank.schema';
export interface NestedVirtualNode extends VirtualFolderNode {
    children: NestedVirtualNode[];
    questionCount: number;
}
export declare const buildVirtualTree: (flatNodes: VirtualFolderNode[], mappings: QuestionMapping[]) => NestedVirtualNode[];
