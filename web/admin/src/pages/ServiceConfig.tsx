import React, { useState, useEffect } from "react";
import type { CustomerServiceConfig } from "../types/config";
import { appReady, isMicroApp } from "@dootask/tools";
import { createBot, getBotList, createProject, createTask, getTaskDialog, sendMessage, generateMentionMessage } from "../utils/api";
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
} from "@heroicons/react/20/solid";

export const ServiceConfig: React.FC = () => {
  // 默认配置
  const defaultConfig: CustomerServiceConfig = {
    serviceName: "客服中心",
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
    reserved1: "",
    reserved2: "",
  };

  // 状态管理
  const [config, setConfig] = useState<CustomerServiceConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isRunInMicroApp, setIsRunInMicroApp] = useState<boolean>(isMicroApp());
  const [userBots, setUserBots] = useState<UserBot[]>([]);
  const [selectedUserBot, setSelectedUserBot] = useState<UserBot | null>(null);

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
    createProject({
      name: "智慧客服",
      flow: false,
    }).then((response) => {
      const projectId = response.data.id;
      console.log(`项目ID: ${projectId}`);
    }).catch((error) => {
      console.error("创建项目失败:", error.message);
    });
  }

  const onCreateTask = () => {
    if (!isRunInMicroApp) {
      return;
    }
    if (!selectedUserBot) {
      console.error("请先选择一个机器人");
      return;
    }

    createTask({
      project_id: 15,
      name: "智能客服任务1",
      content: "kefu 1"
    }).then((response) => {
      const taskID = response.data.id; // 使用 const 或 let 声明 taskID
      console.log(`任务ID: ${taskID}`);

      // 创建任务成功后，获取任务对话并发送消息
      getTaskDialog(taskID).then((response) => {
        const dialogID = response.data.dialog_id; // 使用 const 或 let 声明 dialogID
        console.log(`任务对话: ${dialogID}`);
        sendMessage({
          dialog_id: dialogID,
          text: generateMentionMessage(selectedUserBot.id, "智慧客服", "初始化"),
        }).then((response) => {
          console.log("发送消息成功", response);
        }).catch((error) => {
          console.error("发送消息失败:", error.message);
        });
      }).catch((error) => {
        console.error("获取任务对话失败:", error.message);
      });

    }).catch((error) => {
      console.error("创建任务失败:", error.message);
    });
  }

  // 模拟从API加载配置
  useEffect(() => {
    if (isMicroApp()) {
      console.log("当前是微应用");
      setIsRunInMicroApp(true);
    }
    // 在实际应用中，这里应该调用API获取配置
    const loadConfig = async () => {
      try {
        // 模拟API调用延迟
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 这里应该是API返回的数据
        // 暂时使用默认配置
        setConfig(defaultConfig);
        setIsLoading(false);
      } catch (error) {
        console.error("加载配置失败:", error);
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 这里应该是保存配置的API调用
      console.log("保存配置:", config);

      setSaveMessage({
        type: "success",
        text: "配置已成功保存！",
      });
    } catch (error) {
      console.error("保存配置失败:", error);
      setSaveMessage({
        type: "error",
        text: "保存配置失败，请重试。",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 处理基本字段变化
  const handleBasicChange = (
    field: keyof CustomerServiceConfig,
    value: string
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 处理嵌套对象字段变化
  const handleNestedChange = (
    section: keyof CustomerServiceConfig,
    field: string,
    value: any
  ) => {
    setConfig((prev) => {
      const sectionData = prev[section];
      if (typeof sectionData === "object" && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value,
          },
        };
      }
      return prev;
    });
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 机器人配置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BoltIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              机器人配置
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button
                type="button"
                onClick={() => {
                  console.log("选择机器人");
                  onGetUserBotList();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition data-[hover]:bg-blue-600 data-[focus]:ring-2 data-[focus]:ring-blue-500"
              >
                <SparklesIcon className="h-4 w-4" />
                选择机器人
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
                onClick={() => {
                  console.log("创建机器人");
                  onCreateUserBot();
                }}
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
            <div className="flex flex-wrap gap-4">
              <Button
                type="button"
                onClick={() => {
                  console.log("选择机器人");
                  onCreateProject()
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition data-[hover]:bg-blue-600 data-[focus]:ring-2 focus:ring-blue-500"
              >
                <SparklesIcon className="h-4 w-4" />
                创建项目
              </Button>

              <Button
                type="button"
                onClick={() => {
                  console.log("创建机器人");
                  onCreateTask();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition data-[hover]:bg-green-600 data-[focus]:ring-2 data-[focus]:ring-green-500"
              >
                <BoltIcon className="h-4 w-4" />
                增加站点
              </Button>
            </div>
          </div>
        </section>
        {/* 基本设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CogIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              基本设置
            </h2>
          </div>
          <div className="space-y-4">
            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                服务名称
              </Label>
              <Input
                type="text"
                value={config.serviceName}
                onChange={(e) =>
                  handleBasicChange("serviceName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
                required
              />
            </Field>

            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                欢迎消息
              </Label>
              <Textarea
                value={config.welcomeMessage}
                onChange={(e) =>
                  handleBasicChange("welcomeMessage", e.target.value)
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
                value={config.offlineMessage}
                onChange={(e) =>
                  handleBasicChange("offlineMessage", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 resize-none"
                rows={3}
                required
              />
            </Field>
          </div>
        </section>

        {/* 工作时间设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              工作时间设置
            </h2>
          </div>
          <div className="space-y-4">
            <Field className="flex items-center gap-3">
              <Switch
                checked={config.workingHours.enabled}
                onChange={(checked) =>
                  handleNestedChange("workingHours", "enabled", checked)
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
                  value={config.workingHours.startTime}
                  onChange={(e) =>
                    handleNestedChange(
                      "workingHours",
                      "startTime",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!config.workingHours.enabled}
                />
              </Field>

              <Field>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  结束时间
                </Label>
                <Input
                  type="time"
                  value={config.workingHours.endTime}
                  onChange={(e) =>
                    handleNestedChange(
                      "workingHours",
                      "endTime",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!config.workingHours.enabled}
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
                        checked={config.workingHours.workDays.includes(index)}
                        onChange={(checked) => {
                          const newWorkDays = checked
                            ? [...config.workingHours.workDays, index]
                            : config.workingHours.workDays.filter(
                                (d) => d !== index
                              );
                          handleNestedChange(
                            "workingHours",
                            "workDays",
                            newWorkDays
                          );
                        }}
                        disabled={!config.workingHours.enabled}
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

        {/* 自动回复设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              自动回复设置
            </h2>
          </div>
          <div className="space-y-4">
            <Field className="flex items-center gap-3">
              <Switch
                checked={config.autoReply.enabled}
                onChange={(checked) =>
                  handleNestedChange("autoReply", "enabled", checked)
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
                value={config.autoReply.delay}
                onChange={(e) =>
                  handleNestedChange(
                    "autoReply",
                    "delay",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!config.autoReply.enabled}
              />
            </Field>

            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                自动回复消息
              </Label>
              <Textarea
                value={config.autoReply.message}
                onChange={(e) =>
                  handleNestedChange("autoReply", "message", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                rows={3}
                disabled={!config.autoReply.enabled}
              />
            </Field>
          </div>
        </section>

        {/* 客服分配设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <UserGroupIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              客服分配设置
            </h2>
          </div>
          <div className="space-y-4">
            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                分配方式
              </Label>
              <div className="relative">
                <Select
                  value={config.agentAssignment.method}
                  onChange={(value) =>
                    handleNestedChange(
                      "agentAssignment",
                      "method",
                      value as unknown as
                        | "round-robin"
                        | "least-busy"
                        | "manual"
                    )
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
                value={config.agentAssignment.timeout}
                onChange={(e) =>
                  handleNestedChange(
                    "agentAssignment",
                    "timeout",
                    parseInt(e.target.value)
                  )
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
                value={config.agentAssignment.fallbackAgentId || ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : parseInt(e.target.value);
                  handleNestedChange(
                    "agentAssignment",
                    "fallbackAgentId",
                    value
                  );
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
                placeholder="可选"
              />
            </Field>
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
                value={config.reserved1 || ""}
                onChange={(e) =>
                  setConfig({ ...config, reserved1: e.target.value })
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
                value={config.reserved2 || ""}
                onChange={(e) =>
                  setConfig({ ...config, reserved2: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white data-[focus]:ring-2 data-[focus]:ring-blue-500"
                placeholder="预留字段2"
              />
            </Field>
          </div>
        </section>

        {/* 界面设置 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <PaintBrushIcon className="h-6 w-6 text-pink-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              界面设置
            </h2>
          </div>
          <div className="space-y-4">
            <Field>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                主题颜色
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={config.ui.primaryColor}
                  onChange={(e) =>
                    handleNestedChange("ui", "primaryColor", e.target.value)
                  }
                  className="h-10 w-10 border-0 p-0 data-[focus]:ring-2 data-[focus]:ring-blue-500"
                />
                <Input
                  type="text"
                  value={config.ui.primaryColor}
                  onChange={(e) =>
                    handleNestedChange("ui", "primaryColor", e.target.value)
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
                value={config.ui.logoUrl}
                onChange={(e) =>
                  handleNestedChange("ui", "logoUrl", e.target.value)
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
                value={config.ui.chatBubblePosition}
                onChange={(value) =>
                  handleNestedChange("ui", "chatBubblePosition", value)
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
                保存配置
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
