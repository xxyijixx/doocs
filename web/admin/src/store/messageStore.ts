import { create } from 'zustand';
import { chatApi } from '../services/api';
import type { Message } from '../types/chat';

interface ConversationMessageState {
  messages: Message[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  loading: boolean;
}

interface MessageState {
  // 按会话 ID 存储消息状态
  messagesByConversation: Record<number, ConversationMessageState>;
  // 全局加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
  // 获取特定会话的消息（支持分页）
  fetchMessages: (conversationId: number, page?: number, pageSize?: number) => Promise<void>;
  // 加载更多消息
  loadMoreMessages: (conversationId: number) => Promise<void>;
  // 添加新消息到特定会话
  addMessage: (conversationId: number, message: Message) => void;
  // 刷新消息的触发器
  refreshTrigger: number;
  // 触发刷新
  triggerRefresh: (conversationId: number) => void;
  // 重置会话消息状态
  resetConversationMessages: (conversationId: number) => void;
}

const DEFAULT_PAGE_SIZE = 20;

const createDefaultConversationState = (): ConversationMessageState => ({
  messages: [],
  currentPage: 0,
  totalPages: 0,
  hasMore: true,
  loading: false,
});

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByConversation: {},
  loading: false,
  error: null,
  refreshTrigger: 0,
  
  fetchMessages: async (conversationId: number, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
    try {
      const state = get();
      const conversationState = state.messagesByConversation[conversationId] || createDefaultConversationState();
      
      // 设置加载状态
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: {
            ...conversationState,
            loading: true
          }
        },
        error: null
      }));
      
      const response = await chatApi.getMessages(conversationId, page, pageSize);
      console.log(`获取会话 ${conversationId} 第${page}页消息成功:`, response.data.items.length, '条消息');
      
      // 更新特定会话的消息列表
      set(state => {
        const currentState = state.messagesByConversation[conversationId] || createDefaultConversationState();
        const isFirstPage = page === 1;
        
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: {
              messages: isFirstPage ? response.data.items : [...response.data.items, ...currentState.messages],
              currentPage: response.data.page,
              totalPages: response.data.pages,
              hasMore: response.data.page < response.data.pages,
              loading: false
            }
          },
          loading: false
        };
      });
    } catch (error) {
      console.error(`获取会话 ${conversationId} 的消息列表失败:`, error);
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: {
            ...state.messagesByConversation[conversationId],
            loading: false
          }
        },
        error: error instanceof Error ? error.message : '获取消息列表失败',
        loading: false
      }));
    }
  },
  
  loadMoreMessages: async (conversationId: number) => {
    const state = get();
    const conversationState = state.messagesByConversation[conversationId];
    
    if (!conversationState || !conversationState.hasMore || conversationState.loading) {
      return;
    }
    
    const nextPage = conversationState.currentPage + 1;
    await get().fetchMessages(conversationId, nextPage);
  },
  
  addMessage: (conversationId: number, message: Message) => {
    console.log('addMessage被调用，会话ID:', conversationId, '消息:', message);
    set(state => {
      const conversationState = state.messagesByConversation[conversationId] || createDefaultConversationState();
      const currentMessages = conversationState.messages;
      
      // 检查消息是否已存在（基于 id 或其他唯一标识）
      const messageExists = currentMessages.some(m => m.id === message.id);
      console.log('消息是否已存在:', messageExists);
      
      // 如果消息已存在，不做任何更改
      if (messageExists) {
        console.log('消息已存在，跳过添加');
        return state;
      }
      
      // 添加新消息到末尾
      const newMessages = [...currentMessages, message];
      console.log('添加新消息后，消息数量:', newMessages.length);
      
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: {
            ...conversationState,
            messages: newMessages
          }
        }
      };
    });
  },
  
  resetConversationMessages: (conversationId: number) => {
    set(state => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: createDefaultConversationState()
      }
    }));
  },
  
  triggerRefresh: (conversationId: number) => {
    // 重置会话状态并重新获取第一页消息
    get().resetConversationMessages(conversationId);
    set(state => ({ refreshTrigger: state.refreshTrigger + 1 }));
    get().fetchMessages(conversationId, 1);
  }
}));