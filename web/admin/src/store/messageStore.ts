import { create } from 'zustand';
import { chatApi } from '../services/api';
import type { Message } from '../types/chat';

interface MessageState {
  // 按会话 ID 存储消息列表
  messagesByConversation: Record<number, Message[]>;
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
  // 获取特定会话的消息
  fetchMessages: (conversationId: number) => Promise<void>;
  // 添加新消息到特定会话
  addMessage: (conversationId: number, message: Message) => void;
  // 刷新消息的触发器
  refreshTrigger: number;
  // 触发刷新
  triggerRefresh: (conversationId: number) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByConversation: {},
  loading: false,
  error: null,
  refreshTrigger: 0,
  
  fetchMessages: async (conversationId: number) => {
    try {
      set({ loading: true, error: null });
      const response = await chatApi.getMessages(conversationId);
      console.log(`获取会话 ${conversationId} 的消息列表成功:`, response.data.items);
      
      // 更新特定会话的消息列表
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: response.data.items
        },
        loading: false
      }));
    } catch (error) {
      console.error(`获取会话 ${conversationId} 的消息列表失败:`, error);
      set({ 
        error: error instanceof Error ? error.message : '获取消息列表失败', 
        loading: false 
      });
    }
  },
  
  addMessage: (conversationId: number, message: Message) => {
    set(state => {
      // 获取当前会话的消息列表，如果不存在则创建空数组
      const currentMessages = state.messagesByConversation[conversationId] || [];
      
      // 检查消息是否已存在（基于 id 或其他唯一标识）
      const messageExists = currentMessages.some(m => m.id === message.id);
      
      // 如果消息已存在，不做任何更改
      if (messageExists) {
        return state;
      }
      
      // 添加新消息并更新状态
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...currentMessages, message]
        }
      };
    });
  },
  
  triggerRefresh: (conversationId: number) => {
    // 增加刷新触发器的值，并重新获取指定会话的消息
    set(state => ({ refreshTrigger: state.refreshTrigger + 1 }));
    get().fetchMessages(conversationId);
  }
}));