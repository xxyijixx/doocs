export interface CustomerServiceConfig {
  // 基本设置
  serviceName: string;
  welcomeMessage: string;
  offlineMessage: string;
  
  // DooTask集成设置
  dooTaskIntegration: {
    botId: number | null;
    projectId: number | null;
    taskId: number | null;
    dialogId: number | null;
  };
  
  // 工作时间设置
  workingHours: {
    enabled: boolean;
    startTime: string; // 格式: "HH:MM"
    endTime: string; // 格式: "HH:MM"
    workDays: number[]; // 0-6, 0表示周日
  };
  
  // 自动回复设置
  autoReply: {
    enabled: boolean;
    delay: number; // 延迟时间（秒）
    message: string;
  };
  
  // 客服分配设置
  agentAssignment: {
    method: 'round-robin' | 'least-busy' | 'manual';
    timeout: number; // 超时时间（秒）
    fallbackAgentId: number | null;
  };
  
  // 界面设置
  ui: {
    primaryColor: string; // 十六进制颜色代码
    logoUrl: string;
    chatBubblePosition: 'left' | 'right';
  };

  reserved1: string;
  reserved2: string;
  
}