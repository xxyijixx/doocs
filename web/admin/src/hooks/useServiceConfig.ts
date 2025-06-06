import { useState, useEffect } from "react";
import { isMicroApp, appReady } from "@dootask/tools";
import {
  createBot,
  getBotList,
  updateBot,
  createProject,
  createTask,
  getTaskDialog,
  openUserDialog,
  getUserDialogList,
  sendMessage,
  getProjectInfo,
  updateProjectUser,
  updateProjectPermisson,
  createProjectColumn,
  generateMentionMessage,
} from "../api/dootask";
import { getConfig, saveConfig } from "../api/cs";
import {
  createSource,
  getSourceList,
  deleteSource,
} from "../api/source";
import type { SystemConfig, DooTaskChatConfig } from "../types/config";
import type { CustomerServiceSource } from "../types/source";
import type { UserBot } from "../types/dootask";

const defaultSystemConfig: SystemConfig = {
  serviceName: "客服中心",
  dooTaskIntegration: {
    botId: null,
    botToken: "",
    projectId: null,
    createTask: false,
  },
  defaultSourceConfig: {
    welcomeMessage: "欢迎来到客服中心，请问有什么可以帮助您的？",
    offlineMessage: "当前客服不在线，请留言，我们会尽快回复您。",
    workingHours: {
      enabled: true,
      startTime: "09:00",
      endTime: "18:00",
      workDays: [1, 2, 3, 4, 5], // 周一到周五
    },
    autoReply: {
      enabled: true,
      delay: 30,
      message: "您好，客服正在处理其他问题，请稍等片刻。",
    },
    agentAssignment: {
      method: "round-robin",
      timeout: 60,
      fallbackAgentId: null,
    },
    ui: {
      primaryColor: "#3B82F6",
      logoUrl: "",
      chatBubblePosition: "right",
    },
  },
  reserved1: "",
  reserved2: "",
};

const defaultDooTaskChatConfig: DooTaskChatConfig = {
  chat_key: "",
}

export const useServiceConfig = () => {
  // 状态管理
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(defaultSystemConfig);
  const [dootaskChatConfig, setDootaskChatConfig] = useState<DooTaskChatConfig>(defaultDooTaskChatConfig);
  const [sources, setSources] = useState<CustomerServiceSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isRunInMicroApp, setIsRunInMicroApp] = useState<boolean>(isMicroApp());
  const [userBots, setUserBots] = useState<UserBot[]>([]);
  const [selectedUserBot, setSelectedUserBot] = useState<UserBot | null>(null);
  const [newSourceName, setNewSourceName] = useState<string>("");
  const [isCreatingSource, setIsCreatingSource] = useState<boolean>(false);
  const [editingSource, setEditingSource] = useState<CustomerServiceSource | null>(null);
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // 初始化
  useEffect(() => {
    appReady().then(() => {
      console.log("微应用初始化完成");
    });

    if (isMicroApp()) {
      console.log("当前是微应用");
      setIsRunInMicroApp(true);
      onGetUserBotList();
    }

    loadConfig();
  }, []);

  // 加载配置
  const loadConfig = async () => {
    try {
      const configData = await getConfig("customer_service_system_config");
      if (configData) {
        setSystemConfig(configData);
        if (configData.dooTaskIntegration?.botId && isRunInMicroApp) {
          getBotList()
            .then((response) => {
              const bots = response.data.list;
              const selectedBot = bots.find(
                (bot) => bot.id === configData.dooTaskIntegration.botId
              );
              if (selectedBot) {
                setSelectedUserBot(selectedBot);
              }
              setUserBots(bots);
            })
            .catch((error) => {
              console.error("获取机器人列表失败:", error.message);
            });
        }
      } else {
        setSystemConfig(defaultSystemConfig);
      }

      if (isRunInMicroApp) {
        await loadSources();
      }

      setIsLoading(false);
    } catch (error) {
      console.error("加载配置失败:", error);
      setSystemConfig(defaultSystemConfig);
      setIsLoading(false);
    }

    try {
      const dootaskConfigData = await getConfig("dootask_chat");
      if (dootaskConfigData) {
        setDootaskChatConfig(dootaskConfigData);
      } else {
        setDootaskChatConfig(defaultDooTaskChatConfig);
      }
    } catch (error) {
      console.error("加载配置失败:", error);
    }
  };

  // 加载来源列表
  const loadSources = async () => {
    try {
      const sourceList = await getSourceList();
      setSources(sourceList);
    } catch (error) {
      console.error("加载来源列表失败:", error);
    }
  };

  // 获取机器人列表
  const onGetUserBotList = () => {
    if (!isRunInMicroApp) return;
    
    getBotList()
      .then((response) => {
        const bots = response.data.list;
        console.log("客服机器人列表:", bots);
        setUserBots(bots);
      })
      .catch((error) => {
        console.error("获取客服机器人列表失败:", error.message);
      });
  };

  const onUpdateUserBot = (userBot: UserBot) => {
    if (!isRunInMicroApp) return;

    updateBot(userBot)
     .then(() => {
        console.log("机器人更新成功");
        // 更新本地状态
        setSelectedUserBot(userBot);
        setUserBots(prevBots => 
          prevBots.map(bot => 
            bot.id === userBot.id ? userBot : bot
          )
        );
        setSaveMessage({
          type: "success",
          text: "机器人配置已更新",
        });
      })
     .catch((error) => {
        console.error("更新机器人失败:", error.message);
        setSaveMessage({
          type: "error",
          text: `更新机器人失败: ${error.message}`,
        });
      });
  }



  // 创建机器人
  const onCreateUserBot = async () => {
    if (!isRunInMicroApp) return;

    try {
      const createBotResponse = await createBot({
        id: 0,
        avatar: [],
        name: "客服机器人",
      });
      const botId = createBotResponse.data.id;
      console.log(`客服机器人ID: ${botId}`);

      const openUserDialogResponse = await openUserDialog(botId);
      const userBotDialogID = openUserDialogResponse.data.id;
      console.log(`对话ID: ${userBotDialogID}`);

      if (userBotDialogID <= 0) {
        console.error("对话ID无效");
        return;
      }

      await sendMessage({
        dialog_id: userBotDialogID,
        text: "/token",
      });
      console.log("消息发送成功");
    } catch (error: unknown) {
      console.error("创建或发送消息失败:", (error as Error).message);
    }
  };

  // 创建项目
  const onCreateProject = async () => {
    if (!isRunInMicroApp) return;
    
    if (!selectedUserBot) {
      setSaveMessage({
        type: "error",
        text: "请先选择一个机器人",
      });
      return;
    }
    
    if (systemConfig.dooTaskIntegration.projectId) {
      setSaveMessage({
        type: "error",
        text: "项目已存在，请先重置后再创建",
      });
      return;
    }

    try {
      // 创建项目
      const response = await createProject({
        name: "智慧客服",
        flow: false,
      });
      
      const projectId = response.data.id;
      console.log(`项目ID: ${projectId}`);

      // 更新系统配置
      setSystemConfig((prev) => ({
        ...prev,
        dooTaskIntegration: {
          ...prev.dooTaskIntegration,
          botId: selectedUserBot.id,
          projectId: projectId,
        },
      }));

      // 更新项目权限
      await updateProjectPermisson(projectId);
      
      // 获取项目信息并提取用户ID
      const projectInfo = await getProjectInfo(projectId);
      const projectUserIds: number[] = [];
      
      // 提取项目用户的userid
      if (projectInfo.data && projectInfo.data.project_user) {
        projectInfo.data.project_user.forEach((user: any) => {
          if (user.userid) {
            projectUserIds.push(user.userid);
          }
        });
      }
      
      // 添加机器人ID到用户列表
      if (selectedUserBot.id && !projectUserIds.includes(selectedUserBot.id)) {
        projectUserIds.push(selectedUserBot.id);
      }
      
      // 更新项目用户
      await updateProjectUser(projectId, projectUserIds);
      
      setSaveMessage({
        type: "success",
        text: `项目创建成功，项目ID: ${projectId}`,
      });
      
    } catch (error) {
      console.error("创建项目失败:", error);
      setSaveMessage({
        type: "error",
        text: `创建项目失败: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    }
  };

  // 创建并获取机器人Token
  const onCreateAndGetUserBotToken = async (botId: number) => {
    try {
      const openUserDialogResponse = await openUserDialog(botId);
      const userBotDialogID = openUserDialogResponse.data.id;
      console.log(`对话ID: ${userBotDialogID}`);
      
      await sendMessage({
        dialog_id: userBotDialogID,
        text: "/token",
      });
      
      setTimeout(async () => {
        const dialogList = await getUserDialogList(userBotDialogID);
        console.log("对话列表:", dialogList);
        
        for (const dialog of dialogList.data.list) {
          console.log("消息内容 ", dialog);
          if (dialog.msg.type == "/token") {
            const botToken = dialog.msg.data.token;
            console.log("Token", botToken);
            
            setSystemConfig((prev) => ({
              ...prev,
              dooTaskIntegration: {
                ...prev.dooTaskIntegration,
                botId: botId,
                botToken: botToken,
              },
            }));
            break;
          }
        }
      }, 2000);
    } catch (error) {
      console.error("获取对话列表失败:", error);
    }
  };

  // 选择机器人
  const onSelectUserBot = (bot: UserBot | null) => {
    if (bot) {
      onCreateAndGetUserBotToken(bot.id);
    }
    setSelectedUserBot(bot);
  };

  // 创建来源
  const onCreateSource = async () => {
    if (!isRunInMicroApp) return;
    
    if (!selectedUserBot) {
      setSaveMessage({
        type: "error",
        text: "请先选择一个机器人",
      });
      return;
    }
    
    if (!systemConfig.dooTaskIntegration.projectId) {
      setSaveMessage({
        type: "error",
        text: "请先创建项目",
      });
      return;
    }
    
    if (!newSourceName.trim()) {
      setSaveMessage({
        type: "error",
        text: "请输入来源名称",
      });
      return;
    }

    setIsCreatingSource(true);
    try {
      const columnResponse = await createProjectColumn(systemConfig.dooTaskIntegration.projectId, newSourceName.trim())
      const columnId = columnResponse.data.id;
      console.log(`项目列ID: ${columnId}`);
      const taskName = `智能客服-${newSourceName.trim()}-通知提醒`;

      const taskResponse = await createTask({
        project_id: systemConfig.dooTaskIntegration.projectId,
        name: taskName,
        content: `客服来源：${newSourceName.trim()}`,
      });

      const taskId = taskResponse.data.id;
      console.log(`任务ID: ${taskId}`);

      const dialogResponse = await getTaskDialog(taskId);
      const dialogId = dialogResponse.data.dialog_id;
      console.log(`任务对话: ${dialogId}`);

      await sendMessage({
        dialog_id: dialogId,
        text: generateMentionMessage(selectedUserBot.id, "智慧客服", "初始化"),
      });

      const sourceResponse = await createSource({
        name: newSourceName.trim(),
        taskId: taskId,
        dialogId: dialogId,
        projectId: systemConfig.dooTaskIntegration.projectId,
        columnId: columnId,
        botId: selectedUserBot.id,
      });

      const newSource: CustomerServiceSource = {
        id: sourceResponse.id,
        sourceKey: sourceResponse.sourceKey,
        name: newSourceName.trim(),
        projectId: sourceResponse.projetId,
        taskId: taskId,
        dialogId: dialogId,
        ...systemConfig.defaultSourceConfig,
      };

      setSources((prev) => [...prev, newSource]);
      setNewSourceName("");

      setSaveMessage({
        type: "success",
        text: `来源创建成功！来源key: ${sourceResponse.sourceKey}`,
      });
    } catch (error) {
      console.error("创建来源失败:", error);
      setSaveMessage({
        type: "error",
        text: `创建来源失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
      });
    } finally {
      setIsCreatingSource(false);
    }
  };

  // 删除来源
  const onDeleteSource = (source: CustomerServiceSource) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除确认',
      message: `确定要删除来源 "${source.name}" 吗？`,
      onConfirm: async () => {
        try {
          if (source.id) {
            await deleteSource(source.id);
          }
          setSources((prev) => prev.filter((s) => s.id !== source.id));
          setSaveMessage({
            type: "success",
            text: "来源删除成功",
          });
        } catch (error) {
          console.error("删除来源失败:", error);
          setSaveMessage({
            type: "error",
            text: `删除来源失败: ${
              error instanceof Error ? error.message : "未知错误"
            }`,
          });
        }
      }
    });
  };
  
  // 关闭确认对话框
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  // 重置系统配置
  const onResetSystemConfig = () => {
    setConfirmDialog({
      isOpen: true,
      title: '重置确认',
      message: '确定要重置系统配置吗？这将清除所有DooTask集成设置。',
      onConfirm: () => {
        setSystemConfig((prev) => ({
          ...prev,
          dooTaskIntegration: {
            botId: null,
            botToken: "",
            projectId: null,
            createTask: false,
          },
        }));
        setSelectedUserBot(null);
        setSaveMessage({
          type: "success",
          text: "系统配置已重置",
        });
      }
    });
  };

  // 保存系统配置
  const handleSystemConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await saveConfig("customer_service_system_config", systemConfig);
      console.log("保存系统配置:", systemConfig);

      setSaveMessage({
        type: "success",
        text: "系统配置已成功保存！",
      });
    } catch (error) {
      console.error("保存系统配置失败:", error);
      setSaveMessage({
        type: "error",
        text: `保存系统配置失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 处理系统配置基本字段变化
  const handleSystemConfigChange = (
    field: keyof SystemConfig,
    value: string
  ) => {
    setSystemConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 处理默认来源配置字段变化
  const handleDefaultSourceConfigChange = (field: string, value: unknown) => {
    setSystemConfig((prev) => ({
      ...prev,
      defaultSourceConfig: {
        ...prev.defaultSourceConfig,
        [field]: value,
      },
    }));
  };

  // 处理DooTask集成配置变化
  const handleDooTaskConfigChange = (field: string, value: unknown) => {
    setSystemConfig((prev) => ({
      ...prev,
      dooTaskIntegration: {
        ...prev.dooTaskIntegration,
        [field]: value,
      },
    }));
  };

  // 更新createTask配置
  const onUpdateCreateTask = (enabled: boolean) => {
    handleDooTaskConfigChange('createTask', enabled);
  };

  return {
    // 状态
    systemConfig,
    dootaskChatConfig,
    sources,
    isLoading,
    isSaving,
    saveMessage,
    isRunInMicroApp,
    userBots,
    selectedUserBot,
    newSourceName,
    isCreatingSource,
    editingSource,
    
    // 设置状态
    setNewSourceName,
    setEditingSource,
    setSaveMessage,
    
    // 确认对话框状态
    confirmDialog,
    closeConfirmDialog,
    
    // 方法
    onGetUserBotList,
    onCreateUserBot,
    onCreateProject,
    onSelectUserBot,
    onUpdateUserBot,
    onCreateSource,
    onDeleteSource,
    onResetSystemConfig,
    onUpdateCreateTask,
    handleSystemConfigSubmit,
    handleSystemConfigChange,
    handleDefaultSourceConfigChange,
    handleDooTaskConfigChange,
  };
};