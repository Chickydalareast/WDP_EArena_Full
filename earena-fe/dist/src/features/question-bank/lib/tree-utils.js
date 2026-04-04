"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildVirtualTree = void 0;
const buildVirtualTree = (flatNodes, mappings) => {
    const countMap = {};
    mappings.forEach((mapping) => {
        countMap[mapping.targetFolderId] = (countMap[mapping.targetFolderId] || 0) + 1;
    });
    const nodeMap = new Map();
    flatNodes.forEach((node) => {
        nodeMap.set(node._id, {
            ...node,
            children: [],
            questionCount: countMap[node._id] || 0
        });
    });
    const rootNodes = [];
    nodeMap.forEach((node) => {
        if (node.parentId && nodeMap.has(node.parentId)) {
            nodeMap.get(node.parentId).children.push(node);
        }
        else {
            rootNodes.push(node);
        }
    });
    return rootNodes;
};
exports.buildVirtualTree = buildVirtualTree;
//# sourceMappingURL=tree-utils.js.map