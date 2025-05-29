import React, { useEffect, useState, useRef } from 'react';
import { chatApi } from '../services/api';
import type { Message, Conversation } from '../types/chat';
import { PaperAirplaneIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface ChatWindowProps {
  conversationUuid?: string | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationUuid }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationUuid) return;
    const fetchData = async () => {
      const msgRes = await chatApi.getMessages(conversationUuid);
      setMessages(msgRes.data.items);
      // 获取会话信息（可选，假如API有）
      // 这里只是模拟
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
    };
    fetchData();
  }, [conversationUuid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationUuid) return;
    await chatApi.sendMessage({
      uuid: conversationUuid,
      content: newMessage,
      sender: 'agent',
      type: 'text',
    });
    const msgRes = await chatApi.getMessages(conversationUuid);
    setMessages(msgRes.data.items);
    setNewMessage('');
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
        {messages.map((message, index) => (
          <div
            key={index}
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
        ))}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSendMessage} className="px-8 py-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type something"
            className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm dark:text-white dark:placeholder-gray-400"
          />
          <button
            type="submit"
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition text-white shadow"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </section>
  );
}; 