import React, { useState } from 'react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';

interface ChatProps {
  onRefreshConversations?: () => void; // 保留属性但设为可选，以便向后兼容
}

export const Chat: React.FC<ChatProps> = ({ onRefreshConversations }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="flex w-[1100px] h-[700px] rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
      <ChatSidebar
        selectedUuid={selectedConversation}
        onSelectConversation={setSelectedConversation}
        onRefresh={onRefreshConversations} // 保留传递，但实际上已经不需要依赖这个属性了
      />
      <div className="flex-1 h-full">
        <ChatWindow conversationUuid={selectedConversation} />
      </div>
    </div>
  );
};