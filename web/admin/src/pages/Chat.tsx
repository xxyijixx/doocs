import React, { useState, useEffect } from 'react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';

interface ChatProps {
  onRefreshConversations?: () => void; // 保留属性但设为可选，以便向后兼容
  onCurrentConversationChange?: (conversationUuid: string | null) => void; // 添加新属性，用于通知当前选中的会话
}

export const Chat: React.FC<ChatProps> = ({ onRefreshConversations, onCurrentConversationChange }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

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

  return (
    <div className="flex w-[1100px] h-[700px] rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
      <ChatSidebar
        selectedUuid={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onRefresh={onRefreshConversations} // 保留传递，但实际上已经不需要依赖这个属性了
      />
      <div className="flex-1 h-full">
        <ChatWindow conversationUuid={selectedConversation} />
      </div>
    </div>
  );
};