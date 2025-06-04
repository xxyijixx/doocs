import React, { useState, useEffect, useRef } from "react";
import { chatApi } from "../services/api";
import type { Conversation } from "../types/chat";
import {
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Field,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { useMessageStore } from "../store/messageStore";
import { useConversationStore } from "../store/conversationStore";

interface ChatWindowProps {
  conversationId?: number;
  onBackClick?: () => void; // 添加返回按钮回调
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  onBackClick,
}) => {
  const { messagesByConversation, loading, fetchMessages, refreshTrigger, addMessage } =
    useMessageStore();
  const { conversations } = useConversationStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取当前会话的消息
  const messages = conversationId
    ? messagesByConversation[conversationId] || []
    : [];
  
  // 添加调试日志
  console.log('ChatWindow - conversationId:', conversationId);
  console.log('ChatWindow - messagesByConversation:', messagesByConversation);
  console.log('ChatWindow - messages数量:', messages.length);
    

  useEffect(() => {
    if (!conversationId) return;

    // 获取会话的消息
    fetchMessages(conversationId);

    // 从store中获取会话信息
    const currentConversation = conversations.find(conv => conv.id === conversationId);
    if (currentConversation) {
      setConversation(currentConversation);
    }
  }, [conversationId, fetchMessages, conversations]);

  // 当消息列表更新时，滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 当刷新触发器更新时，重新获取消息
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [refreshTrigger, conversationId, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const messageContent = newMessage.trim();
    setSending(true);
    
    // 清空输入框
    setNewMessage("");

    // 创建临时消息对象，立即添加到本地状态
    const tempMessage = {
      id: Date.now(), // 使用时间戳作为临时ID
      conversation_uuid: conversation?.uuid || '',
      conversation_id: conversationId,
      content: messageContent,
      sender: "agent" as const,
      type: "text" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 立即添加消息到本地状态
    addMessage(conversationId, tempMessage);

    try {
      // 发送消息到服务器
      const response = await chatApi.sendMessage({
        id: conversationId,
        content: messageContent,
        sender: "agent",
        type: "text",
      });
      
      // 如果服务器返回了消息数据，可以用服务器返回的数据更新本地消息
      // 这里假设服务器返回的消息有正确的ID
      if (response.data) {
        // 可以选择用服务器返回的消息替换临时消息
        // 或者保持当前的临时消息不变
      }
      
      setSending(false);
    } catch (error) {
      console.error("发送消息失败:", error);
      // 发送失败时，可以选择移除刚添加的消息或显示错误状态
      // 这里暂时保留消息，但可以根据需要调整
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-lg h-full space-y-4">
        <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        <div className="text-center">
          <p className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
            欢迎使用客服系统
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            请从左侧选择一个会话开始聊天
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-8 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-3">
          {onBackClick && (
            <Button
              onClick={onBackClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold dark:text-white">
              {conversation?.title || `会话 ${conversation?.id || ""}`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                conversation?.status === "open"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400"
              }`}
            >
              {conversation?.status === "open" ? "进行中" : "已关闭"}
            </span>
            {conversation?.status === "open" && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>

        {/* 菜单按钮 */}
        <Menu as="div" className="relative">
          <MenuButton className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </MenuButton>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={`${
                      focus ? "bg-gray-100 dark:bg-gray-600" : ""
                    } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200`}
                  >
                    查看详情
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={`${
                      focus ? "bg-gray-100 dark:bg-gray-600" : ""
                    } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200`}
                  >
                    结束会话
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        {loading ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-10">
            加载中...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <div>
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">
                暂无消息
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                开始对话吧
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <Transition
              key={message.id || index}
              appear
              show={true}
              enter="transition-all duration-300"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
            >
              <div
                className={`flex gap-3 ${
                  message.sender === "agent" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "customer" && (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-md">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex flex-col max-w-xs lg:max-w-md">
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      message.sender === "agent"
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p
                    className={`text-xs mt-1 opacity-70 ${
                      message.sender === "agent" ? "text-right" : "text-left"
                    }`}
                  >
                    {message.created_at
                      ? new Date(message.created_at).toLocaleTimeString()
                      : ""}
                  </p>
                </div>
                {message.sender === "agent" && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <CpuChipIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </Transition>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="px-8 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex gap-3 items-end">
          <Field className="flex-1">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage(e)
              }
              placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 resize-none"
              disabled={sending}
              style={{ minHeight: "48px" }}
            />
          </Field>
          <Button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-sm hover:shadow-md"
          >
            {sending ? (
              <>
                <CogIcon className="w-4 h-4 animate-spin" />
                发送中...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4" />
                发送
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};
