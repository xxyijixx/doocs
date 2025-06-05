import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../api/chat';
import type { Message } from '../types/chat';
import { Button, Field, Input, Transition } from '@headlessui/react';
import { PaperAirplaneIcon, ExclamationTriangleIcon, ChatBubbleLeftEllipsisIcon, UserIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import { CogIcon } from '@heroicons/react/24/outline';

interface ChatMessagesProps {
  conversationId: number;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await chatApi.getMessages(conversationId);
        setMessages(response.items);
        setError(null);
      } catch (err) {
        setError('获取消息失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatApi.sendMessage({
        id: conversationId,
        content: newMessage,
        sender: 'agent',
        type: 'text',
      });

      // 重新获取消息列表
      const response = await chatApi.getMessages(conversationId);
      setMessages(response.items);
      setNewMessage('');
    } catch (err) {
      console.error('发送消息失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full space-y-4">
        <CogIcon className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-gray-500 dark:text-gray-400">加载消息...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full space-y-4">
        <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
        <span className="text-red-500 text-center">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* 消息头部 */}
      <div className="flex items-center gap-3 p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">消息记录</h3>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">({messages.length} 条消息)</span>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftEllipsisIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">暂无消息</p>
            <p className="text-sm">开始对话吧！</p>
          </div>
        ) : (
          messages.map((message) => (
            <Transition
              key={message.id}
              appear={true}
              show={true}
              enter="transition-all duration-300 ease-out"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
            >
              <div
                className={`flex items-start gap-3 ${
                  message.sender === 'agent' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* 头像 */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'agent'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {message.sender === 'agent' ? (
                    <CpuChipIcon className="w-4 h-4" />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                </div>

                {/* 消息气泡 */}
                <div className={`max-w-[75%] ${
                  message.sender === 'agent' ? 'text-right' : 'text-left'
                }`}>
                  <div
                    className={`inline-block rounded-2xl px-4 py-3 shadow-sm ${
                      message.sender === 'agent'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <div className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${
                    message.sender === 'agent' ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(message.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </Transition>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <Field className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入消息..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"              
            />
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </Button>
        </Field>
      </form>
    </div>
  );
};