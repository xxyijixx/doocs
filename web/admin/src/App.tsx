import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Chat } from "./pages/Chat";
import ServiceConfig from "./pages/ServiceConfig";
import AgentManagement from "./pages/AgentManagement";
import Welcome from "./pages/Welcome";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ToastProvider, useToast } from "./components/Toast";
import { setGlobalErrorConfig } from "./utils/errorHandler";
import { webSocketService } from "./services/websocket";
import { useConversationStore } from "./store/conversationStore";
import { useMessageStore } from "./store/messageStore";
import type { Message } from "./types/chat";
// import { ThemeToggle } from './components/ThemeToggle';
import { PermissionGuard } from "./components/PermissionGuard";
import { useAuth } from "./hooks/useAuth";
// import { LanguageSwitch } from "./components/LanguageSwitch";
import { useTranslation } from "react-i18next";
import { isMicroApp, getUserToken } from "@dootask/tools";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";

const App: React.FC = () => {
  const { addConversation } = useConversationStore();
  const { addMessage, triggerRefresh: refreshMessages } = useMessageStore();
  const { isAdmin, isAgent, isLoading } = useAuth();

  const initialized = React.useRef(false);
  // 添加状态来跟踪当前选中的会话
  const [currentConversationId, setCurrentConversationId] = useState<number>(0);
  const currentConversationIdRef = React.useRef<number>(0);
  // 预留更新左侧会话列表最近聊天内容的方法
  const updateConversationLastMessage = (
    convUuid: string,
    message: Message
  ) => {
    // TODO: 实现更新左侧会话列表最近聊天内容的逻辑
    console.log("更新会话最近消息:", convUuid, message);
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      console.log("初始化WebSocket连接...");
      // TODO: Replace 'test-agent-id' with the actual agent ID from authentication
      webSocketService.connect(getUserToken());
      console.log(
        "WebSocket连接请求已发送，当前状态:",
        webSocketService.getReadyState()
      );
      if (isMicroApp()) {
        console.log("当前是微应用");
      }

      const handleOpen = () => {
        console.log("WebSocket connected in App.tsx");
        console.log("WebSocket readyState:", webSocketService.getReadyState());
      };

      const handleMessage = (event: MessageEvent) => {
        console.log("=== WebSocket消息处理开始 ===");
        console.log("Message from server in App.tsx: ", event.data);
        console.log("消息类型:", typeof event.data);
        console.log("消息长度:", event.data.length);
        // TODO: Handle incoming messages, e.g., update state, show notifications
        try {
          const fullMessage = JSON.parse(event.data);
          // Example: Dispatch an action or update a context based on message type
          if (fullMessage.type === "new_conversation") {
            const messageData = fullMessage.data;
            console.log("New conversation notification:", messageData);
            // 当收到新会话通知时，通过 Zustand store 触发会话列表刷新
            addConversation(messageData);

            // Potentially update a list of conversations or show a notification
          } else if (fullMessage.type === "new_message") {
            const messageData = fullMessage.data;
            console.log("New message notification:", messageData);
            const data = messageData as Message;

            // 添加详细的调试日志
            console.log(
              "当前会话ID(ref):",
              currentConversationIdRef.current,
              "类型:",
              typeof currentConversationIdRef.current
            );
            console.log(
              "当前会话ID(state):",
              currentConversationId,
              "类型:",
              typeof currentConversationId
            );
            console.log(
              "消息会话ID:",
              data.conversation_id,
              "类型:",
              typeof data.conversation_id
            );
            console.log(
              "ID比较结果:",
              data.conversation_id === currentConversationIdRef.current
            );

            // 判断消息是否属于当前打开的会话
            if (
              messageData &&
              data.conversation_id === currentConversationIdRef.current
            ) {
              // 如果是当前打开的会话，通过 messageStore 更新消息列表
              console.log("收到当前会话的新消息，更新聊天窗口");

              // 添加消息到 store
              addMessage(data.conversation_id, data);
              console.log("已调用addMessage，会话ID:", data.conversation_id);

              // 触发消息列表刷新
              // refreshMessages(messageData.conv_uuid);
            } else {
              console.log("消息不属于当前会话，跳过更新聊天窗口");
              // 如果不是当前打开的会话，可以更新左侧会话列表中该会话的最近消息
              if (messageData && messageData.conv_uuid) {
                updateConversationLastMessage(
                  messageData.conversation_id,
                  messageData
                );
              }
            }
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      const handleClose = (event: CloseEvent) => {
        console.log("WebSocket closed in App.tsx:", event);
        console.log("关闭代码:", event.code, "关闭原因:", event.reason);
      };

      const handleError = (event: Event) => {
        console.error("WebSocket error in App.tsx:", event);
        console.error("错误详情:", event);
      };

      webSocketService.addOpenListener(handleOpen);
      webSocketService.addMessageListener(handleMessage);
      webSocketService.addCloseListener(handleClose);
      webSocketService.addErrorListener(handleError);
      console.log("所有WebSocket监听器已注册完成");

      // 延迟检查连接状态
      setTimeout(() => {
        console.log("延迟检查WebSocket状态:", webSocketService.getReadyState());
      }, 1000);

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
  }, [addMessage, refreshMessages]); // 添加 messageStore 的方法作为依赖项

  // NavLink component removed as it's not being used

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppWithErrorHandling
            currentConversationId={currentConversationId}
            currentConversationIdRef={currentConversationIdRef}
            setCurrentConversationId={setCurrentConversationId}
            isAdmin={isAdmin}
            isAgent={isAgent}
            isLoading={isLoading}
          />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

// 分离出带错误处理的应用组件
interface AppWithErrorHandlingProps {
  currentConversationId: number;
  currentConversationIdRef: React.MutableRefObject<number>;
  setCurrentConversationId: (id: number) => void;
  isAdmin: boolean;
  isAgent: boolean;
  isLoading: boolean;
}

function AppWithErrorHandling({
  currentConversationId,
  currentConversationIdRef,
  setCurrentConversationId,
  isAdmin,
  isAgent,
  isLoading,
}: AppWithErrorHandlingProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 配置全局错误处理
  useEffect(() => {
    setGlobalErrorConfig({
      showToast: (message, type) => {
        switch (type) {
          case "error":
            toast.showError(message);
            break;
          case "warning":
            toast.showWarning(message);
            break;
          case "info":
            toast.showInfo(message);
            break;
          default:
            toast.showSuccess(message);
            break;
        }
      },
      showApiError: (error) => {
        // 可以根据错误码进行特殊处理
        if (error.code === 401) {
          toast.showWarning("登录已过期，请重新登录");
        } else {
          toast.showError(error.message, error.originalError);
        }
      },
      showNetworkError: (error) => {
        toast.showError("网络错误", error.message);
      },
    });
  }, [toast]);

  // NavLink component removed as it's not being used

  return (
    <Router>
      <div className="h-full flex flex-col">
        {/* 应用头部 - 适配移动端和桌面端 */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* 应用标题和用户信息 */}
              <div className="flex items-center gap-3">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                  Doocs
                </h1>
                {/* 用户权限标识 */}
                {!isLoading && (
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                        {t("agent.admin")}
                      </span>
                    )}
                    {isAgent && (
                      <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                        {t("agent.agent")}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* 导航菜单按钮 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="sr-only">{isMobileMenuOpen ? '关闭菜单' : '打开菜单'}</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </header>
        
        {/* 全屏导航菜单 */}
        <Transition
          show={isMobileMenuOpen}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
            {/* 菜单头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('navigation.menu')}
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* 菜单内容 */}
            <div className="p-4 space-y-2">
              {/* 聊天页面 */}
              {(isAdmin || isAgent) && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.history.pushState({}, "", "/chat");
                    window.dispatchEvent(new Event("popstate"));
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{t("navigation.chat")}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">客服聊天界面</div>
                  </div>
                </button>
              )}
              
              {/* 客服管理 */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.history.pushState({}, "", "/agents");
                    window.dispatchEvent(new Event("popstate"));
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{t("navigation.agent")}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">管理客服人员</div>
                  </div>
                </button>
              )}
              
              {/* 系统配置 */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.history.pushState({}, "", "/config");
                    window.dispatchEvent(new Event("popstate"));
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{t("navigation.config")}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">系统设置配置</div>
                  </div>
                </button>
              )}
            </div>
          </div>
         </Transition>

        {/* 主内容区 */}
        <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 md:py-8 h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] overflow-auto">
          <Routes>
            <Route
              path="/entry"
              element={<Welcome />}
            />
            <Route
              path="/chat"
              element={
                <PermissionGuard requireAgent={true}>
                  <Chat
                    onCurrentConversationChange={(conversationId: number) => {
                      console.log(
                        "App.tsx selectedConversation改变",
                        conversationId
                      );
                      console.log(
                        "设置前currentConversationId:",
                        currentConversationId
                      );
                      setCurrentConversationId(conversationId);
                      currentConversationIdRef.current = conversationId;
                      console.log("设置后应该为:", conversationId);
                    }}
                  />
                </PermissionGuard>
              }
            />
            <Route
              path="/agents"
              element={
                <PermissionGuard requireAdmin={true}>
                  <AgentManagement />
                </PermissionGuard>
              }
            />
            <Route
              path="/config"
              element={
                <PermissionGuard requireAdmin={true}>
                  <ServiceConfig />
                </PermissionGuard>
              }
            />
            <Route
              path="*"
              element={
                <PermissionGuard requireAgent={true}>
                  <Navigate to="/chat" replace />
                </PermissionGuard>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
