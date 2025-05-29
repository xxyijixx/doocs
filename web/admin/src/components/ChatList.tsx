import React, { useEffect, useState } from 'react';
import { chatApi } from '../services/api';
import type { Conversation } from '../types/chat';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface ChatListProps {
  onSelectConversation: (uuid: string) => void;
  selectedUuid?: string | null;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectConversation, selectedUuid }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatApi.getConversations();
        setConversations(response.data.items);
        setError(null);
      } catch (err) {
        setError('获取会话列表失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const selectedConversation = conversations.find(c => c.uuid === selectedUuid) || null;

  if (loading) {
    return <div className="flex justify-center items-center h-full">加载中...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow h-full p-4">
      <h2 className="text-lg font-semibold mb-4">会话列表</h2>
      <Listbox value={selectedConversation} onChange={c => onSelectConversation(c!.uuid)}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-100 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
            <span className="block truncate">
              {selectedConversation ? (selectedConversation.title || `会话 ${selectedConversation.id}`) : '请选择会话'}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
            {conversations.map((conversation) => (
              <Listbox.Option
                key={conversation.uuid}
                value={conversation}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {conversation.title || `会话 ${conversation.id}`}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      <div className="divide-y overflow-y-auto h-[calc(100%-8rem)] mt-4">
        {conversations.map((conversation) => (
          <div
            key={conversation.uuid}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedUuid === conversation.uuid ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectConversation(conversation.uuid)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {conversation.title || `会话 ${conversation.id}`}
                </p>
                <p className="text-sm text-gray-500">
                  来源: {conversation.source}
                </p>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    conversation.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {conversation.status === 'open' ? '进行中' : '已关闭'}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <p>创建时间: {new Date(conversation.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 