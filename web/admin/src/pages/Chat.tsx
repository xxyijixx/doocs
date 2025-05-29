import React, { useState, useEffect } from 'react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';

interface ChatProps {
  onRefreshConversations?: () => void; // 保留属性但设为可选，以便向后兼容
  onCurrentConversationChange?: (conversationUuid: string | null) => void; // 添加新属性，用于通知当前选中的会话
}

export const Chat: React.FC<ChatProps> = ({ onRefreshConversations, onCurrentConversationChange }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
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
    if (onCurrentConversationChange) {
      onCurrentConversationChange(selectedConversation);
    }
  }, [selectedConversation, onCurrentConversationChange]);

  // 自定义的设置选中会话的函数，同时调用原始的 setState 和回调函数
  const handleSelectConversation = (uuid: string) => {
    setSelectedConversation(uuid);
  };

  // 返回会话列表（仅在移动端使用）
  const handleBackToList = () => {
    setShowSidebar(true);
  };

  return (
    <div className="flex w-full md:w-full h-full md:h-full rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
      {/* 在移动端根据状态显示侧边栏或聊天窗口 */}
      {(!isMobile || (isMobile && showSidebar)) && (
        <ChatSidebar
          selectedUuid={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onRefresh={onRefreshConversations}
          isMobile={isMobile}
        />
      )}
      
      {(!isMobile || (isMobile && !showSidebar)) && (
        <div className="flex-1 h-full">
          <ChatWindow 
            conversationUuid={selectedConversation} 
            onBackClick={isMobile ? handleBackToList : undefined}
          />
        </div>
      )}
    </div>
  );
};