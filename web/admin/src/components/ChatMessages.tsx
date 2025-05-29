import React, { useEffect, useState, useRef } from 'react';
import { chatApi } from '../services/api';
import type { Message } from '../types/chat';
import { Button } from '@headlessui/react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface ChatMessagesProps {
  conversationUuid: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ conversationUuid }) => {
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
        const response = await chatApi.getMessages(conversationUuid);
        setMessages(response.data.items);
        setError(null);
      } catch (err) {
        setError('获取消息失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationUuid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatApi.sendMessage({
        uuid: conversationUuid,
        content: newMessage,
        sender: 'agent',
        type: 'text',
      });

      // 重新获取消息列表
      const response = await chatApi.getMessages(conversationUuid);
      setMessages(response.data.items);
      setNewMessage('');
    } catch (err) {
      console.error('发送消息失败:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">加载中...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'agent' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === 'agent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-1" />
            发送
          </Button>
        </div>
      </form>
    </div>
  );
}; 