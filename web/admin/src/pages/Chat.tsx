import React, { useState, useEffect } from 'react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';
import { Transition } from '@headlessui/react';
import { DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface ChatProps {
  onRefreshConversations?: () => void; // 保留属性但设为可选，以便向后兼容
  onCurrentConversationChange?: (conversationId: number) => void; // 添加新属性，用于通知当前选中的会话
}

export const Chat: React.FC<ChatProps> = ({ onRefreshConversations, onCurrentConversationChange }) => {
  const [selectedConversation, setSelectedConversation] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  // 检测屏幕尺寸
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 在移动端选择会话后自动切换到聊天窗口
  useEffect(() => {
    if (isMobile && selectedConversation) {
      setShowSidebar(false);
    }
  }, [selectedConversation, isMobile]);

  // 当选中的会话变化时，通知父组件
  useEffect(() => {
    if (onCurrentConversationChange && selectedConversation > 0) {
      console.log("selectedConversation改变", selectedConversation)
      onCurrentConversationChange(selectedConversation);
    }
  }, [selectedConversation, onCurrentConversationChange]);

  // 自定义的设置选中会话的函数，同时调用原始的 setState 和回调函数
  const handleSelectConversation = (id: number) => {
    setSelectedConversation(id);
  };

  // 返回会话列表（仅在移动端使用）
  const handleBackToList = () => {
    setShowSidebar(true);
  };

  return (
    <div className="flex w-full md:w-full h-full md:h-full rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800 relative">
      {/* 设备类型指示器 */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
        {isMobile ? (
          <DevicePhoneMobileIcon className="w-4 h-4 text-blue-500" />
        ) : (
          <ComputerDesktopIcon className="w-4 h-4 text-green-500" />
        )}
        <span className="text-xs text-gray-600 dark:text-gray-300">
          {isMobile ? '移动端' : '桌面端'}
        </span>
      </div>

      {/* 侧边栏 - 使用 Transition 动画 */}
      <Transition
        show={!isMobile || (isMobile && showSidebar)}
        enter="transition-transform duration-300 ease-in-out"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform duration-300 ease-in-out"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
        as={isMobile ? "div" : "div"}
        className={isMobile ? "absolute inset-0 z-20" : "relative"}
      >
        <ChatSidebar
          selectedId={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onRefresh={onRefreshConversations}
          isMobile={isMobile}
        />
      </Transition>
      
      {/* 聊天窗口 - 使用 Transition 动画 */}
      <Transition
        show={!isMobile || (isMobile && !showSidebar)}
        enter="transition-transform duration-300 ease-in-out"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform duration-300 ease-in-out"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
        as="div" className="flex-1 h-full"
      >
        <ChatWindow 
          conversationId={selectedConversation} 
          onBackClick={isMobile ? handleBackToList : undefined}
        />
      </Transition>
    </div>
  );
};