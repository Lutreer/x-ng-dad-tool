export interface EventSourceUtilOptions<T> {
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query?: any;
  onMessage: (data: T) => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  onReconnectStart?: () => void;
  onReconnectSuccess?: () => void;
  onReconnectFailure?: () => void;
  eventTypes?: string[];
  onOpen?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class EventSourceUtil<MessageModel = any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static CONNECTIONS: Map<string, EventSourceUtil<any>> = new Map();
  private static DEFAULT_OPTIONS = {
    onError: (error: Event) => console.error('EventSource error:', error),
    reconnectInterval: 5000,
    // reconnectAttempts: 30,
    reconnectAttempts: 5,
    onReconnectStart: () => {},
    onReconnectSuccess: () => {},
    onReconnectFailure: () => {},
    eventTypes: [],
    onOpen: () => {},
  };

  eventSource: EventSource | null = null;
  private url: string;
  private onMessage: (data: MessageModel) => void;
  private onError: (error: Event) => void;
  private reconnectInterval: number;
  private reconnectAttempts: number;
  private currentAttempt: number = 0;
  private reconnectTimer: any | null = null;
  private onReconnectStart: () => void;
  private onReconnectSuccess: () => void;
  private onReconnectFailure: () => void;
  private eventTypes: string[];
  private onOpen: () => void;

  constructor(options: EventSourceUtilOptions<MessageModel>) {
    const {
      url,
      query,
      onMessage,
      onError = EventSourceUtil.DEFAULT_OPTIONS.onError,
      reconnectInterval = EventSourceUtil.DEFAULT_OPTIONS.reconnectInterval,
      reconnectAttempts = EventSourceUtil.DEFAULT_OPTIONS.reconnectAttempts,
      onReconnectStart = EventSourceUtil.DEFAULT_OPTIONS.onReconnectStart,
      onReconnectSuccess = EventSourceUtil.DEFAULT_OPTIONS.onReconnectSuccess,
      onReconnectFailure = EventSourceUtil.DEFAULT_OPTIONS.onReconnectFailure,
      eventTypes = EventSourceUtil.DEFAULT_OPTIONS.eventTypes,
      onOpen = EventSourceUtil.DEFAULT_OPTIONS.onOpen,
    } = options;

    this.url = url;
    this.onMessage = onMessage;
    this.onError = onError;
    this.reconnectInterval = reconnectInterval;
    this.reconnectAttempts = reconnectAttempts;
    this.onReconnectStart = onReconnectStart;
    this.onReconnectSuccess = onReconnectSuccess;
    this.onReconnectFailure = onReconnectFailure;
    this.eventTypes = eventTypes;
    this.onOpen = onOpen;

    this.connect();
  }

  private preventDupConnect() {
    const connection = EventSourceUtil.CONNECTIONS.get(this.url);
    if (connection) {
      connection?.close();
      EventSourceUtil.CONNECTIONS.delete(this.url);
    }
    EventSourceUtil.CONNECTIONS.set(this.url, this);
  }

  // SSE 连接
  private connect() {
    try {
      this.preventDupConnect();
      this.eventSource = new EventSource(this.url);
      this.eventSource.onmessage = (event) => {
        if (this.isValidEventType(event.type)) {
          try {
            this.onMessage(
              JSON.parse(event.data.replaceAll('NaN', 'null'), (_key, value) => {
                return value === 'NaN' ? null : value;
              }) as MessageModel,
            );
          } catch (error) {
            console.log(error);
          }
        }
      };

      this.eventSource.onopen = () => {
        this.onOpen();
        if (this.currentAttempt > 0) {
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
          }
          this.onReconnectSuccess();
          this.currentAttempt = 0;
        }
      };

      this.eventSource.onerror = (error) => {
        this.onError(error);
        this.handleReconnect();
      };
    } catch (error) {
      this.onError(error as unknown as Event);
      this.handleReconnect();
    }
  }

  // 重连
  private handleReconnect() {
    if (this.currentAttempt < this.reconnectAttempts) {
      this.onReconnectStart();
      this.currentAttempt++;
      // 动态间隔
      const adjustedInterval = this.reconnectInterval * this.currentAttempt;
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, adjustedInterval);
    } else {
      this.onReconnectFailure();
    }
  }

  // 过滤事件
  private isValidEventType(eventType: string): boolean {
    return this.eventTypes.length === 0 || this.eventTypes.includes(eventType);
  }

  // 关闭 SSE 连接
  public close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.eventSource) {
      console.log('sse is closed');
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
