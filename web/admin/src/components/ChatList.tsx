import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../api/chat';
import type { Conversation } from '../types/chat';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, ExclamationTriangleIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/20/solid';
import { CogIcon } from '@heroicons/react/24/outline';

interface ChatListProps {
  onSelectConversation: (uuid: string) => void;
  selectedUuid?: string | null;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectConversation, selectedUuid }) => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatApi.getConversations();
        setConversations(response.items);
        setError(null);
      } catch (err) {
        setError(t('chat.fetchConversationsFailed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const selectedConversation = conversations.find(c => c.uuid === selectedUuid) || null;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full space-y-4">
        <CogIcon className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-gray-500 dark:text-gray-400">{t('chat.loadingConversations')}</span>
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full p-4">
      {/* 标题区域 */}
      <div className="flex items-center gap-3 mb-6">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('chat.conversationList')}</h2>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">({conversations.length})</span>
      </div>

      {/* 快速选择下拉框 */}
      <Listbox value={selectedConversation} onChange={c => onSelectConversation(c!.uuid)}>
        <div className="relative mb-4">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-100 dark:bg-gray-700 py-3 pl-4 pr-10 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 transition-colors">
            <span className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />
              <span className="block truncate text-gray-900 dark:text-white">
                {selectedConversation ? (selectedConversation.title || `${t('chat.conversation')} ${selectedConversation.id}`) : t('chat.selectConversation')}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
              {conversations.map((conversation) => (
                <Listbox.Option
                  key={conversation.uuid}
                  value={conversation}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors ${
                      active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`flex items-center gap-2 ${selected ? 'font-medium' : 'font-normal'}`}>
                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />
                        <span className="block truncate">
                          {conversation.title || `${t('chat.conversation')} ${conversation.id}`}
                        </span>
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {/* 会话列表 */}
      <div className="space-y-2 overflow-y-auto h-[calc(100%-12rem)]">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftRightIcon className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p>{t('chat.noConversations')}</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.uuid}
              className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                selectedUuid === conversation.uuid 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-md' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
              }`}
              onClick={() => onSelectConversation(conversation.uuid)}
            >
              {/* 选中指示器 */}
              {selectedUuid === conversation.uuid && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
              )}
              
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <p className={`font-medium truncate ${
                      selectedUuid === conversation.uuid 
                        ? 'text-blue-900 dark:text-blue-100' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {conversation.title || `${t('chat.conversation')} ${conversation.id}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span>{t('chat.source')}: {conversation.source}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{new Date(conversation.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      conversation.status === 'open'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {conversation.status === 'open' ? t('chat.statusOpen') : t('chat.statusClosed')}
                  </span>
                  {conversation.status === 'open' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};