"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuestionnaireViewProps {
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  flows: Flow[];
  mainStartNodeId?: string;
}

interface Flow {
  id: string;
  name: string;
  description?: string;
  nodes: NodeData[];
  edges: Edge[];
  version: number;
  color?: string;
  onePageMode?: boolean;
  variables?: any[];
}

interface NodeData {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

interface ResponseData {
  responses: Record<string, { optionIds: string[]; timestamp: number }>;
  path: string[];
  weights: Record<string, number>;
  metadata: {
    startTime: number;
    browser: string;
    device: string;
    screenSize: string;
  };
}

export function QuestionnaireView({ projectId }: QuestionnaireViewProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFlow, setCurrentFlow] = useState<Flow | null>(null);
  const [currentNode, setCurrentNode] = useState<NodeData | null>(null);
  const [nodeHistory, setNodeHistory] = useState<NodeData[]>([]);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [responseData, setResponseData] = useState<ResponseData>({
    responses: {},
    path: [],
    weights: {},
    metadata: {
      startTime: Date.now(),
      browser: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      device: typeof window !== 'undefined' ? getDeviceType() : '',
      screenSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const { theme } = useTheme();

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }

  // Fetch project data
  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/public/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        
        console.log('Project data loaded:', {
          rawData: data,
          flowCount: data.flows.length,
          publishedFlows: data.flows.filter(f => f.isPublished).length,
          firstFlow: data.flows[0],
          firstFlowNodes: data.flows[0]?.nodes,
          firstFlowNodesWithImages: data.flows[0]?.nodes.filter(n => n.data.images?.length > 0),
          mainStartFlowId: data.mainStartFlowId
        });
        
        // Filter out unpublished flows
        data.flows = data.flows.filter(f => f.isPublished);
        
        if (data.flows.length === 0) {
          setError('No published flows available');
          return;
        }
        
        setProject(data);
        
        // Find the flow containing the main start node
        if (data.flows.length > 0) {
          // First try to find the main start flow
          const mainFlow = data.flows.find(f => f.id === data.mainStartFlowId);
          let startNode = null;

          if (mainFlow) {
            startNode = mainFlow.nodes.find((n: NodeData) => n.type === 'startNode');
            if (startNode) {
              console.log('Found main start node:', {
                nodeId: startNode.id,
                nodeType: startNode.type,
                nodeData: startNode.data,
                hasImages: !!startNode.data.images,
                imageCount: startNode.data.images?.length,
                images: startNode.data.images,
                flowId: mainFlow.id,
                flowIsPublished: mainFlow.isPublished,
                flowPublishedAt: mainFlow.publishedAt,
                flowActiveVersionId: mainFlow.activeVersionId
              });
              setCurrentFlow(mainFlow);
              setCurrentNode(startNode);
              setNodeHistory([startNode]);
              return;
            }
          }

          // Fallback to first flow if main flow not found or invalid
          const firstFlow = data.flows[0];
          startNode = firstFlow.nodes.find((n: NodeData) => n.type === 'startNode');
          if (startNode) {
            console.log('Using fallback start node:', {
              nodeId: startNode.id,
              nodeType: startNode.type,
              nodeData: startNode.data,
              hasImages: !!startNode.data.images,
              imageCount: startNode.data.images?.length,
              images: startNode.data.images,
              flowId: firstFlow.id,
              flowIsPublished: firstFlow.isPublished,
              flowPublishedAt: firstFlow.publishedAt,
              flowActiveVersionId: firstFlow.activeVersionId
            });
            setCurrentFlow(firstFlow);
            setCurrentNode(startNode);
            setNodeHistory([startNode]);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load questionnaire');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  const handleSelection = useCallback((nodeId: string, selectedOptions: string[]) => {
    setSelections(prev => ({
      ...prev,
      [nodeId]: selectedOptions
    }));

    setResponseData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [nodeId]: {
          optionIds: selectedOptions,
          timestamp: Date.now()
        }
      }
    }));
  }, []);

  const findNextNode = useCallback((currentNodeId: string, selectedOption?: string) => {
    if (!currentFlow) return null;
    
    const edges = currentFlow.edges;
    const nodes = currentFlow.nodes;
    const currentNode = nodes.find(n => n.id === currentNodeId);

    console.log('Debug findNextNode:', {
      currentNodeId,
      selectedOption,
      currentNodeType: currentNode?.type,
      edges: edges.map(e => ({
        ...e,
        matches: {
          sourceMatches: e.source === currentNodeId,
          handleMatches: selectedOption ? e.sourceHandle === selectedOption : e.sourceHandle === null
        }
      })),
      nodes,
      currentFlow: {
        id: currentFlow.id,
        isPublished: currentFlow.isPublished,
        publishedAt: currentFlow.publishedAt,
        activeVersionId: currentFlow.activeVersionId
      }
    });

    // Find the connecting edge based on the selection
    const edge = edges.find(e => {
      const sourceMatches = e.source === currentNodeId;
      // For multiple choice nodes, we don't need to match the sourceHandle
      const handleMatches = currentNode?.type === 'multipleChoice' 
        ? true 
        : (selectedOption ? e.sourceHandle === selectedOption : e.sourceHandle === null);
      
      console.log('Edge check:', {
        edge: e,
        sourceMatches,
        handleMatches,
        currentNodeId,
        selectedOption,
        nodeType: currentNode?.type
      });
      
      return sourceMatches && handleMatches;
    });

    console.log('Found edge:', edge);

    if (!edge) return null;

    // Find the target node
    const targetNode = nodes.find(n => n.id === edge.target) || null;
    console.log('Target node:', {
      node: targetNode,
      nodeData: targetNode?.data,
      hasImages: !!targetNode?.data.images,
      imageCount: targetNode?.data.images?.length,
      images: targetNode?.data.images
    });
    
    return targetNode;
  }, [currentFlow]);

  const handleNext = useCallback(async () => {
    if (!currentNode || !currentFlow) return;

    // Track the path
    setResponseData(prev => ({
      ...prev,
      path: [...prev.path, currentNode.id],
      weights: {
        ...prev.weights,
        ...(currentNode.type === 'weightNode' ? {
          [currentNode.id]: currentNode.data.weight
        } : {})
      }
    }));

    // If this is an end node, submit the response
    if (currentNode.type === 'endNode' && !currentNode.data.redirectFlow) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/public/projects/${projectId}/flows/${currentFlow.id}/responses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(responseData),
        });

        if (!response.ok) {
          throw new Error('Failed to submit response');
        }

        // Show results after submission
        setShowResults(true);
        
        // Fetch analytics
        const analyticsResponse = await fetch(
          `/api/public/projects/${projectId}/flows/${currentFlow.id}/responses?version=${currentFlow.version}`
        );
        if (analyticsResponse.ok) {
          const data = await analyticsResponse.json();
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error('Error submitting response:', error);
        toast.error('Failed to submit response');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    console.log('Debug handleNext:', {
      currentNode,
      currentNodeData: currentNode.data,
      hasImages: !!currentNode.data.images,
      imageCount: currentNode.data.images?.length,
      images: currentNode.data.images,
      currentSelection: selections[currentNode.id],
      currentFlow: {
        id: currentFlow.id,
        isPublished: currentFlow.isPublished,
        publishedAt: currentFlow.publishedAt,
        activeVersionId: currentFlow.activeVersionId
      },
    });

    const currentSelection = selections[currentNode.id];
    let nextNode: NodeData | null = null;

    if (currentNode.type === 'endNode' && currentNode.data.redirectFlow) {
      // Handle flow redirection
      const nextFlow = project?.flows.find(f => f.id === currentNode.data.redirectFlow.id);
      if (nextFlow) {
        console.log('Redirecting to flow:', {
          flowId: nextFlow.id,
          isPublished: nextFlow.isPublished,
          publishedAt: nextFlow.publishedAt,
          activeVersionId: nextFlow.activeVersionId,
          version: nextFlow.version
        });
        
        // Find the start node in the next flow
        const startNode = nextFlow.nodes.find(n => n.type === 'startNode');
        if (startNode) {
          setCurrentFlow(nextFlow);
          setCurrentNode(startNode);
          // Reset history for the new flow
          setNodeHistory([startNode]);
          return;
        } else {
          console.error('No start node found in redirected flow');
          toast.error('Error loading next flow');
        }
      } else {
        console.error('Redirected flow not found or not published');
        toast.error('Next flow is not available');
      }
    } else {
      // Find next node based on selection
      const selectedOption = currentSelection?.[0];
      nextNode = findNextNode(currentNode.id, selectedOption);
    }

    console.log('Next node:', {
      node: nextNode,
      nodeData: nextNode?.data,
      hasImages: !!nextNode?.data.images,
      imageCount: nextNode?.data.images?.length,
      images: nextNode?.data.images
    });

    if (nextNode) {
      setCurrentNode(nextNode);
      setNodeHistory(prev => [...prev, nextNode!]);
    } else if (currentNode.type !== 'endNode') {
      console.log('No next node found. Current node:', currentNode);
      toast.error('No next node found');
    }
  }, [currentNode, currentFlow, projectId, responseData]);

  const handleBack = useCallback(() => {
    if (nodeHistory.length > 1) {
      const newHistory = nodeHistory.slice(0, -1);
      setNodeHistory(newHistory);
      setCurrentNode(newHistory[newHistory.length - 1]);
    }
  }, [nodeHistory]);

  const renderNodeContent = useCallback((node: NodeData) => {
    const currentSelection = selections[node.id] || [];

    console.log('Debug renderNodeContent:', {
      node,
      nodeType: node.type,
      nodeData: node.data,
      isVisual: node.data.isVisual,
      welcomeMessage: node.data.welcomeMessage,
      images: node.data.images,
      hasImages: !!node.data.images,
      imageCount: node.data.images?.length
    });

    const renderImages = (images: any[]) => {
      console.log('renderImages called with:', {
        images,
        isArray: Array.isArray(images),
        length: images?.length,
        firstImage: images?.[0]
      });

      if (!images || images.length === 0) {
        console.log('No images to render:', images);
        return null;
      }
      
      console.log('Rendering images:', images);
      return (
        <div className="space-y-4 mb-4">
          {images.map((image, index) => {
            console.log('Rendering image:', {
              index,
              image,
              url: image.url,
              alt: image.alt
            });
            return (
              <img
                key={index}
                src={image.url}
                alt={image.alt || ''}
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: '300px' }}
              />
            );
          })}
        </div>
      );
    };

    switch (node.type) {
      case 'startNode':
        console.log('Rendering start node:', {
          node,
          nodeId: node.id,
          nodeData: node.data,
          isVisual: node.data.isVisual,
          welcomeMessage: node.data.welcomeMessage,
          images: node.data.images,
          hasImages: !!node.data.images,
          imageCount: node.data.images?.length
        });
        return (
          <div className="space-y-4">
            {renderImages(node.data.images)}
            <div
              className="prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: node.data.welcomeMessage }}
            />
          </div>
        );

      case 'endNode':
        return (
          <div className="space-y-4">
            {renderImages(node.data.images)}
            <div
              className="prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: node.data.exitMessage }}
            />
          </div>
        );

      case 'yesNo':
        return (
          <div className="space-y-4">
            {renderImages(node.data.images)}
            {node.data.title && (
              <h3 className="text-lg font-medium">{node.data.title}</h3>
            )}
            <div
              className="prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: node.data.content }}
            />
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={currentSelection.includes('yes') ? 'default' : 'outline'}
                onClick={() => handleSelection(node.id, ['yes'])}
              >
                {node.data.yesLabel || 'Yes'}
              </Button>
              <Button
                variant={currentSelection.includes('no') ? 'default' : 'outline'}
                onClick={() => handleSelection(node.id, ['no'])}
              >
                {node.data.noLabel || 'No'}
              </Button>
            </div>
          </div>
        );

      case 'singleChoice':
        return (
          <div className="space-y-4">
            {renderImages(node.data.images)}
            {node.data.title && (
              <h3 className="text-lg font-medium">{node.data.title}</h3>
            )}
            <div
              className="prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: node.data.content }}
            />
            <div className="space-y-2">
              {node.data.options.map((option: any) => (
                <Button
                  key={option.id}
                  variant={currentSelection.includes(option.id) ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleSelection(node.id, [option.id])}
                >
                  <div className="flex items-center gap-2">
                    {option.metadata?.image?.url && node.data.style?.showImages && (
                      <img
                        src={option.metadata.image.url}
                        alt={option.metadata.image.alt || ''}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <span>{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'multipleChoice':
        return (
          <div className="space-y-4">
            {renderImages(node.data.images)}
            {node.data.title && (
              <h3 className="text-lg font-medium">{node.data.title}</h3>
            )}
            <div
              className="prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: node.data.content }}
            />
            <div className={cn(
              "grid gap-2",
              node.data.style?.layout === 'grid'
                ? `grid-cols-${node.data.style.columns || 2}`
                : 'grid-cols-1'
            )}>
              {node.data.options.map((option: any) => (
                <Button
                  key={option.id}
                  variant={currentSelection.includes(option.id) ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => {
                    const newSelection = currentSelection.includes(option.id)
                      ? currentSelection.filter(id => id !== option.id)
                      : [...currentSelection, option.id];
                    
                    if (node.data.maxSelections && newSelection.length > node.data.maxSelections) {
                      toast.error(`Maximum ${node.data.maxSelections} selections allowed`);
                      return;
                    }
                    
                    handleSelection(node.id, newSelection);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {option.metadata?.image?.url && node.data.style?.showImages && (
                      <img
                        src={option.metadata.image.url}
                        alt={option.metadata.image.alt || ''}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <span>{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>
            {(node.data.minSelections || node.data.maxSelections) && (
              <p className="text-xs text-muted-foreground">
                {node.data.minSelections && `Min: ${node.data.minSelections} `}
                {node.data.maxSelections && `Max: ${node.data.maxSelections}`} selections
              </p>
            )}
          </div>
        );

      default:
        return <div>Unsupported node type: {node.type}</div>;
    }
  }, [selections]);

  const renderResults = useCallback(() => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Total Responses</h3>
            <p className="text-2xl font-bold">{analytics.totalResponses}</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Completion Rate</h3>
            <p className="text-2xl font-bold">
              {Math.round(analytics.completionRate * 100)}%
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Average Time</h3>
            <p className="text-2xl font-bold">
              {Math.round(analytics.averageTime / 60)} min
            </p>
          </Card>
        </div>

        {/* Node Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Question Statistics</h3>
          <div className="space-y-4">
            {Object.entries(analytics.nodeStats).map(([nodeId, stats]: [string, any]) => {
              const node = currentFlow?.nodes.find(n => n.id === nodeId);
              if (!node) return null;

              return (
                <div key={nodeId} className="border-t pt-4">
                  <h4 className="font-medium mb-2">{node.data.title || node.type}</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>Views: {stats.views}</p>
                    {Object.entries(stats.selections).map(([optionId, count]: [string, any]) => {
                      let optionLabel = optionId;
                      if (node.data.options) {
                        const option = node.data.options.find((o: any) => o.id === optionId);
                        if (option) optionLabel = option.label;
                      } else if (optionId === 'yes') {
                        optionLabel = node.data.yesLabel || 'Yes';
                      } else if (optionId === 'no') {
                        optionLabel = node.data.noLabel || 'No';
                      }

                      const percentage = Math.round((count / stats.views) * 100);
                      return (
                        <div key={optionId} className="flex items-center gap-2">
                          <div className="flex-1">{optionLabel}</div>
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-12 text-right">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Weight Distribution */}
        {Object.keys(analytics.weightStats).length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Score Distribution</h3>
            <div className="space-y-2">
              {Object.entries(analytics.weightStats)
                .sort(([a], [b]) => Number(a.split('-')[0]) - Number(b.split('-')[0]))
                .map(([range, count]: [string, any]) => {
                  const percentage = Math.round((count / analytics.totalResponses) * 100);
                  return (
                    <div key={range} className="flex items-center gap-2">
                      <div className="w-20">{range}</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-right">{percentage}%</div>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {/* Popular Paths */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Popular Paths</h3>
          <div className="space-y-2">
            {Object.entries(analytics.pathStats)
              .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
              .slice(0, 5)
              .map(([path, count]: [string, any], index) => {
                const pathNodes = JSON.parse(path).map((nodeId: string) => {
                  const node = currentFlow?.nodes.find(n => n.id === nodeId);
                  return node?.data.title || node?.type || nodeId;
                });
                const percentage = Math.round((count / analytics.totalResponses) * 100);

                return (
                  <div key={path} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 text-muted-foreground">#{index + 1}</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-right">{percentage}%</div>
                    </div>
                    <div className="text-sm text-muted-foreground pl-8">
                      {pathNodes.join(' → ')}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    );
  }, [analytics, currentFlow]);

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="p-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="p-6">
          <div className="text-center text-destructive">
            <h2 className="text-lg font-medium mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!project || !currentFlow || !currentNode) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            <h2 className="text-lg font-medium mb-2">No Content</h2>
            <p>This questionnaire is not available.</p>
          </div>
        </Card>
      </div>
    );
  }

  console.log('Debug Navigation:', {
    nodeHistory: nodeHistory,
    currentNode: currentNode,
    selections: selections,
    canGoBack: nodeHistory.length > 1,
    canGoNext: currentNode.type === 'endNode' || currentNode.type === 'startNode' || selections[currentNode.id]?.length > 0,
    currentNodeType: currentNode.type,
    hasSelections: selections[currentNode.id]?.length > 0
  });

  const canGoBack = nodeHistory.length > 1;
  const canGoNext = currentNode.type === 'endNode' || currentNode.type === 'startNode' || selections[currentNode.id]?.length > 0;

  if (showResults) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{project?.name} - Results</h1>
            {project?.description && (
              <p className="text-muted-foreground mt-2">{project.description}</p>
            )}
          </div>

          {renderResults()}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-2xl">
        <div className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-2">{project.description}</p>
            )}
            {currentFlow && (
              <div className="mt-2 text-sm text-muted-foreground">
                Version {currentFlow.version}
              </div>
            )}
          </div>

          {/* Current Node */}
          <div className="max-w-xl mx-auto">
            {renderNodeContent(currentNode)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={!canGoBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canGoNext}
            >
              {currentNode.type === 'endNode' ? (
                currentNode.data.redirectFlow ? 'Continue to Next Flow' : 'Finish'
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 