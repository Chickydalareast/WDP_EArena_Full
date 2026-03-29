import { VirtualFolderNode, QuestionMapping } from '../types/question-bank.schema';

export interface NestedVirtualNode extends VirtualFolderNode {
    children: NestedVirtualNode[];
    questionCount: number;
}

export const buildVirtualTree = (
    flatNodes: VirtualFolderNode[],
    mappings: QuestionMapping[]
): NestedVirtualNode[] => {
    const countMap: Record<string, number> = {};
    mappings.forEach((mapping) => {
        countMap[mapping.targetFolderId] = (countMap[mapping.targetFolderId] || 0) + 1;
    });

    const nodeMap = new Map<string, NestedVirtualNode>();
    flatNodes.forEach((node) => {
        nodeMap.set(node._id, { 
            ...node, 
            children: [], 
            questionCount: countMap[node._id] || 0 
        });
    });

    const rootNodes: NestedVirtualNode[] = [];
    nodeMap.forEach((node) => {
        if (node.parentId && nodeMap.has(node.parentId)) {
            nodeMap.get(node.parentId)!.children.push(node);
        } else {
            rootNodes.push(node);
        }
    });

    return rootNodes;
};