export interface APITestRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body: string;
}

export interface APIUsageStats {
  totalRequests: number;
  uniqueUsers: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface APILog {
  id: string;
  action: string;
  createdAt: string;
  metadata: {
    endpoint?: string;
    statusCode?: number;
    duration?: number;
  };
}

export interface AccessLog {
  id: string;
  accessedAt: string;
  user?: {
    name: string | null;
    email: string | null;
  };
} 