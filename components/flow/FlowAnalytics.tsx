"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';

interface FlowAnalyticsProps {
  projectId: string;
  flowId?: string;
  version?: number;
}

interface AnalyticsData {
  totalResponses: number;
  completionRate: number;
  averageTime: number;
  nodeStats: Record<string, {
    views: number;
    selections: Record<string, number>;
  }>;
  weightStats: Record<string, number>;
  pathStats: Record<string, number>;
  userStats: Array<{
    userId?: string;
    startTime: number;
    endTime: number;
    duration: number;
    responses: Record<string, string[]>;
    score?: number;
  }>;
}

interface Flow {
  id: string;
  name: string;
  version: number;
  nodes: any[];
  isPublished: boolean;
}

const defaultAnalytics: AnalyticsData = {
  totalResponses: 0,
  completionRate: 0,
  averageTime: 0,
  nodeStats: {},
  weightStats: {},
  pathStats: {},
  userStats: [],
};

export function FlowAnalytics({ projectId, flowId: initialFlowId, version }: FlowAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | undefined>(initialFlowId);
  const [flowData, setFlowData] = useState<any>(null);

  useEffect(() => {
    async function fetchFlows() {
      try {
        const response = await fetch(`/api/public/projects/${projectId}/flows`);
        if (!response.ok) throw new Error('Failed to fetch flows');
        const data = await response.json();
        setFlows(data.flows?.filter((f: Flow) => f.isPublished) || []);
      } catch (error) {
        console.error('Error fetching flows:', error);
        setError('Failed to load flows');
      }
    }

    fetchFlows();
  }, [projectId]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        let analyticsUrl = `/api/public/projects/${projectId}/analytics`;
        if (selectedFlowId) {
          analyticsUrl = `/api/public/projects/${projectId}/flows/${selectedFlowId}/responses?version=${version}`;
        }

        const [analyticsResponse, flowResponse] = await Promise.all([
          fetch(analyticsUrl),
          selectedFlowId ? fetch(`/api/public/projects/${projectId}/flows/${selectedFlowId}`) : null
        ]);

        if (!analyticsResponse.ok || (flowResponse && !flowResponse.ok)) {
          throw new Error('Failed to fetch analytics data');
        }

        const [analyticsData, flowData] = await Promise.all([
          analyticsResponse.json(),
          flowResponse ? flowResponse.json() : null
        ]);

        const newAnalytics = analyticsData.analytics || defaultAnalytics;
        setAnalytics({
          ...defaultAnalytics,
          ...newAnalytics,
          userStats: newAnalytics.userStats || [],
        });
        
        if (flowData?.flow) {
          setFlowData(flowData.flow);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics');
        setAnalytics(defaultAnalytics);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [projectId, selectedFlowId, version]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const userStats = analytics?.userStats || [];
  const averageScore = userStats.length > 0
    ? Math.round(userStats.reduce((acc, user) => acc + (user.score || 0), 0) / userStats.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Flow Selector */}
      {flows.length > 0 && (
        <div className="flex items-center gap-4">
          <Select
            value={selectedFlowId || "all"}
            onValueChange={(value) => setSelectedFlowId(value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a flow to view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flows</SelectItem>
              {flows.map((flow) => (
                <SelectItem key={flow.id} value={flow.id}>
                  {flow.name} (v{flow.version})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalResponses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total submissions received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((analytics?.completionRate || 0) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Users who completed the flow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((analytics?.averageTime || 0) / 60)} min
            </div>
            <p className="text-xs text-muted-foreground">
              Average completion time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
            <p className="text-xs text-muted-foreground">
              Average user score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Response Distribution */}
      {Object.keys(analytics?.nodeStats || {}).length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Response Distribution</CardTitle>
            <CardDescription>
              How users responded to each question
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-8">
                {Object.entries(analytics?.nodeStats || {}).map(([nodeId, stats]) => {
                  const node = flowData?.nodes?.find((n: any) => n.id === nodeId);
                  if (!node) return null;

                  const totalResponses = Object.values(stats.selections).reduce((a: any, b: any) => a + b, 0);

                  // Sort options by percentage in descending order
                  const sortedOptions = Object.entries(stats.selections)
                    .map(([optionId, count]) => {
                      let label = optionId;
                      if (node.data?.options) {
                        const option = node.data.options.find((o: any) => o.id === optionId);
                        if (option) label = option.label;
                      } else if (optionId === 'yes') {
                        label = node.data?.yesLabel || 'Yes';
                      } else if (optionId === 'no') {
                        label = node.data?.noLabel || 'No';
                      }

                      const percentage = Math.round((count / totalResponses) * 100);
                      return { optionId, label, count, percentage };
                    })
                    .sort((a, b) => b.percentage - a.percentage);

                  return (
                    <div key={nodeId} className="space-y-2">
                      <h4 className="font-medium">{node.data?.title || node.data?.content}</h4>
                      <div className="space-y-1">
                        {sortedOptions.map(({ optionId, label, percentage }) => (
                          <div key={optionId} className="flex items-center gap-2">
                            <div className="w-32 truncate text-sm text-muted-foreground">
                              {label}
                            </div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="w-12 text-sm text-muted-foreground text-right">
                              {percentage}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <p>No response data available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 