// WebSocket service for handling real-time communication
import { v4 as uuidv4 } from 'uuid';

const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL;
const WEBSOCKET_URL = `${wsBaseUrl || 'ws://localhost:8888'}/api/v1/chat/ws`;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageListeners: Array<(event: MessageEvent) => void> = [];
  private openListeners: Array<() => void> = [];
  private closeListeners: Array<(event: CloseEvent) => void> = [];
  private errorListeners: Array<(event: Event) => void> = [];

  public connect(token: string): void {
    if (this.socket) {
      if (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket is already connecting or connected.');
        return;
      } else if (this.socket.readyState === WebSocket.CLOSING || this.socket.readyState === WebSocket.CLOSED) {
        console.log('WebSocket is in a closing or closed state, attempting to close and reconnect.');
        this.socket.close(); // Ensure the old socket is properly closed
      }
    }
    const conv_uuid = uuidv4();
    // Append agentId as a query parameter
    const url = `${WEBSOCKET_URL}?conv_uuid=${conv_uuid}&client_type=agent&token=${token}`;
    // const url = `${WEBSOCKET_URL}?conv_uuid=3fa8f191-9523-4f97-817c-d821fa5abb45&client_type=customer`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.openListeners.forEach(listener => listener());
    };

    this.socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data, this.messageListeners.length);
      this.messageListeners.forEach(listener => listener(event));
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      this.closeListeners.forEach(listener => listener(event));
      // Optionally, implement reconnection logic here
    };

    this.socket.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.errorListeners.forEach(listener => listener(event));
    };
  }

  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  public close(): void {
    if (this.socket) {
      // TODO: 解决链接被关闭的问题
      console.log('关闭WS，Closing WebSocket connection');
      this.socket.close();
    }
  }

  public addMessageListener(listener: (event: MessageEvent) => void): void {
    console.log('添加WS监听，Adding WebSocket message listener', this.messageListeners.length);
    this.messageListeners.push(listener);
    console.log('添加WS监听 zhh，Adding WebSocket message listener', this.messageListeners.length);
  }

  public removeMessageListener(listener: (event: MessageEvent) => void): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  public addOpenListener(listener: () => void): void {
    this.openListeners.push(listener);
  }

  public removeOpenListener(listener: () => void): void {
    this.openListeners = this.openListeners.filter(l => l !== listener);
  }

  public addCloseListener(listener: (event: CloseEvent) => void): void {
    this.closeListeners.push(listener);
  }

  public removeCloseListener(listener: (event: CloseEvent) => void): void {
    this.closeListeners = this.closeListeners.filter(l => l !== listener);
  }

  public addErrorListener(listener: (event: Event) => void): void {
    this.errorListeners.push(listener);
  }

  public removeErrorListener(listener: (event: Event) => void): void {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  public getReadyState(): number | null {
    return this.socket ? this.socket.readyState : null;
  }
}

export const webSocketService = new WebSocketService();