'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';

interface FolderNode {
  _id: string; 
  name: string;
  children?: FolderNode[];
}
const flattenFolders = (folders: FolderNode[], depth = 0): { id: string; name: string; originalName: string }[] => {
  let result: any[] = [];
  
  if (!Array.isArray(folders)) return result; 

  for (const folder of folders) {
    result.push({
      id: folder._id || (folder as any).id, 
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
      const folders = await axiosClient.get<any, FolderNode[]>(API_ENDPOINTS.FOLDERS.MY_FOLDERS);
      return flattenFolders(folders);
    },
    staleTime: 5 * 60 * 1000,
  });
};