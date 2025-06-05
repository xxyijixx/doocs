import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
// import type { Conversation } from '../types/chat';
import { MagnifyingGlassIcon, HomeIcon, Cog6ToothIcon, UserGroupIcon, PlusIcon, CogIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Field, Input, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
// import { ThemeToggle } from './ThemeToggle';
import { useConversationStore } from '../store/conversationStore';

interface ChatSidebarProps {
  selectedId: number;
  onSelectConversation: (id: number) => void;
  onRefresh?: () => void; // 设为可选，因为现在主要依赖 Zustand store
  isMobile?: boolean; // 添加移动端标识
  onNewMessage?: (conversationId: number, message: string) => void; // 新消息回调
  onSendMessage?: (conversationId: number, message: string) => void; // 发送消息回调
}

// 暴露给父组件的方法接口
export interface ChatSidebarRef {
  handleNewMessageReceived: (conversationId: number, message: string) => void;
  handleMessageSent: (conversationId: number, message: string) => void;
}

export const ChatSidebar = forwardRef<ChatSidebarRef, ChatSidebarProps>(({ selectedId, onSelectConversation, onRefresh, isMobile = false, onNewMessage, onSendMessage }, ref) => {
  const { conversations, loading, fetchConversations, refreshTrigger, updateConversationLastMessage } = useConversationStore();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'open' | 'closed',
    hasMessages: 'all' as 'all' | 'yes' | 'no',
    source: 'all' as string
  });

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, onRefresh]);

  // 处理接收到新消息的推送
  const handleNewMessageReceived = React.useCallback((conversationId: number, message: string) => {
    const now = new Date().toISOString();
    updateConversationLastMessage(conversationId, message, now);
    onNewMessage?.(conversationId, message);
  }, [updateConversationLastMessage, onNewMessage]);

  // 处理发送消息
  const handleMessageSent = React.useCallback((conversationId: number, message: string) => {
    const now = new Date().toISOString();
    updateConversationLastMessage(conversationId, message, now);
    onSendMessage?.(conversationId, message);
  }, [updateConversationLastMessage, onSendMessage]);

  // 暴露方法给父组件使用
  useImperativeHandle(ref, () => ({
    handleNewMessageReceived,
    handleMessageSent
  }), [handleNewMessageReceived, handleMessageSent]);

  // 获取所有来源选项
  const sourceOptions = ['all', ...Array.from(new Set(conversations.map(c => c.source)))];

  // 搜索和过滤
  const filtered = conversations.filter(c => {
    // 搜索过滤
    const matchesSearch = (c.title || `会话 ${c.id}`).toLowerCase().includes(search.toLowerCase());
    
    // 状态过滤
    const matchesStatus = filters.status === 'all' || c.status === filters.status;
    
    // 有消息过滤
    const matchesMessages = filters.hasMessages === 'all' || 
      (filters.hasMessages === 'yes' && c.last_message_at !== null) ||
      (filters.hasMessages === 'no' && c.last_message_at === null);
    
    // 来源过滤
    const matchesSource = filters.source === 'all' || c.source === filters.source;
    
    return matchesSearch && matchesStatus && matchesMessages && matchesSource;
  });

  // 检查是否有活跃的过滤条件
  const hasActiveFilters = filters.status !== 'all' || filters.hasMessages !== 'all' || filters.source !== 'all';

  // 清除所有过滤条件
  const clearFilters = () => {
    setFilters({
      status: 'all',
      hasMessages: 'all',
      source: 'all'
    });
  };

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
      {/* 搜索框和过滤器 */}
      <div className="mb-6 space-y-3 relative">
        {/* 搜索框 */}
        <Field className="relative">
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
        
        {/* 过滤器按钮 */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            过滤器
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-3 h-3" />
              清除
            </Button>
          )}
        </div>
        
        {/* 过滤器浮层面板 */}
        {showFilters && (
          <>
            {/* 背景遮罩 */}
            {/* <div 
              className="fixed inset-0 bg-black bg-opacity-20 z-40"
              onClick={() => setShowFilters(false)}
            /> */}
            {/* 过滤器面板 */}
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 p-4 space-y-4 z-50 max-h-96 overflow-y-auto">
              {/* 面板标题 */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">过滤条件</h3>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </div>
              
              {/* 状态过滤 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">状态</label>
                <Menu as="div" className="relative">
                  <MenuButton className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span>
                      {filters.status === 'all' ? '全部状态' : 
                       filters.status === 'open' ? '进行中' : '已关闭'}
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </MenuButton>
                  <MenuItems className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <MenuItem>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        全部状态
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, status: 'open' }))}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        进行中
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, status: 'closed' }))}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        已关闭
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
              
              {/* 消息过滤 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">消息状态</label>
                <Menu as="div" className="relative">
                  <MenuButton className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span>
                      {filters.hasMessages === 'all' ? '全部会话' : 
                       filters.hasMessages === 'yes' ? '有消息' : '无消息'}
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </MenuButton>
                  <MenuItems className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <MenuItem>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, hasMessages: 'all' }))}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        全部会话
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, hasMessages: 'yes' }))}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        有消息
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, hasMessages: 'no' }))}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        无消息
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
              
              {/* 来源过滤 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">来源</label>
                <Menu as="div" className="relative">
                  <MenuButton className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span>
                      {filters.source === 'all' ? '全部来源' : filters.source}
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </MenuButton>
                  <MenuItems className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {sourceOptions.map(source => (
                      <MenuItem key={source}>
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, source }))}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          {source === 'all' ? '全部来源' : source}
                        </button>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
              
              {/* 底部操作按钮 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                <Button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  重置所有
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  确定
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
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
                group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 h-16
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
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className={`truncate font-medium ${selectedId === c.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                  {c.title || `会话 ${c.id}`}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>来源: {c.source}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 h-4">
                  {c.last_message_at ? (
                    c.last_message ? (
                      <span className="truncate">{c.last_message}</span>
                    ) : (
                      <span>有新消息</span>
                    )
                  ) : (
                    <span className="opacity-0">占位</span>
                  )}
                </div>
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
});

ChatSidebar.displayName = 'ChatSidebar';