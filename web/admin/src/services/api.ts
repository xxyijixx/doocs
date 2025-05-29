import axios from 'axios';
import type { ApiResponse, Conversation, Message, PaginationData, SendMessageRequest } from '../types/chat';

const api = axios.create({
  baseURL: 'http://localhost:8888/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token',
  },
});

export const chatApi = {
  // 获取会话列表
  getConversations: async (page = 1, pageSize = 20, status?: string) => {
    const response = await api.get<ApiResponse<PaginationData<Conversation>>>('/chat/agent/conversations', {
      params: { page, page_size: pageSize, status },
    });
    return response.data;
  },

  // 获取消息列表
  getMessages: async (uuid: string, page = 1, pageSize = 20) => {
    const response = await api.get<ApiResponse<PaginationData<Message>>>(`/chat/${uuid}/messages`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  // 发送消息
  sendMessage: async (message: SendMessageRequest) => {
    const response = await api.post<ApiResponse<null>>('/chat/messages', message);
    return response.data;
  },
}; 