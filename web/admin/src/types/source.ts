/**
 * 客服来源相关类型定义
 */

// 客服来源配置
export interface CustomerServiceSource {
  id?: number;
  source_key: string; // 后端生成的来源标识key
  name: string; // 来源名称
  project_id: number | null; // 对应的项目ID
  task_id: number | null; // 对应的任务ID
  dialog_id: number | null; // 对应的对话ID
  
  // 来源特定的配置（从系统配置继承默认值）
  welcome_message: string;
  offline_message: string;
  
  working_hours: {
    enabled: boolean;
    start_time: string; // 格式: "HH:MM"
    end_time: string; // 格式: "HH:MM"
    work_days: number[]; // 0-6, 0表示周日
  };
  
  auto_reply: {
    enabled: boolean;
    delay: number; // 延迟时间（秒）
    message: string;
  };
  
  agent_assignment: {
    method: 'round-robin' | 'least-busy' | 'manual';
    timeout: number; // 超时时间（秒）
    fallback_agent_id: number | null;
  };
  
  ui: {
    primary_color: string; // 十六进制颜色代码
    logo_url: string;
    chat_bubble_position: 'left' | 'right';
  };
  
  createdAt?: string;
  updatedAt?: string;
}

// 系统配置（机器人和聊天配置）
export interface SystemConfig {
  // 基本设置
  service_name: string;
  
  // DooTask集成设置
  dootask_integration: {
    bot_id: number | null;
    project_id: number | null;
  };
  
  // 默认配置值（用于新来源的默认值）
  default_source_config: {
    welcome_message: string;
    offline_message: string;
    
    working_hours: {
      enabled: boolean;
      start_time: string;
      end_time: string;
      work_days: number[];
    };
    
    auto_reply: {
      enabled: boolean;
      delay: number;
      message: string;
    };
    
    agent_assignment: {
      method: 'round-robin' | 'least-busy' | 'manual';
      timeout: number;
      fallback_agent_id: number | null;
    };
    
    ui: {
      primary_color: string;
      logo_url: string;
      chat_bubble_position: 'left' | 'right';
    };
  };
}

// 创建来源请求参数
export interface CreateSourceRequest {
  name: string;
  task_id: number;
  dialog_id: number;
  project_id: number;
  column_id: number;
  bot_id: number;
}

// 创建来源响应
export interface CreateSourceResponse {
  id: number;
  source_key: string;
  name: string;
  task_id: number;
  dialog_id: number;
  project_id: number;
  columnId: number;
}