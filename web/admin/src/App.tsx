import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Chat } from './pages/Chat';
import { ServiceConfig } from './pages/ServiceConfig';
import { ThemeProvider } from './contexts/ThemeContext';
import { webSocketService } from './services/websocket';
import { useConversationStore } from './store/conversationStore';
import { useMessageStore } from './store/messageStore';
import type { Message } from './types/chat';
import { ThemeToggle } from './components/ThemeToggle';

const App: React.FC = () => {
  const { triggerRefresh } = useConversationStore();
  const { addMessage, triggerRefresh: refreshMessages } = useMessageStore();

  const refreshConversations = () => {
    console.log('触发会话列表刷新');
    triggerRefresh();
  };
  const initialized = React.useRef(false);
  // 添加状态来跟踪当前选中的会话
  const [currentConversationUuid, setCurrentConversationUuid] = useState<string | null>(null);

  // 预留更新左侧会话列表最近聊天内容的方法
  const updateConversationLastMessage = (convUuid: string, message: any) => {
    // TODO: 实现更新左侧会话列表最近聊天内容的逻辑
    console.log('更新会话最近消息:', convUuid, message);
    // 这里可以通过 Zustand store 来更新会话列表中特定会话的最近消息
    // 目前先触发整体刷新
    refreshConversations();
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
    // TODO: Replace 'test-agent-id' with the actual agent ID from authentication
    const agentId = '0'; 
    webSocketService.connect(agentId);

    const handleOpen = () => {
      console.log('WebSocket connected in App.tsx');
    };

    const handleMessage = (event: MessageEvent) => {
      console.log('Message from server in App.tsx: ', event.data);
      // TODO: Handle incoming messages, e.g., update state, show notifications
      try {
        const fullMessage = JSON.parse(event.data);
        // Example: Dispatch an action or update a context based on message type
        if (fullMessage.type === 'new_conversation') {
          const messageData = fullMessage.data;
          console.log('New conversation notification:', messageData);
          // 当收到新会话通知时，通过 Zustand store 触发会话列表刷新
          refreshConversations();

          // Potentially update a list of conversations or show a notification
        } else if (fullMessage.type === 'new_message') {
          const messageData = fullMessage.data;
          console.log('New message notification:', messageData);
          
          // 判断消息是否属于当前打开的会话
          if (messageData && messageData.conv_uuid === currentConversationUuid) {
            // 如果是当前打开的会话，通过 messageStore 更新消息列表
            console.log('收到当前会话的新消息，更新聊天窗口');
            
            // 创建一个符合 Message 接口的消息对象
            const newMessage: Message = {
              id: Date.now(), // 临时 ID，实际应该由后端提供
              conversation_uuid: messageData.conv_uuid,
              content: messageData.content,
              sender: 'customer', // 假设从 WebSocket 收到的消息都是客户发送的
              type: 'text',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // 添加消息到 store
            addMessage(messageData.conv_uuid, newMessage);
            
            // 触发消息列表刷新
            refreshMessages(messageData.conv_uuid);
          } else {
            // 如果不是当前打开的会话，可以更新左侧会话列表中该会话的最近消息
            if (messageData && messageData.conv_uuid) {
              updateConversationLastMessage(messageData.conv_uuid, messageData);
            }
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    const handleClose = (event: CloseEvent) => {
      console.log('WebSocket closed in App.tsx:', event);
    };

    const handleError = (event: Event) => {
      console.error('WebSocket error in App.tsx:', event);
    };

    webSocketService.addOpenListener(handleOpen);
    webSocketService.addMessageListener(handleMessage);
    webSocketService.addCloseListener(handleClose);
    webSocketService.addErrorListener(handleError);

    // Cleanup function
    return () => {
      // Note: In Strict Mode, cleanup runs after the first render.
      // The ref ensures connect is only called once, so cleanup might run
      // for the initial (potentially short-lived) effect run.
      // We only want to close the socket when the component unmounts.
      // However, the current WebSocketService doesn't easily support
      // checking if it was initialized by *this specific* effect run.
      // For now, we'll keep the close call, but be aware of Strict Mode behavior.
      // A more robust solution might involve managing the socket instance
      // within the effect itself or using a dedicated state management solution.
      webSocketService.removeOpenListener(handleOpen);
      webSocketService.removeMessageListener(handleMessage);
      webSocketService.removeCloseListener(handleClose);
      webSocketService.removeErrorListener(handleError);
      // webSocketService.close();
    };
    }
  }, [currentConversationUuid, addMessage, refreshMessages]); // 添加 messageStore 的方法作为依赖项

  // 导航链接组件
  const NavLink: React.FC<{to: string, children: React.ReactNode}> = ({ to, children }) => (
    <a 
      href={to} 
      className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 flex items-center gap-2"
      onClick={(e) => {
        e.preventDefault();
        window.history.pushState({}, '', to);
        window.dispatchEvent(new Event('popstate'));
      }}
    >
      {children}
    </a>
  );

  return (
    <ThemeProvider>
      <Router>
        <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
          {/* 顶部导航栏 */}
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Doocs</h1>
              <div className="flex items-center gap-4">
                <nav className="hidden md:flex items-center gap-2">
                  <NavLink to="/">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    聊天
                  </NavLink>
                  <NavLink to="/config">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    配置
                  </NavLink>
                </nav>
                <ThemeToggle />
              </div>
            </div>
          </header>
          
          {/* 主内容区 */}
          <main className="flex-1 container mx-auto px-4 py-8 h-[calc(100vh-60px)]">
            <Routes>
              <Route path="/" element={<Chat onCurrentConversationChange={setCurrentConversationUuid} />} />
              <Route path="/config" element={<ServiceConfig />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;