export interface Conversation {
  id: number;
  uuid: string;
  agent_id: number;
  customer_id: number;
  title: string;
  status: 'open' | 'closed';
  source: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Message {
  id: number;
  conversation_uuid: string;
  content: string;
  sender: 'agent' | 'customer';
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationData<T> {
  total: number;
  page: number;
  page_size: number;
  pages: number;
  items: T[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface SendMessageRequest {
  uuid: string;
  content: string;
  sender: 'agent' | 'customer';
  type?: 'text' | 'image' | 'file' | 'system';
  metadata?: string;
} 