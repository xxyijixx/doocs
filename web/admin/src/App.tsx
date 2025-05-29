import React, { useEffect } from 'react';
import { Chat } from './pages/Chat';
import { ThemeProvider } from './contexts/ThemeContext';
import { webSocketService } from './services/websocket';
import { useConversationStore } from './store/conversationStore';

const App: React.FC = () => {
  const { triggerRefresh } = useConversationStore();

  const refreshConversations = () => {
    console.log('触发会话列表刷新');
    triggerRefresh();
  };
  const initialized = React.useRef(false);

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
          // Potentially update the specific conversation's messages or show a notification
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
      webSocketService.close();
    };
    }
  }, [webSocketService]);



  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Chat />
      </div>
    </ThemeProvider>
  );
};

export default App;