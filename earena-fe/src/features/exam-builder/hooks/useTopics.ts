'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';

export interface TopicNode {
    _id: string;
    name: string;
    children?: TopicNode[];
}

export interface FlatTopic {
    id: string;
    name: string;
    path: string; // Đường dẫn Breadcrumb: Cha / Con / Cháu
}

// Thuật toán Đệ quy tính toán Đường dẫn tuyệt đối
const flattenTopicsWithPath = (topics: TopicNode[], parentPath = ''): FlatTopic[] => {
    let result: FlatTopic[] = [];
    if (!Array.isArray(topics)) return result;

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

export const useTopicsTree = (subjectId?: string) => {
    return useQuery({
        queryKey: ['taxonomy', 'topics-tree', subjectId],
        queryFn: async () => {
            if (!subjectId) return [];
            const data = await axiosClient.get<unknown, TopicNode[]>(API_ENDPOINTS.TAXONOMY.TOPICS_TREE(subjectId));
            return flattenTopicsWithPath(data);
        },
        enabled: !!subjectId, // Chỉ fetch khi đã có subjectId
        staleTime: 5 * 60 * 1000, // Cache 5 phút
    });
};