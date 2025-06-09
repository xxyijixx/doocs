import { useServiceConfig } from "../hooks/useServiceConfig";
import { MessageAlert } from "../components/common/MessageAlert";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { BotConfigSection } from "../components/config/BotConfigSection";
import { ChatConfigSection } from "../components/config/ChatConfigSection";
import { ConfirmDialog } from "../components/ConfirmDialog";

export default function ServiceConfig() {
  const {
    systemConfig,
    dootaskChatConfig,
    serverConfig,
    sources,
    isLoading,
    isSaving,
    saveMessage,
    userBots,
    selectedUserBot,
    newSourceName,
    isCreatingSource,
    confirmDialog,
    closeConfirmDialog,
    setNewSourceName,
    setEditingSource,
    onGetUserBotList,
    onCreateUserBot,
    onUpdateUserBot,
    onCreateProject,
    onCheckProjectUser,
    onAddBotToProject,
    onSelectUserBot,
    onCreateSource,
    onDeleteSource,
    onResetSystemConfig,
    onUpdateCreateTask,
    handleSystemConfigSubmit,
  } = useServiceConfig();

  if (isLoading) {
    return <LoadingSpinner message="加载配置中..." />;
  }

  return (
    <div className="h-full py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">客服系统配置</h1>
          <p className="mt-2 text-gray-600">
            配置您的客服系统设置，包括机器人集成、默认消息和界面设置。
          </p>
        </div>

        <form onSubmit={handleSystemConfigSubmit} className="space-y-6">
          {/* 消息提示 */}
          <MessageAlert message={saveMessage}/>

          {/* 机器人配置 */}
          <BotConfigSection
            systemConfig={systemConfig}
            dootaskChatConfig={dootaskChatConfig}
            serverConfig={serverConfig}
            userBots={userBots}
            selectedUserBot={selectedUserBot}
            sourcesCount={sources.length}
            onGetUserBotList={onGetUserBotList}
            onCreateUserBot={onCreateUserBot}
            onUpdateUserBot={onUpdateUserBot}
            onSelectUserBot={onSelectUserBot}
            onCreateProject={onCreateProject}
            onResetSystemConfig={onResetSystemConfig}
            onCheckProjectUser={onCheckProjectUser}
            onAddBotToProject={onAddBotToProject}
          />

          {/* 聊天配置 */}
          <ChatConfigSection
            systemConfig={systemConfig}
            selectedUserBot={selectedUserBot}
            sources={sources}
            newSourceName={newSourceName}
            isCreatingSource={isCreatingSource}
            serverConfig={serverConfig}
            setNewSourceName={setNewSourceName}
            onCreateProject={onCreateProject}
            onResetSystemConfig={onResetSystemConfig}
            onCreateSource={onCreateSource}
            onDeleteSource={onDeleteSource}
            onEditSource={setEditingSource}
            onUpdateCreateTask={onUpdateCreateTask}
          />

          {/* 基本配置 */}
          {/* <BasicConfigSection
            systemConfig={systemConfig}
            onSystemConfigChange={handleSystemConfigChange}
            onDefaultSourceConfigChange={handleDefaultSourceConfigChange}
          /> */}

          {/* 工作时间设置 */}
           {/* <WorkingHoursSection
             systemConfig={systemConfig}
             onDefaultSourceConfigChange={handleDefaultSourceConfigChange}
           /> */}

          {/* 默认自动回复和客服分配设置 */}
           {/* <AutoReplySection
             systemConfig={systemConfig}
             onDefaultSourceConfigChange={handleDefaultSourceConfigChange}
           /> */}

          {/* 默认界面设置 */}
           {/* <UIConfigSection
             systemConfig={systemConfig}
             onDefaultSourceConfigChange={handleDefaultSourceConfigChange}
           /> */}

          {/* 提交按钮 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  保存中...
                </>
              ) : (
                "保存配置"
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* 确认对话框 */}
       <ConfirmDialog
         isOpen={confirmDialog.isOpen}
         onClose={closeConfirmDialog}
         onConfirm={confirmDialog.onConfirm}
         title={confirmDialog.title}
         message={confirmDialog.message}
         type={confirmDialog.title === '删除确认' ? 'danger' : 'warning'}
         confirmText={confirmDialog.title === '删除确认' ? '删除' : '确认'}
         cancelText="取消"
       />
    </div>
  );
}
