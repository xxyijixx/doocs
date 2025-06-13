import React, { useState, useEffect, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
// import type { Conversation } from '../types/chat';
import { MagnifyingGlassIcon, HomeIcon, Cog6ToothIcon, UserGroupIcon, PlusIcon, CogIcon, FunnelIcon, XMarkIcon, EllipsisVerticalIcon, XCircleIcon, ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { Button, Field, Input, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
// import { ThemeToggle } from './ThemeToggle';
import { useConversationStore } from '../store/conversationStore';
import { closeConversation, reopenConversation } from '../api/cs';
import { isElectron, isMainElectron, openWindow } from '@dootask/tools';

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
  const { t } = useTranslation();
  const { conversations, loading, fetchConversations, refreshTrigger, updateConversationLastMessage, updateConversationStatus } = useConversationStore();
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

  // 关闭会话
  const handleCloseConversation = async (conversationId: number) => {
    try {
      await closeConversation(conversationId);
      // 更新本地状态
      updateConversationStatus(conversationId, 'closed');
    } catch (error) {
      console.error(t('chat.closeConversationError'), error);
      alert(t('chat.closeConversationFailed') + ': ' + (error instanceof Error ? error.message : t('agent.unknownError')));
    }
  };

  // 重新打开会话
  const handleReopenConversation = async (conversationId: number) => {
    try {
      await reopenConversation(conversationId);
      // 更新本地状态
      updateConversationStatus(conversationId, 'open');
    } catch (error) {
      console.error(t('chat.reopenConversationError'), error);
      alert(t('chat.reopenConversationFailed') + ': ' + (error instanceof Error ? error.message : t('agent.unknownError')));
    }
  };

  // 暴露方法给父组件使用
  React.useImperativeHandle(ref, () => ({
    handleNewMessageReceived,
    handleMessageSent
  }), [handleNewMessageReceived, handleMessageSent]);

  // 获取所有来源选项
  const sourceOptions = ['all', ...Array.from(new Set(conversations.map(c => c.source)))];

  // 搜索和过滤
  const filtered = conversations.filter(c => {
    // 搜索过滤
    const matchesSearch = (c.title || `${t('chat.conversation')} ${c.id}`).toLowerCase().includes(search.toLowerCase());
    
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
    <aside className={`flex flex-col h-full ${isMobile ? 'w-full' : 'w-full'} bg-white dark:bg-gray-800 ${isMobile ? 'rounded-lg' : 'rounded-l-lg md:rounded-l-xl lg:rounded-l-2xl'} shadow-lg px-4 sm:px-6 py-4 sm:py-6 md:py-8`}>
      {/* 顶部标题 */}
      <div className="flex items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex-1 dark:text-white">{t('chat.dialogs')}</h2>
        
        {/* 新窗口打开按钮 - 仅在Electron主窗口环境下显示 */}
        {isElectron() && isMainElectron() && (
          <Button
            onClick={() => {
              openWindow({
                url: "/apps/cs/chat",
                title: '客服系统 - 新窗口',
                width: 1200,
                height: 800
              });
            }}
            className="mr-3 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="在新窗口中打开"
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </Button>
        )}
        
        <span className="text-sm sm:text-base text-gray-400 dark:text-gray-500 font-semibold">{conversations.length}</span>
      </div>
      {/* 搜索框和过滤器 */}
      <div className="mb-4 sm:mb-6 space-y-3 relative">
        {/* 搜索框 */}
        <Field className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('chat.searchConversations')}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-white dark:placeholder-gray-400 transition-all"
            />
          </div>
        </Field>
        
        {/* 过滤器按钮 */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('chat.filters')}</span>
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
              <span className="hidden sm:inline">{t('chat.clear')}</span>
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
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('chat.filterConditions')}</h3>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </div>
              
              {/* 状态过滤 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('chat.status')}</label>
                <Menu as="div" className="relative">
                  <MenuButton className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span>
                      {filters.status === 'all' ? t('chat.allStatus') : 
                       filters.status === 'open' ? t('chat.active') : t('chat.closed')}
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </MenuButton>
                  <MenuItems className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <MenuItem>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        {t('chat.allStatus')}
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, status: 'open' }))}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        {t('chat.active')}
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, status: 'closed' }))}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        {t('chat.closed')}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('chat.source')}</label>
                <Menu as="div" className="relative">
                  <MenuButton className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span>
                      {filters.source === 'all' ? t('chat.allSources') : 
                       filters.source === 'web' ? t('chat.web') : 
                       filters.source === 'mobile' ? t('chat.mobile') : 
                       filters.source === 'wechat' ? t('chat.wechat') : filters.source}
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
                          {source === 'all' ? t('chat.allSources') : 
                           source === 'web' ? t('chat.web') : 
                           source === 'mobile' ? t('chat.mobile') : 
                           source === 'wechat' ? t('chat.wechat') : source}
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
            <span>{search ? t('chat.noMatchingConversations') : t('chat.noConversations')}</span>
          </div>
        ) : (
          filtered.map((c, idx) => (
            <div
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={`
                group w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 min-h-[60px] sm:h-16 cursor-pointer
                shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-100 dark:focus:bg-blue-900/30 text-left relative   
                ${selectedId === c.id ? 'bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'bg-white dark:bg-gray-800 hover:shadow-md'}
              `}
            >
              {/* 选中竖条 */}
              {selectedId === c.id && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded bg-blue-500" />
              )}
              {/* 彩色圆头像 */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-white shadow-sm ${avatarColors[idx % avatarColors.length]}`}>
                {c.title ? c.title[0].toUpperCase() : c.id}
              </div>
              {/* 标题和副标题 */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className={`truncate text-sm sm:text-base font-medium ${selectedId === c.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                  {c.title || `会话 ${c.id}`}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span className="hidden sm:inline">来源:</span>
                  <span>{c.source}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 h-4 hidden sm:block">
                  {c.last_message_at ? (
                    c.last_message ? (
                      <span className="truncate">{c.last_message}</span>
                    ) : (
                      <span>{t('chat.newMessage')}</span>
                    )
                  ) : (
                    <span className="opacity-0">{t('chat.placeholder')}</span>
                  )}
                </div>
              </div>
              {/* 状态指示器和操作菜单 */}
              <div className="flex items-center gap-2">
                {c.status === 'open' && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
                {c.status === 'closed' && (
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                )}
                
                {/* 操作菜单 */}
                <Menu as="div" className="relative">
                  <MenuButton 
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
                  </MenuButton>
                  <MenuItems className="absolute right-0 z-20 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    {c.status === 'open' ? (
                      <MenuItem>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseConversation(c.id);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          {t('chat.closeConversation')}
                        </button>
                      </MenuItem>
                    ) : (
                      <MenuItem>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReopenConversation(c.id);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          {t('chat.reopenConversation')}
                        </button>
                      </MenuItem>
                    )}
                  </MenuItems>
                </Menu>
              </div>
            </div>
          ))
        )}
      </div>
      {/* 底部导航栏 */}
      <div className="flex justify-between items-center mt-4 sm:mt-6 md:mt-8 px-1 sm:px-2">
        <div className="flex gap-2 sm:gap-3">
          <Button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
            <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
          </Button>
          <Button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
            <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
          </Button>
          <Button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
            <Cog6ToothIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
          </Button>
        </div>
        <Button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </aside>
  );
});

ChatSidebar.displayName = 'ChatSidebar';