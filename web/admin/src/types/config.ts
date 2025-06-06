// 系统配置接口（机器人和聊天配置）
export interface SystemConfig {
  // 基本设置
  serviceName: string;

  // DooTask集成设置
  dooTaskIntegration: {
    botId: number | null;
    botToken: string;
    projectId: number | null;
    createTask: boolean;
  };

  // 默认配置值（用于新来源的默认值）
  defaultSourceConfig: {
    welcomeMessage: string;
    offlineMessage: string;

    workingHours: {
      enabled: boolean;
      startTime: string; // 格式: "HH:MM"
      endTime: string; // 格式: "HH:MM"
      workDays: number[]; // 0-6, 0表示周日
    };

    autoReply: {
      enabled: boolean;
      delay: number; // 延迟时间（秒）
      message: string;
    };

    agentAssignment: {
      method: "round-robin" | "least-busy" | "manual";
      timeout: number; // 超时时间（秒）
      fallbackAgentId: number | null;
    };

    ui: {
      primaryColor: string; // 十六进制颜色代码
      logoUrl: string;
      chatBubblePosition: "left" | "right";
    };
  };

  reserved1: string;
  reserved2: string;
}

// 保持向后兼容的别名
export type CustomerServiceConfig = SystemConfig;
