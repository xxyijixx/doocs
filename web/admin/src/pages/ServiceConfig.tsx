import React, { useState, useEffect } from "react";
import type { SystemConfig } from "../types/config";
import type { CustomerServiceSource } from "../types/source";
import { appReady, isMicroApp } from "@dootask/tools";
import { createBot, getBotList, createProject, createTask, getTaskDialog, sendMessage, generateMentionMessage } from "../api/dootask";
import { getConfig, saveConfig } from "../api/cs";
import { createSource, getSourceList, updateSource, deleteSource } from "../api/source";
import type { UserBot } from "../types/dootask";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Switch,
  Field,
  Label,
  Input,
  Textarea,
  Select,
  Button,
  RadioGroup,
  Radio,
  Fieldset,
  Legend,
} from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  CogIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BoltIcon,
  PaintBrushIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/20/solid";

export const ServiceConfig: React.FC = () => {
  // 默认系统配置
  const defaultSystemConfig: SystemConfig = {
    serviceName: "客服中心",

    dooTaskIntegration: {
      botId: null,
      projectId: null,
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

  // 状态管理
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(defaultSystemConfig);
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
  
  // 来源管理相关状态
  const [newSourceName, setNewSourceName] = useState<string>("");
  const [isCreatingSource, setIsCreatingSource] = useState<boolean>(false);
  const [editingSource, setEditingSource] = useState<CustomerServiceSource | null>(null);

  appReady().then(() => {
    console.log("微应用初始化完成");
  });

  // 创建机器人
  const onCreateUserBot = () => {
    if (!isRunInMicroApp) {
      return;
    }
    createBot({
      id: 0,
      avatar: [],
      name: "客服机器人",
    })
      .then((response) => {
        const botId = response.data.id;
        console.log(`客服机器人ID: ${botId}`);
      })
      .catch((error) => {
        console.error("编辑客服机器人失败:", error.message);
      });
  };

  // 获取机器人列表
  const onGetUserBotList = () => {
    if (!isRunInMicroApp) {
      return;
    }
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

  const onCreateProject = () => {
    if (!isRunInMicroApp) {
      return;
    }
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
    
    createProject({
      name: "智慧客服",
      flow: false,
    }).then((response) => {
      const projectId = response.data.id;
      console.log(`项目ID: ${projectId}`);
      
      // 更新配置中的项目ID和机器人ID
      setSystemConfig(prev => ({
        ...prev,
        dooTaskIntegration: {
          ...prev.dooTaskIntegration,
          botId: selectedUserBot.id,
          projectId: projectId,
        }
      }));
      
      setSaveMessage({
        type: "success",
        text: `项目创建成功，项目ID: ${projectId}`,
      });
    }).catch((error) => {
      console.error("创建项目失败:", error.message);
      setSaveMessage({
        type: "error",
        text: `创建项目失败: ${error.message}`,
      });
    });
  }

  // 创建新的客服来源
  const onCreateSource = async () => {
    if (!isRunInMicroApp) {
      return;
    }
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
      // 生成任务名称：智能客服-{来源名}
      const taskName = `智能客服-${newSourceName.trim()}`;
      
      // 创建任务
      const taskResponse = await createTask({
        project_id: systemConfig.dooTaskIntegration.projectId,
        name: taskName,
        content: `客服来源：${newSourceName.trim()}`
      });
      
      const taskId = taskResponse.data.id;
      console.log(`任务ID: ${taskId}`);

      // 获取任务对话
      const dialogResponse = await getTaskDialog(taskId);
      const dialogId = dialogResponse.data.dialog_id;
      console.log(`任务对话: ${dialogId}`);
      
      // 发送初始化消息
      await sendMessage({
        dialog_id: dialogId,
        text: generateMentionMessage(selectedUserBot.id, "智慧客服", "初始化"),
      });
      
      // 调用后端API创建来源记录
      const sourceResponse = await createSource({
        name: newSourceName.trim(),
        taskId: taskId,
        dialogId: dialogId,
        projectId: systemConfig.dooTaskIntegration.projectId,
        botId: selectedUserBot.id,
      });
      // console.log(`来源I: ${sourceResponse}`);
      // console.log(`来源创建成功，来源ID: ${sourceResponse.id}`);
      
      // 创建新的来源对象，使用系统默认配置
      const newSource: CustomerServiceSource = {
        id: sourceResponse.id,
        sourceKey: sourceResponse.sourceKey,
        name: newSourceName.trim(),
        taskId: taskId,
        dialogId: dialogId,
        ...systemConfig.defaultSourceConfig,
      };
      
      // 更新来源列表
      setSources(prev => [...prev, newSource]);
      setNewSourceName("");
      
      setSaveMessage({
        type: "success",
        text: `来源创建成功！来源key: ${sourceResponse.sourceKey}`,
      });
    } catch (error) {
      console.error("创建来源失败:", error);
      setSaveMessage({
        type: "error",
        text: `创建来源失败: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    } finally {
      setIsCreatingSource(false);
    }
  };
  
  // 删除来源
  const onDeleteSource = async (source: CustomerServiceSource) => {
    if (!window.confirm(`确定要删除来源 "${source.name}" 吗？`)) {
      return;
    }
    
    try {
      if (source.id) {
        await deleteSource(source.id);
      }
      setSources(prev => prev.filter(s => s.id !== source.id));
      setSaveMessage({
        type: "success",
        text: "来源删除成功",
      });
    } catch (error) {
      console.error("删除来源失败:", error);
      setSaveMessage({
        type: "error",
        text: `删除来源失败: ${error instanceof Error ? error.message : '未知错误'}`,
      });
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

  // 重置系统配置
  const onResetSystemConfig = () => {
    setSystemConfig(prev => ({
      ...prev,
      dooTaskIntegration: {
        botId: null,
        projectId: null,
      }
    }));
    setSelectedUserBot(null);
    setSaveMessage({
      type: "success",
      text: "系统配置已重置",
    });
  };

  // 从API加载配置
  useEffect(() => {
    if (isMicroApp()) {
      console.log("当前是微应用");
      setIsRunInMicroApp(true);
      onGetUserBotList();
    }
    
    const loadConfig = async () => {
      try {
        // 尝试从后端加载配置
        const configData = await getConfig('customer_service_system_config');
        if (configData) {
          setSystemConfig(configData);
          // 如果有机器人ID，尝试设置选中的机器人
          if (configData.dooTaskIntegration?.botId) {
            // 获取机器人列表并设置选中的机器人
            if (isRunInMicroApp) {
              getBotList().then((response) => {
                const bots = response.data.list;
                const selectedBot = bots.find(bot => bot.id === configData.dooTaskIntegration.botId);
                if (selectedBot) {
                  setSelectedUserBot(selectedBot);
                }
                setUserBots(bots);
              }).catch((error) => {
                console.error("获取机器人列表失败:", error.message);
              });
            }
          }
        } else {
          // 如果没有配置，使用默认配置
          setSystemConfig(defaultSystemConfig);
        }
        
        // 加载来源列表
        if (isRunInMicroApp) {
          loadSources();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("加载配置失败:", error);
        // 加载失败时使用默认配置
        setSystemConfig(defaultSystemConfig);
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [isRunInMicroApp]);

  // 处理系统配置表单提交
  const handleSystemConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // 调用后端API保存系统配置
      await saveConfig('customer_service_system_config', systemConfig);
      console.log("保存系统配置:", systemConfig);

      setSaveMessage({
        type: "success",
        text: "系统配置已成功保存！",
      });
    } catch (error) {
      console.error("保存系统配置失败:", error);
      setSaveMessage({
        type: "error",
        text: `保存系统配置失败: ${error instanceof Error ? error.message : '未知错误'}`,
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
  const handleDefaultSourceConfigChange = (
    field: string,
    value: any
  ) => {
    setSystemConfig((prev) => ({
      ...prev,
      defaultSourceConfig: {
        ...prev.defaultSourceConfig,
        [field]: value,
      },
    }));
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <CogIcon className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载配置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        客服系统配置
      </h1>

      {saveMessage && (
        <div
          className={`mb-6 p-4 rounded-md flex items-center gap-3 ${
            saveMessage.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
          )}
          {saveMessage.text}
        </div>
      )}

      <form onSubmit={handleSystemConfigSubmit} className="space-y-8">
        {/* 机器人配置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BoltIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              机器人配置
            </h2>
          </div>
          <div className="space-y-4">
            {/* 显示当前配置状态 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">当前配置状态</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">机器人ID:</span>
                  <span className="ml-2 font-mono">{systemConfig.dooTaskIntegration.botId || '未设置'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">项目ID:</span>
                  <span className="ml-2 font-mono">{systemConfig.dooTaskIntegration.projectId || '未设置'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">来源数量:</span>
                  <span className="ml-2 font-mono">{sources.length}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button
                type="button"
                onClick={onGetUserBotList}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition data-[hover]:bg-blue-600 data-[focus]:ring-2 data-[focus]:ring-blue-500"
              >
                <SparklesIcon className="h-4 w-4" />
                获取机器人列表
              </Button>

              <div className="relative">
                <Listbox value={selectedUserBot} onChange={setSelectedUserBot}>
                  <ListboxButton className="relative w-48 cursor-default rounded-md bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                    <span className="block truncate text-gray-900 dark:text-white">
                      {selectedUserBot?.name || "未选择机器人"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {userBots.map((bot) => (
                      <ListboxOption
                        key={bot.id}
                        value={bot}
                        className="group relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 dark:text-white data-[focus]:bg-blue-600 data-[focus]:text-white"
                      >
                        <span className="block truncate font-normal group-data-[selected]:font-semibold">
                          {bot.name}
                        </span>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Listbox>
              </div>

              <Button
                type="button"
                onClick={onCreateUserBot}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition data-[hover]:bg-green-600 data-[focus]:ring-2 data-[focus]:ring-green-500"
              >
                <BoltIcon className="h-4 w-4" />
                创建机器人
              </Button>
            </div>
          </div>
        </section>

        {/* 聊天配置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BoltIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              聊天配置
            </h2>
          </div>
          <div className="space-y-4">
            {/* 显示当前配置状态 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">当前配置状态</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">机器人ID:</span>
                  <span className="ml-2 font-mono">{systemConfig.dooTaskIntegration.botId || '未设置'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">项目ID:</span>
                  <span className="ml-2 font-mono">{systemConfig.dooTaskIntegration.projectId || '未设置'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">来源数量:</span>
                  <span className="ml-2 font-mono">{sources.length}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button
                type="button"
                onClick={onCreateProject}
                disabled={!selectedUserBot || !!systemConfig.dooTaskIntegration.projectId}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition data-[hover]:bg-blue-600 data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="h-4 w-4" />
                创建项目
              </Button>

              <Button
                type="button"
                onClick={onResetSystemConfig}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition data-[hover]:bg-red-600 data-[focus]:ring-2 data-[focus]:ring-red-500"
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
                重置系统配置
              </Button>
            </div>
            
            {/* 来源管理 */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">客服来源管理</h3>
              
              {/* 创建新来源 */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    {/* <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      来源名称
                    </Label> */}
                    <Input
                      type="text"
                      value={newSourceName}
                      onChange={(e) => setNewSourceName(e.target.value)}
                      placeholder="请输入来源名称"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={onCreateSource}
                    disabled={isCreatingSource || !selectedUserBot || !systemConfig.dooTaskIntegration.projectId || !newSourceName.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingSource ? (
                      <CogIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusIcon className="h-4 w-4" />
                    )}
                    {isCreatingSource ? '创建中...' : '创建来源'}
                  </Button>
                </div>
              </div>
              
              {/* 来源列表 */}
              {sources.length > 0 && (
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div key={source.id} className="bg-white dark:bg-gray-600 p-4 rounded-md border border-gray-200 dark:border-gray-500">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 dark:text-white">{source.name}</h4>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span>来源Key: </span>
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{source.sourceKey}</code>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            任务ID: {source.taskId} | 对话ID: {source.dialogId}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => setEditingSource(source)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            <PencilIcon className="h-3 w-3" />
                            编辑
                          </Button>
                          <Button
                            type="button"
                            onClick={() => onDeleteSource(source)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            <TrashIcon className="h-3 w-3" />
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {sources.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <DocumentDuplicateIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无客服来源，请创建第一个来源</p>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* 系统基本设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CogIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              系统基本设置
            </h2>
          </div>
          <div className="space-y-4">
            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                服务名称
              </Label>
              <Input
                type="text"
                value={systemConfig.serviceName}
                onChange={(e) =>
                  handleSystemConfigChange("serviceName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
                required
              />
            </Field>
          </div>
        </section>
        
        {/* 默认来源配置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CogIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              默认来源配置
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">(新创建的来源将使用这些默认值)</span>
          </div>
          <div className="space-y-4">
            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                欢迎消息
              </Label>
              <Textarea
                value={systemConfig.defaultSourceConfig.welcomeMessage}
                onChange={(e) =>
                  handleDefaultSourceConfigChange("welcomeMessage", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 resize-none"
                rows={3}
                required
              />
            </Field>

            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                离线消息
              </Label>
              <Textarea
                value={systemConfig.defaultSourceConfig.offlineMessage}
                onChange={(e) =>
                  handleDefaultSourceConfigChange("offlineMessage", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 resize-none"
                rows={3}
                required
              />
            </Field>
          </div>
        </section>

            {/* 默认工作时间设置 */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CogIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            默认工作时间设置
            </h2>
          </div>
          <div className="space-y-4">
            <Field className="flex items-center gap-3">
              <Switch
                checked={systemConfig.defaultSourceConfig.workingHours.enabled}
                onChange={(checked) =>
                  handleDefaultSourceConfigChange("workingHours", {
                    ...systemConfig.defaultSourceConfig.workingHours,
                    enabled: checked
                  })
                }
                className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[checked]:bg-blue-600"
              >
                <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5" />
              </Switch>
              <Label className="text-sm text-gray-700 dark:text-gray-300">
                启用工作时间限制
              </Label>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  开始时间
                </Label>
                <Input
                  type="time"
                  value={systemConfig.defaultSourceConfig.workingHours.startTime}
                  onChange={(e) =>
                    handleDefaultSourceConfigChange("workingHours", {
                      ...systemConfig.defaultSourceConfig.workingHours,
                      startTime: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!systemConfig.defaultSourceConfig.workingHours.enabled}
                />
              </Field>

              <Field>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  结束时间
                </Label>
                <Input
                  type="time"
                  value={systemConfig.defaultSourceConfig.workingHours.endTime}
                  onChange={(e) =>
                    handleDefaultSourceConfigChange("workingHours", {
                      ...systemConfig.defaultSourceConfig.workingHours,
                      endTime: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!systemConfig.defaultSourceConfig.workingHours.enabled}
                />
              </Field>
            </div>

            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                工作日
              </Label>
              <div className="flex flex-wrap gap-2">
                {["周日", "周一", "周二", "周三", "周四", "周五", "周六"].map(
                  (day, index) => (
                    <Field key={index} className="flex items-center">
                      <Switch
                        checked={systemConfig.defaultSourceConfig.workingHours.workDays.includes(index)}
                        onChange={(checked) => {
                          const newWorkDays = checked
                            ? [...systemConfig.defaultSourceConfig.workingHours.workDays, index]
                            : systemConfig.defaultSourceConfig.workingHours.workDays.filter(
                                (d) => d !== index
                              );
                          handleDefaultSourceConfigChange("workingHours", {
                            ...systemConfig.defaultSourceConfig.workingHours,
                            workDays: newWorkDays
                          });
                        }}
                        disabled={!systemConfig.defaultSourceConfig.workingHours.enabled}
                        className="group relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[checked]:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-4" />
                      </Switch>
                      <Label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {day}
                      </Label>
                    </Field>
                  )
                )}
              </div>
            </Field>
          </div>
        </section>

        {/* 默认自动回复设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              默认自动回复设置
            </h2>
          </div>
          <div className="space-y-4">
            <Field className="flex items-center gap-3">
              <Switch
                checked={systemConfig.defaultSourceConfig.autoReply.enabled}
                onChange={(checked) =>
                  handleDefaultSourceConfigChange("autoReply", {
                    ...systemConfig.defaultSourceConfig.autoReply,
                    enabled: checked
                  })
                }
                className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[checked]:bg-blue-600"
              >
                <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5" />
              </Switch>
              <Label className="text-sm text-gray-700 dark:text-gray-300">
                启用自动回复
              </Label>
            </Field>

            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                延迟时间（秒）
              </Label>
              <Input
                type="number"
                min="0"
                value={systemConfig.defaultSourceConfig.autoReply.delay}
                onChange={(e) =>
                  handleDefaultSourceConfigChange("autoReply", {
                    ...systemConfig.defaultSourceConfig.autoReply,
                    delay: parseInt(e.target.value)
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!systemConfig.defaultSourceConfig.autoReply.enabled}
              />
            </Field>

            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                自动回复消息
              </Label>
              <Textarea
                value={systemConfig.defaultSourceConfig.autoReply.message}
                onChange={(e) =>
                  handleDefaultSourceConfigChange("autoReply", {
                    ...systemConfig.defaultSourceConfig.autoReply,
                    message: e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                rows={3}
                disabled={!systemConfig.defaultSourceConfig.autoReply.enabled}
              />
            </Field>

            {/* 默认客服分配设置 */}
            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                分配方式
              </Label>
              <div className="relative">
                <Select
                  value={systemConfig.defaultSourceConfig.agentAssignment.method}
                  onChange={(value) =>
                    handleDefaultSourceConfigChange("agentAssignment", {
                      ...systemConfig.defaultSourceConfig.agentAssignment,
                      method: value as "round-robin" | "least-busy" | "manual"
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 appearance-none pr-10"
                >
                  <option value="round-robin">轮询分配</option>
                  <option value="least-busy">最少忙碌</option>
                  <option value="manual">手动分配</option>
                </Select>
                <ChevronDownIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                超时时间（秒）
              </Label>
              <Input
                type="number"
                min="0"
                value={systemConfig.defaultSourceConfig.agentAssignment.timeout}
                onChange={(e) =>
                  handleDefaultSourceConfigChange("agentAssignment", {
                    ...systemConfig.defaultSourceConfig.agentAssignment,
                    timeout: parseInt(e.target.value)
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
              />
            </Field>

            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                备用客服ID
              </Label>
              <Input
                type="number"
                min="0"
                value={systemConfig.defaultSourceConfig.agentAssignment.fallbackAgentId || ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? null : parseInt(e.target.value);
                  handleDefaultSourceConfigChange("agentAssignment", {
                    ...systemConfig.defaultSourceConfig.agentAssignment,
                    fallbackAgentId: value
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
                placeholder="可选"
              />
            </Field>

            {/* 默认界面设置 */}
            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                主题颜色
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={systemConfig.defaultSourceConfig.ui.primaryColor}
                  onChange={(e) =>
                    handleDefaultSourceConfigChange("ui", {
                      ...systemConfig.defaultSourceConfig.ui,
                      primaryColor: e.target.value
                    })
                  }
                  className="h-10 w-10 border-0 p-0 data-[focus]:ring-2 data-[focus]:ring-blue-500"
                />
                <Input
                  type="text"
                  value={systemConfig.defaultSourceConfig.ui.primaryColor}
                  onChange={(e) =>
                    handleDefaultSourceConfigChange("ui", {
                      ...systemConfig.defaultSourceConfig.ui,
                      primaryColor: e.target.value
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  placeholder="#RRGGBB"
                />
              </div>
            </Field>

            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo URL
              </Label>
              <Input
                type="url"
                value={systemConfig.defaultSourceConfig.ui.logoUrl}
                onChange={(e) =>
                  handleDefaultSourceConfigChange("ui", {
                    ...systemConfig.defaultSourceConfig.ui,
                    logoUrl: e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </Field>

            <Fieldset>
              <Legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                聊天气泡位置
              </Legend>
              <RadioGroup
                value={systemConfig.defaultSourceConfig.ui.chatBubblePosition}
                onChange={(value) =>
                  handleDefaultSourceConfigChange("ui", {
                    ...systemConfig.defaultSourceConfig.ui,
                    chatBubblePosition: value
                  })
                }
                className="flex gap-4"
              >
                <Field className="flex items-center">
                  <Radio
                    value="left"
                    className="group flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white data-[checked]:bg-blue-600 data-[focus]:outline-none data-[focus]:ring-2 data-[focus]:ring-blue-500 data-[focus]:ring-offset-2"
                  >
                    <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
                  </Radio>
                  <Label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    左侧
                  </Label>
                </Field>
                <Field className="flex items-center">
                  <Radio
                    value="right"
                    className="group flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white data-[checked]:bg-blue-600 data-[focus]:outline-none data-[focus]:ring-2 data-[focus]:ring-blue-500 data-[focus]:ring-offset-2"
                  >
                    <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
                  </Radio>
                  <Label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    右侧
                  </Label>
                </Field>
              </RadioGroup>
            </Fieldset>
          </div>
        </section>

        {/* 预留配置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <PaintBrushIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              预留配置
            </h2>
          </div>
          <div className="space-y-4">
            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                预留字段1
              </Label>
              <Input
                type="text"
                value={systemConfig.reserved1 || ""}
                onChange={(e) =>
                  handleSystemConfigChange("reserved1", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
                placeholder="预留字段1"
              />
            </Field>
            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                预留字段2
              </Label>
              <Textarea
                value={systemConfig.reserved2 || ""}
                onChange={(e) =>
                  handleSystemConfigChange("reserved2", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
                placeholder="预留字段2"
              />
            </Field>
          </div>
        </section>

        {/* 提交按钮 */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition data-[hover]:bg-blue-600 data-[focus]:ring-2 data-[focus]:ring-blue-500 data-[disabled]:opacity-50"
          >
            {isSaving ? (
              <>
                <CogIcon className="h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <ScaleIcon className="h-4 w-4" />
                保存系统配置
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
