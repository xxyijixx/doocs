import { create } from 'zustand';
import { chatApi } from '../services/api';
import type { Conversation } from '../types/chat';

interface ConversationState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  // 获取会话列表
  fetchConversations: () => Promise<void>;
  // 刷新会话列表的触发器
  refreshTrigger: number;
  // 触发刷新
  triggerRefresh: () => void;
  // 添加会话
  addConversation: (conversation: Conversation) => void;
  // 更新会话的最新消息
  updateConversationLastMessage: (conversationId: number, lastMessage: string, lastMessageAt: string) => void;
  // 更新整个会话信息
  updateConversation: (conversationId: number, updates: Partial<Conversation>) => void;
  // 更新会话状态
  updateConversationStatus: (conversationId: number, status: "open" | "closed") => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  loading: false,
  error: null,
  refreshTrigger: 0,
  
  fetchConversations: async () => {
    try {
      set({ loading: true, error: null });
      const response = await chatApi.getConversations();
      console.log('获取会话列表成功:', response.data.items);
      set({ conversations: response.data.items, loading: false });
    } catch (error) {
      console.error('获取会话列表失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '获取会话列表失败', 
        loading: false 
      });
    }
  },
  
  triggerRefresh: () => {
    set(state => ({ refreshTrigger: state.refreshTrigger + 1 }));
  },

  addConversation: (conversation: Conversation) => {
    set(state => ({ conversations: [conversation, ...state.conversations] }));
  },

  updateConversationLastMessage: (conversationId: number, lastMessage: string, lastMessageAt: string) => {
    set(state => ({
      conversations: state.conversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, last_message: lastMessage, last_message_at: lastMessageAt }
          : conv
      )
    }));
  },

  updateConversation: (conversationId: number, updates: Partial<Conversation>) => {
    set(state => ({
      conversations: state.conversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, ...updates }
          : conv
      )
    }));
  },

  updateConversationStatus: (conversationId: number, status: "open" | "closed") => {
    
    set(state => ({
      conversations: state.conversations.map(conv => 
        conv.id === conversationId && conv.status !== status
          ? { ...conv, status }
          : conv
      )
    }));
  }
}));