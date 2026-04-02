'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';

export interface FolderNode {
  _id?: string; 
  id?: string; 
  name: string;
  children?: FolderNode[];
}

export interface FolderResponse {
  items?: FolderNode[];
  data?: FolderNode[];
}

const flattenFolders = (folders: FolderNode[], depth = 0): { id: string; name: string; originalName: string }[] => {
  let result: { id: string; name: string; originalName: string }[] = [];

  if (!Array.isArray(folders)) return result;

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

export const useFoldersList = () => {
  return useQuery({
    queryKey: ['question-folders', 'my-folders'],
    queryFn: async () => {
      const response = await axiosClient.get<unknown, FolderNode[]>(API_ENDPOINTS.QUESTION_FOLDERS.BASE);

      let folders: FolderNode[] = [];
      if (Array.isArray(response)) {
        folders = response;
      } else if (response && typeof response === 'object') {
        const resObj = response as FolderResponse;
        if (Array.isArray(resObj.items)) folders = resObj.items;
        else if (Array.isArray(resObj.data)) folders = resObj.data;
      }

      return flattenFolders(folders);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useRawFoldersTree = () => {
  return useQuery({
    queryKey: ['question-folders', 'my-folders', 'raw'],
    queryFn: async () => {
      const response = await axiosClient.get<unknown, FolderNode[]>(API_ENDPOINTS.QUESTION_FOLDERS.BASE);

      let folders: FolderNode[] = [];
      if (Array.isArray(response)) {
        folders = response;
      } else if (response && typeof response === 'object') {
        const resObj = response as FolderResponse;
        if (Array.isArray(resObj.items)) folders = resObj.items;
        else if (Array.isArray(resObj.data)) folders = resObj.data;
      }

      return folders;
    },
    staleTime: 5 * 60 * 1000,
  });
};