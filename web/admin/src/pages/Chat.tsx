import React, { useState } from 'react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';

export const Chat: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="flex w-[1100px] h-[700px] rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
      <ChatSidebar
        selectedUuid={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />
      <div className="flex-1 h-full">
        <ChatWindow conversationUuid={selectedConversation} />
      </div>
    </div>
  );
};