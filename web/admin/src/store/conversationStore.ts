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
  }
}));