export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  apiKey?: string;
  apiKeyLastRegen?: Date;
  rateLimit: number;
  apiEnabled: boolean;
  category?: string;
  tags: string[];
  flows: Flow[];
}

export interface Flow {
  id: string;
  name: string;
  content: string;
  onePageMode: boolean;
  isPublished: boolean;
  version: number;
  color: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIUsage {
  id: string;
  projectId: string;
  endpoint: string;
  method: string;
  status: number;
  timestamp: Date;
}

export interface ProjectFilters {
  search?: string;
  category?: string;
  tags?: string[];
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface ProjectStatistics {
  totalFlows: number;
  apiCalls: number;
  lastAccessed?: Date;
}
