import React, { useEffect, useState, useRef } from 'react';
import { chatApi } from '../services/api';
import type { Message, Conversation } from '../types/chat';
import { PaperAirplaneIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useMessageStore } from '../store/messageStore';

interface ChatWindowProps {
  conversationUuid?: string | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationUuid }) => {
  const { messagesByConversation, loading, fetchMessages, refreshTrigger } = useMessageStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取当前会话的消息
  const messages = conversationUuid ? messagesByConversation[conversationUuid] || [] : [];

  useEffect(() => {
    if (!conversationUuid) return;
    
    // 获取会话的消息
    fetchMessages(conversationUuid);
    
    // 获取会话信息（可选，假如API有）
    const fetchConversationInfo = async () => {
      try {
        // 这里只是模拟，实际应该调用 API 获取会话信息
        setConversation({
          id: 1,
          uuid: conversationUuid,
          agent_id: 0,
          customer_id: 0,
          title: 'Personal Assistant',
          status: 'open',
          source: 'widget',
          last_message_at: null,
          created_at: '',
          updated_at: '',
          deleted_at: null,
        });
      } catch (error) {
        console.error('获取会话信息失败:', error);
      }
    };
    
    fetchConversationInfo();
  }, [conversationUuid, fetchMessages]);

  // 当消息列表更新时，滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 当刷新触发器更新时，重新获取消息
  useEffect(() => {
    if (conversationUuid) {
      fetchMessages(conversationUuid);
    }
  }, [refreshTrigger, conversationUuid, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationUuid) return;
    
    try {
      // 发送消息到服务器
      await chatApi.sendMessage({
        uuid: conversationUuid,
        content: newMessage,
        sender: 'agent',
        type: 'text',
      });
      
      // 清空输入框
      setNewMessage('');
      
      // 重新获取消息列表
      // fetchMessages(conversationUuid);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  if (!conversationUuid) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
        请选择一个会话开始聊天
      </div>
    );
  }

  return (
    <section className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-8 py-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold dark:text-white">
            {conversation?.title || `会话 ${conversation?.id || ''}`}
          </h2>
          <span className={`px-2 py-1 rounded-full text-xs ${
            conversation?.status === 'open'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
          }`}>
            {conversation?.status === 'open' ? '进行中' : '已关闭'}
          </span>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
          <EllipsisVerticalIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-10">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-10">暂无消息</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.sender === 'agent'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSendMessage} className="px-8 py-4 border-t dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white dark:placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </section>
  );
};