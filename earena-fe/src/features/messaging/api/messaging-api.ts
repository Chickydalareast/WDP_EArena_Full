import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';

export type ThreadListItem = {
  id: string;
  peer: { id: string; fullName: string; avatar?: string; role: string };
  lastMessageAt: string;
  unread?: boolean;
};

export type ShareableCourseItem = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
};

export type ChatMessageItem = {
  id: string;
  senderId: string;
  body: string | null;
  imageUrls: string[];
  shareCourse: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
  } | null;
  createdAt: string;
};

export async function listThreads(): Promise<ThreadListItem[]> {
  return axiosClient.get(API_ENDPOINTS.MESSAGING.THREADS);
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return axiosClient.get(API_ENDPOINTS.MESSAGING.UNREAD_COUNT);
}

export async function listShareableCourses(): Promise<{ items: ShareableCourseItem[] }> {
  return axiosClient.get(API_ENDPOINTS.MESSAGING.SHAREABLE_COURSES);
}

export async function openThread(peerUserId: string): Promise<{ id: string; peerUserId: string }> {
  return axiosClient.post(API_ENDPOINTS.MESSAGING.OPEN_THREAD, { peerUserId });
}

export async function listMessages(threadId: string, page = 1) {
  return axiosClient.get(API_ENDPOINTS.MESSAGING.MESSAGES(threadId), {
    params: { page, limit: 50 },
  }) as Promise<{ items: ChatMessageItem[]; meta: { total: number } }>;
}

export async function sendMessage(
  threadId: string,
  body: { body?: string; imageUrls?: string[]; shareCourseId?: string },
) {
  return axiosClient.post(API_ENDPOINTS.MESSAGING.SEND(threadId), body);
}
