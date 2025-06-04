import React, { useState, useEffect } from 'react';
// import type { Conversation } from '../types/chat';
import { MagnifyingGlassIcon, HomeIcon, Cog6ToothIcon, UserGroupIcon, PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import { Button, Field, Input } from '@headlessui/react';
// import { ThemeToggle } from './ThemeToggle';
import { useConversationStore } from '../store/conversationStore';

interface ChatSidebarProps {
  selectedId: number;
  onSelectConversation: (id: number) => void;
  onRefresh?: () => void; // 设为可选，因为现在主要依赖 Zustand store
  isMobile?: boolean; // 添加移动端标识
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ selectedId, onSelectConversation, onRefresh, isMobile = false }) => {
  const { conversations, loading, fetchConversations, refreshTrigger } = useConversationStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, onRefresh]);

  // 搜索过滤
  const filtered = conversations.filter(c =>
    (c.title || `会话 ${c.id}`).toLowerCase().includes(search.toLowerCase())
  );

  // 头像颜色池
  const avatarColors = [
    'bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500'
  ];

  return (
    <aside className={`flex flex-col h-full ${isMobile ? 'w-full' : 'w-80'} bg-white dark:bg-gray-800 rounded-l-2xl shadow-lg px-6 py-8`}>
      {/* 顶部标题 */}
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold flex-1 dark:text-white">Dialogs</h2>
        <span className="text-gray-400 dark:text-gray-500 font-semibold">{conversations.length}</span>
      </div>
      {/* 搜索框 */}
      <Field className="relative mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索会话..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-white dark:placeholder-gray-400 transition-all"
          />
        </div>
      </Field>
      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
            <CogIcon className="w-8 h-8 mb-3 animate-spin text-blue-500" />
            <span>加载会话...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
            <UserGroupIcon className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <span>{search ? '未找到匹配的会话' : '暂无会话'}</span>
          </div>
        ) : (
          filtered.map((c, idx) => (
            <Button
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={`
                group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-100 dark:focus:bg-blue-900/30 text-left relative   
                ${selectedId === c.id ? 'bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'bg-white dark:bg-gray-800 hover:shadow-md'}
              `}
            >
              {/* 选中竖条 */}
              {selectedId === c.id && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded bg-blue-500" />
              )}
              {/* 彩色圆头像 */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm ${avatarColors[idx % avatarColors.length]}`}>
                {c.title ? c.title[0].toUpperCase() : c.id}
              </div>
              {/* 标题和副标题 */}
              <div className="flex-1 min-w-0">
                <div className={`truncate font-medium ${selectedId === c.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                  {c.title || `会话 ${c.id}`}
                </div>
                <div className="truncate text-xs text-gray-400 dark:text-gray-500">来源: {c.source}</div>
              </div>
              {/* 状态指示器 */}
              <div className="flex items-center gap-2">
                {c.status === 'open' && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
            </Button>
          ))
        )}
      </div>
      {/* 底部导航栏 */}
      <div className="flex justify-between items-center mt-8 px-2">
        <div className="flex gap-3">
          <Button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
            <HomeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </Button>
          <Button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
            <UserGroupIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </Button>
          <Button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
            <Cog6ToothIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </Button>
        </div>
        <Button className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
          <PlusIcon className="w-5 h-5" />
        </Button>
      </div>
    </aside>
  );
};