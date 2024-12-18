import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

interface FlowAnalyticsProps {
  projectId: string;
  flowId: string;
  version?: number;
}

export function FlowAnalytics({ projectId, flowId, version }: FlowAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/public/projects/${projectId}/flows/${flowId}/responses${version ? `?version=${version}` : ''}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalytics(data.analytics);
        setResponses(data.responses);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [projectId, flowId, version]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  // Prepare data for charts
  const responsesByDay = responses.reduce((acc: any, response: any) => {
    const date = new Date(response.startedAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const responseData = Object.entries(responsesByDay).map(([date, count]) => ({
    date,
    responses: count,
  }));

  const completionData = Object.entries(analytics.nodeStats).map(([nodeId, stats]: [string, any]) => ({
    node: nodeId,
    views: stats.views,
    completions: Object.values(stats.selections).reduce((a: number, b: number) => a + b, 0),
  }));

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="responses">Responses</TabsTrigger>
        <TabsTrigger value="paths">Paths</TabsTrigger>
        <TabsTrigger value="weights">Weights</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-medium text-muted-foreground mb-2">Total Responses</h3>
            <p className="text-2xl font-bold">{analytics.totalResponses}</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium text-muted-foreground mb-2">Completion Rate</h3>
            <p className="text-2xl font-bold">
              {Math.round(analytics.completionRate * 100)}%
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium text-muted-foreground mb-2">Avg. Time</h3>
            <p className="text-2xl font-bold">
              {Math.round(analytics.averageTime / 60)} min
            </p>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-medium mb-4">Responses Over Time</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="responses"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-4">Node Completion</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionData}>
                <XAxis dataKey="node" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--muted))" name="Views" />
                <Bar dataKey="completions" fill="hsl(var(--primary))" name="Completions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="responses" className="space-y-4">
        <Card className="p-4">
          <h3 className="font-medium mb-4">Latest Responses</h3>
          <div className="space-y-4">
            {responses.slice(0, 10).map((response: any) => (
              <div key={response.id} className="border-t pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {new Date(response.startedAt).toLocaleDateString()}{' '}
                    {new Date(response.startedAt).toLocaleTimeString()}
                  </span>
                  <span>
                    {response.completedAt
                      ? `Completed in ${Math.round(
                          (new Date(response.completedAt).getTime() -
                            new Date(response.startedAt).getTime()) /
                            1000 / 60
                        )} min`
                      : 'Incomplete'}
                  </span>
                </div>
                <div className="mt-2">
                  <pre className="text-xs overflow-auto p-2 bg-muted rounded-lg">
                    {JSON.stringify(response.responses, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="paths" className="space-y-4">
        <Card className="p-4">
          <h3 className="font-medium mb-4">Popular Paths</h3>
          <div className="space-y-4">
            {Object.entries(analytics.pathStats)
              .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
              .slice(0, 10)
              .map(([path, count]: [string, any], index) => {
                const percentage = Math.round((count / analytics.totalResponses) * 100);
                return (
                  <div key={path} className="border-t pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 text-muted-foreground">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right text-muted-foreground">
                        {percentage}%
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground pl-8">
                      {JSON.parse(path).join(' → ')}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="weights" className="space-y-4">
        <Card className="p-4">
          <h3 className="font-medium mb-4">Weight Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analytics.weightStats)
              .sort(([a], [b]) => Number(a.split('-')[0]) - Number(b.split('-')[0]))
              .map(([range, count]: [string, any]) => {
                const percentage = Math.round((count / analytics.totalResponses) * 100);
                return (
                  <div key={range} className="border-t pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 text-muted-foreground">{range}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right text-muted-foreground">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 