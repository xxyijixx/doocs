/**
 * 客服来源相关类型定义
 */

// 客服来源配置
export interface CustomerServiceSource {
  id?: number;
  sourceKey: string; // 后端生成的来源标识key
  name: string; // 来源名称
  projectId: number | null; // 对应的项目ID
  taskId: number | null; // 对应的任务ID
  dialogId: number | null; // 对应的对话ID
  
  // 来源特定的配置（从系统配置继承默认值）
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
    method: 'round-robin' | 'least-busy' | 'manual';
    timeout: number; // 超时时间（秒）
    fallbackAgentId: number | null;
  };
  
  ui: {
    primaryColor: string; // 十六进制颜色代码
    logoUrl: string;
    chatBubblePosition: 'left' | 'right';
  };
  
  createdAt?: string;
  updatedAt?: string;
}

// 系统配置（机器人和聊天配置）
export interface SystemConfig {
  // 基本设置
  serviceName: string;
  
  // DooTask集成设置
  dooTaskIntegration: {
    botId: number | null;
    projectId: number | null;
  };
  
  // 默认配置值（用于新来源的默认值）
  defaultSourceConfig: {
    welcomeMessage: string;
    offlineMessage: string;
    
    workingHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      workDays: number[];
    };
    
    autoReply: {
      enabled: boolean;
      delay: number;
      message: string;
    };
    
    agentAssignment: {
      method: 'round-robin' | 'least-busy' | 'manual';
      timeout: number;
      fallbackAgentId: number | null;
    };
    
    ui: {
      primaryColor: string;
      logoUrl: string;
      chatBubblePosition: 'left' | 'right';
    };
  };
}

// 创建来源请求参数
export interface CreateSourceRequest {
  name: string;
  taskId: number;
  dialogId: number;
  projectId: number;
  botId: number;
}

// 创建来源响应
export interface CreateSourceResponse {
  id: number;
  sourceKey: string;
  name: string;
  taskId: number;
  dialogId: number;
  projetId: number;
}