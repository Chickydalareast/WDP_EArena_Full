import { axiosClient } from '@/shared/lib/axios-client';

export interface SubjectDTO {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

export const taxonomyService = {
  getSubjects: async (): Promise<SubjectDTO[]> => {
    return axiosClient.get('/taxonomy/subjects'); 
  }
};