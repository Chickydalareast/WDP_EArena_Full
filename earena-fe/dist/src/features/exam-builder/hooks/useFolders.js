'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRawFoldersTree = exports.useFoldersList = void 0;
const react_query_1 = require("@tanstack/react-query");
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const flattenFolders = (folders, depth = 0) => {
    let result = [];
    if (!Array.isArray(folders))
        return result;
    for (const folder of folders) {
        const safeId = String(folder._id || folder.id);
        result.push({
            id: safeId,
            name: `${'— '.repeat(depth)}${folder.name}`,
            originalName: folder.name
        });
        if (folder.children && folder.children.length > 0) {
            result = result.concat(flattenFolders(folder.children, depth + 1));
        }
    }
    return result;
};
const useFoldersList = () => {
    return (0, react_query_1.useQuery)({
        queryKey: ['question-folders', 'my-folders'],
        queryFn: async () => {
            const response = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.QUESTION_FOLDERS.BASE);
            let folders = [];
            if (Array.isArray(response)) {
                folders = response;
            }
            else if (response && typeof response === 'object') {
                const resObj = response;
                if (Array.isArray(resObj.items))
                    folders = resObj.items;
                else if (Array.isArray(resObj.data))
                    folders = resObj.data;
            }
            return flattenFolders(folders);
        },
        staleTime: 5 * 60 * 1000,
    });
};
exports.useFoldersList = useFoldersList;
const useRawFoldersTree = () => {
    return (0, react_query_1.useQuery)({
        queryKey: ['question-folders', 'my-folders', 'raw'],
        queryFn: async () => {
            const response = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.QUESTION_FOLDERS.BASE);
            let folders = [];
            if (Array.isArray(response)) {
                folders = response;
            }
            else if (response && typeof response === 'object') {
                const resObj = response;
                if (Array.isArray(resObj.items))
                    folders = resObj.items;
                else if (Array.isArray(resObj.data))
                    folders = resObj.data;
            }
            return folders;
        },
        staleTime: 5 * 60 * 1000,
    });
};
exports.useRawFoldersTree = useRawFoldersTree;
//# sourceMappingURL=useFolders.js.map