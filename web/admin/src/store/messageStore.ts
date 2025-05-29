import { create } from 'zustand';
import { chatApi } from '../services/api';
import type { Message } from '../types/chat';

interface MessageState {
  // 按会话 UUID 存储消息列表
  messagesByConversation: Record<string, Message[]>;
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
  // 获取特定会话的消息
  fetchMessages: (conversationUuid: string) => Promise<void>;
  // 添加新消息到特定会话
  addMessage: (conversationUuid: string, message: Message) => void;
  // 刷新消息的触发器
  refreshTrigger: number;
  // 触发刷新
  triggerRefresh: (conversationUuid: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByConversation: {},
  loading: false,
  error: null,
  refreshTrigger: 0,
  
  fetchMessages: async (conversationUuid: string) => {
    try {
      set({ loading: true, error: null });
      const response = await chatApi.getMessages(conversationUuid);
      console.log(`获取会话 ${conversationUuid} 的消息列表成功:`, response.data.items);
      
      // 更新特定会话的消息列表
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationUuid]: response.data.items
        },
        loading: false
      }));
    } catch (error) {
      console.error(`获取会话 ${conversationUuid} 的消息列表失败:`, error);
      set({ 
        error: error instanceof Error ? error.message : '获取消息列表失败', 
        loading: false 
      });
    }
  },
  
  addMessage: (conversationUuid: string, message: Message) => {
    set(state => {
      // 获取当前会话的消息列表，如果不存在则创建空数组
      const currentMessages = state.messagesByConversation[conversationUuid] || [];
      
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
          [conversationUuid]: [...currentMessages, message]
        }
      };
    });
  },
  
  triggerRefresh: (conversationUuid: string) => {
    // 增加刷新触发器的值，并重新获取指定会话的消息
    set(state => ({ refreshTrigger: state.refreshTrigger + 1 }));
    get().fetchMessages(conversationUuid);
  }
}));