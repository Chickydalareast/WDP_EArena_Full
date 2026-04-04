'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTopicsTree = void 0;
const react_query_1 = require("@tanstack/react-query");
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const flattenTopicsWithPath = (topics, parentPath = '') => {
    let result = [];
    if (!Array.isArray(topics))
        return result;
    for (const topic of topics) {
        const currentPath = parentPath ? `${parentPath} / ${topic.name}` : topic.name;
        result.push({
            id: topic._id,
            name: topic.name,
            path: currentPath,
        });
        if (topic.children && topic.children.length > 0) {
            result = result.concat(flattenTopicsWithPath(topic.children, currentPath));
        }
    }
    return result;
};
const useTopicsTree = (subjectId) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['taxonomy', 'topics-tree', subjectId],
        queryFn: async () => {
            if (!subjectId)
                return [];
            const data = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.TAXONOMY.TOPICS_TREE(subjectId));
            return flattenTopicsWithPath(data);
        },
        enabled: !!subjectId,
        staleTime: 5 * 60 * 1000,
    });
};
exports.useTopicsTree = useTopicsTree;
//# sourceMappingURL=useTopics.js.map