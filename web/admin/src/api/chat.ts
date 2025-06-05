import type { Conversation, Message, PaginationData, SendMessageRequest } from '../types/chat';
import { apiRequest } from './request';

export const chatApi = {
  // 获取会话列表
  getConversations: async (page = 1, pageSize = 20, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (status) {
      params.append('status', status);
    }
    return apiRequest<PaginationData<Conversation>>(`/chat/agent/conversations?${params.toString()}`);
  },

  // 获取消息列表
  getMessages: async (id: number, page = 1, pageSize = 20) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    return apiRequest<PaginationData<Message>>(`/chat/agent/${id}/messages?${params.toString()}`);
  },

  // 发送消息
  sendMessage: async (message: SendMessageRequest) => {
    return apiRequest<null>('/chat/agent/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },

  // 根据UUID获取会话信息
  getConversationByUUID: async (uuid: string) => {
    return apiRequest<Conversation>(`/chat/conversations/${uuid}`, {});
  },
};