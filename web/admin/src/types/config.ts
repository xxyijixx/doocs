// 系统配置接口（机器人和聊天配置）
export interface SystemConfig {
  // 基本设置
  service_name: string;

  // DooTask集成设置
  dootask_integration: {
    bot_id: number | null;
    bot_token: string;
    project_id: number | null;
    create_task: boolean;
  };

  // 默认配置值（用于新来源的默认值）
  default_source_config: {
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
      method: "round-robin" | "least-busy" | "manual";
      timeout: number; // 超时时间（秒）
      fallback_agent_id: number | null;
    };

    ui: {
      primary_color: string; // 十六进制颜色代码
      logo_url: string;
      chat_bubble_position: "left" | "right";
    };
  };

  reserved1: string;
  reserved2: string;
}

export interface DooTaskChatConfig {
  chat_key: string;
}

// 添加获取服务器配置的API
export interface ServerConfig {
  base_url: string;
  [key: string]: any; // 允许扩展其他配置项
}

// 保持向后兼容的别名
export type CustomerServiceConfig = SystemConfig;
