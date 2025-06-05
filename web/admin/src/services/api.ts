import axios from 'axios';
import type { ApiResponse, Conversation, Message, PaginationData, SendMessageRequest } from '../types/chat';
import { isMicroApp, getUserToken } from '@dootask/tools'

const api = axios.create({
  baseURL: 'http://localhost:8888/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    config.headers['Authorization'] = 'Bearer 123456';
    if (isMicroApp()) {
      config.headers['Token'] = getUserToken();
    } 
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const chatApi = {
  // 获取会话列表
  getConversations: async (page = 1, pageSize = 20, status?: string) => {
    const response = await api.get<ApiResponse<PaginationData<Conversation>>>('/chat/agent/conversations', {
      params: { page, page_size: pageSize, status },
    });
    return response.data;
  },

  // 获取消息列表
  getMessages: async (id: number, page = 1, pageSize = 20) => {
    const response = await api.get<ApiResponse<PaginationData<Message>>>(`/chat/agent/${id}/messages`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  // 发送消息
  sendMessage: async (message: SendMessageRequest) => {
    const response = await api.post<ApiResponse<null>>('/chat/agent/messages', message);
    return response.data;
  },

  // 根据UUID获取会话信息
  getConversationByUUID: async (uuid: string) => {
    const response = await api.get<ApiResponse<Conversation>>(`/chat/conversations/${uuid}`);
    return response.data;
  },
};