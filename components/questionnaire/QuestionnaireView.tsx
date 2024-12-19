"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  isPublished?: boolean;
  publishedAt?: string;
  activeVersionId?: string;
}

interface NodeData {
  id: string;
  type: string;
  data: {
    title?: string;
    content?: string;
    welcomeMessage?: string;
    exitMessage?: string;
    yesLabel?: string;
    noLabel?: string;
    options?: Array<{
      id: string;
      label: string;
      metadata?: {
        image?: {
          url: string;
          alt?: string;
        };
        weight?: number;
        category?: string;
        feedback?: string;
      };
    }>;
    style?: {
      layout?: string;
      columns?: number;
      showImages?: boolean;
    };
    isVisual?: boolean;
    images?: Array<{
      url: string;
      alt?: string;
    }>;
    weight?: number;
    minSelections?: number;
    maxSelections?: number;
    redirectFlow?: {
      id: string;
    };
    scoring?: {
      method: 'sum' | 'average' | 'weighted';
      categories?: Array<{
        id: string;
        name: string;
        weight?: number;
      }>;
      feedback?: Array<{
        condition: string;
        message: string;
        range?: {
          min: number;
          max: number;
        };
      }>;
    };
  };
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

interface UserIdentification {
  name?: string;
  email?: string;
  avatar?: string;
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
}

interface Score {
  total: number;
  breakdown: Record<string, number>;
  categories?: Record<string, number>;
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
  const [showWelcome, setShowWelcome] = useState(true);
  const [userIdentification, setUserIdentification] = useState<UserIdentification>({});
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [score, setScore] = useState<Score>({
    total: 0,
    breakdown: {},
    categories: {}
  });
  const [feedback, setFeedback] = useState<{
    overall?: string;
    categories?: Record<string, string>;
    options?: Record<string, string>;
  }>({});

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

  // Calculate progress when node changes
  useEffect(() => {
    if (currentNode && nodeHistory.length > 0 && currentFlow?.nodes) {
      // Get total number of nodes excluding end nodes
      const totalNodes = currentFlow.nodes.filter(node => node.type !== 'endNode').length || 1;
      // Calculate progress based on the current position in the flow
      const currentProgress = Math.min((nodeHistory.length / totalNodes) * 100, 100);
      setProgress(currentProgress);
      
      console.log('Progress calculation:', {
        currentNodeId: currentNode.id,
        historyLength: nodeHistory.length,
        totalNodes,
        progress: currentProgress
      });
    } else {
      setProgress(0);
    }
  }, [currentNode, nodeHistory, currentFlow]);

  useEffect(() => {
    // Calculate score whenever selections or weights change
    if (currentNode && selections[currentNode.id]) {
      const newScore = {
        total: 0,
        breakdown: { ...score.breakdown },
        categories: { ...score.categories }
      };

      // Calculate node-specific score
      if (currentNode.data.weight) {
        newScore.breakdown[currentNode.id] = currentNode.data.weight;
        newScore.total += currentNode.data.weight;
      }

      // Calculate option-specific scores
      if (currentNode.data.options) {
        selections[currentNode.id].forEach(optionId => {
          const option = currentNode.data.options?.find(o => o.id === optionId);
          if (option?.metadata?.weight) {
            newScore.breakdown[optionId] = option.metadata.weight;
            newScore.total += option.metadata.weight;
          }
          if (option?.metadata?.category) {
            newScore.categories![option.metadata.category] = 
              (newScore.categories![option.metadata.category] || 0) + (option.metadata.weight || 1);
          }
        });
      }

      setScore(newScore);
    }
  }, [selections, currentNode]);

  useEffect(() => {
    if (!currentNode || !score) return;

    const newFeedback: {
      overall?: string;
      categories?: Record<string, string>;
      options?: Record<string, string>;
    } = {};

    // Process node-level feedback
    if (currentNode.data.scoring?.feedback) {
      for (const fb of currentNode.data.scoring.feedback) {
        if (fb.range) {
          if (score.total >= fb.range.min && score.total <= fb.range.max) {
            newFeedback.overall = fb.message;
            break;
          }
        } else if (fb.condition) {
          try {
            const condition = fb.condition
              .replace('score', score.total.toString())
              .replace(/\$\{([^}]+)\}/g, (_, key) => {
                return score.categories?.[key]?.toString() || '0';
              });
            if (eval(condition)) {
              newFeedback.overall = fb.message;
              break;
            }
          } catch (error) {
            console.error('Error evaluating feedback condition:', error);
          }
        }
      }
    }

    // Process category-specific feedback
    if (score.categories && currentNode.data.scoring?.categories) {
      newFeedback.categories = {};
      for (const category of currentNode.data.scoring.categories) {
        const categoryScore = score.categories[category.id];
        if (categoryScore !== undefined) {
          const categoryFeedback = currentNode.data.scoring.feedback?.find(fb => {
            if (fb.range) {
              return categoryScore >= fb.range.min && categoryScore <= fb.range.max;
            }
            return false;
          });
          if (categoryFeedback) {
            newFeedback.categories[category.id] = categoryFeedback.message;
          }
        }
      }
    }

    // Process option-specific feedback
    if (currentNode.data.options) {
      newFeedback.options = {};
      Object.entries(selections).forEach(([nodeId, selectedOptions]) => {
        selectedOptions.forEach(optionId => {
          const option = currentNode.data.options?.find(o => o.id === optionId);
          if (option?.metadata?.feedback) {
            newFeedback.options![optionId] = option.metadata.feedback;
          }
        });
      });
    }

    setFeedback(newFeedback);
  }, [score, currentNode, selections]);

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
        const finalResponseData = {
          ...responseData,
          score,
          feedback,
          metadata: {
            ...responseData.metadata,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            userIdentification
          }
        };

        const response = await fetch(`/api/public/projects/${projectId}/flows/${currentFlow.id}/responses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalResponseData),
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
  }, [currentNode, currentFlow, projectId, responseData, score, feedback, userIdentification]);

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
      <div className="space-y-8 w-full max-w-4xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{score.total}</div>
              {feedback.overall && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {feedback.overall}
                </p>
              )}
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Completion Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round((Date.now() - startTime) / 1000 / 60)} min
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Average: {Math.round(analytics.averageTime / 60)} min
              </p>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Questions Answered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Object.keys(selections).length}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Completion Rate: {Math.round(analytics.completionRate * 100)}%
              </p>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Scores */}
        {score.categories && Object.keys(score.categories).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Category Scores</CardTitle>
              <CardDescription>Your performance across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(score.categories).map(([category, value]) => {
                  const maxScore = 100; // You might want to calculate this based on your scoring system
                  const percentage = (value / maxScore) * 100;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">{value} points</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-2 bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                      {feedback.categories?.[category] && (
                        <p className="text-sm text-muted-foreground">
                          {feedback.categories[category]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Journey</CardTitle>
            <CardDescription>Step by step breakdown of your responses</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-muted ml-4" />
                {nodeHistory.map((node, index) => {
                  const nodeSelections = selections[node.id];
                  if (!nodeSelections) return null;

                  return (
                    <div key={node.id} className="relative pl-10 pb-8 last:pb-0">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-medium">{node.data.title || node.data.content}</h4>
                        <div className="flex flex-wrap gap-2">
                          {nodeSelections.map((selection: string) => {
                            let label = selection;
                            if (node.data.options) {
                              const option = node.data.options.find((o: any) => o.id === selection);
                              if (option) label = option.label;
                            } else if (selection === 'yes') {
                              label = node.data.yesLabel || 'Yes';
                            } else if (selection === 'no') {
                              label = node.data.noLabel || 'No';
                            }
                            return (
                              <Badge key={selection} variant="secondary">
                                {label}
                              </Badge>
                            );
                          })}
                        </div>
                        {feedback.options && Object.entries(feedback.options)
                          .filter(([optionId]) => nodeSelections.includes(optionId))
                          .map(([optionId, message]) => (
                            <p key={optionId} className="text-sm text-muted-foreground">
                              {message}
                            </p>
                          ))
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Comparison with Others */}
        <Card>
          <CardHeader>
            <CardTitle>Response Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-12">
                {Object.entries(analytics.nodeStats).map(([nodeId, stats]: [string, any]) => {
                  const node = currentFlow?.nodes.find(n => n.id === nodeId);
                  if (!node) return null;

                  const totalResponses = Object.values(stats.selections).reduce((a: any, b: any) => a + b, 0);
                  const userSelections = selections[nodeId] || [];

                  // Sort options by percentage in descending order
                  const sortedOptions = Object.entries(stats.selections)
                    .map(([optionId, count]: [string, any]) => {
                      let label = optionId;
                      if (node.data.options) {
                        const option = node.data.options.find((o: any) => o.id === optionId);
                        if (option) label = option.label;
                      } else if (optionId === 'yes') {
                        label = node.data.yesLabel || 'Yes';
                      } else if (optionId === 'no') {
                        label = node.data.noLabel || 'No';
                      }

                      const percentage = Math.round((count / totalResponses) * 100);
                      const isSelected = userSelections.includes(optionId);

                      return { optionId, label, count, percentage, isSelected };
                    })
                    .sort((a, b) => b.percentage - a.percentage);

                  return (
                    <div key={nodeId} className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm">{node.data.title || node.data.content}</h4>
                      </div>
                      <div className="space-y-1">
                        {sortedOptions.map(({ optionId, label, percentage, isSelected }) => (
                          <div key={optionId} className="group">
                            <div className="flex items-center gap-2">
                              <div className="w-[120px] truncate text-xs text-muted-foreground">
                                {label}
                              </div>
                              <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    isSelected ? "bg-primary" : "bg-muted"
                                  )}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="w-9 text-xs tabular-nums text-right text-muted-foreground">
                                {percentage}%
                              </div>
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

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Start Over
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const resultsUrl = window.location.href;
              navigator.clipboard.writeText(resultsUrl);
              toast.success('Results URL copied to clipboard');
            }}
            className="gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Share Results
          </Button>
          {userIdentification.email && (
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement email results
                toast.success('Results sent to your email');
              }}
              className="gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Email Results
            </Button>
          )}
        </div>
      </div>
    );
  }, [analytics, currentFlow]);

  // Welcome screen component
  const WelcomeScreen = () => {
    const handleInputChange = (field: 'name' | 'email', value: string) => {
      setUserIdentification(prev => ({
        ...prev,
        [field]: value
      }));
    };

    return (
      <Card className="w-full max-w-2xl">
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{project?.name}</h1>
            {project?.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
            {currentFlow && (
              <Badge variant="outline">Version {currentFlow.version}</Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Welcome!</h2>
              <p className="text-muted-foreground">
                This questionnaire will help us understand your preferences and provide personalized recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={userIdentification.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={userIdentification.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={() => setShowWelcome(false)}
          >
            Start Questionnaire
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  };

  // Results screen component
  const ResultsScreen = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-8 w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
            <CardDescription>
              Thank you for completing the questionnaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{score.total}</div>
                      {feedback.overall && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {feedback.overall}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {score.categories && Object.entries(score.categories).map(([category, value]) => (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{value}</div>
                        {feedback.categories?.[category] && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {feedback.categories[category]}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            {feedback.options && Object.keys(feedback.options).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(feedback.options).map(([optionId, message]) => {
                      const node = nodeHistory.find(n => 
                        n.data.options?.some(o => o.id === optionId)
                      );
                      const option = node?.data.options?.find(o => o.id === optionId);
                      
                      return (
                        <div key={optionId} className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {option?.metadata?.image?.url ? (
                              <img
                                src={option.metadata.image.url}
                                alt={option.metadata.image.alt || ''}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {option?.label?.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{option?.label}</h4>
                            <p className="text-sm text-muted-foreground">{message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Completion Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((Date.now() - startTime) / 1000 / 60)} min
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Questions Answered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.keys(selections).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Your Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.values(responseData.weights).reduce((a: number, b: number) => a + b, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Response Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {nodeHistory.map((node, index) => {
                    const nodeSelections = selections[node.id];
                    if (!nodeSelections) return null;

                    return (
                      <div key={node.id} className="py-4 first:pt-0 last:pb-0 border-b last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="bg-muted rounded-full p-2">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">{node.data.title || node.data.content}</p>
                            <div className="text-sm text-muted-foreground">
                              {nodeSelections.map((selection: string) => {
                                let label = selection;
                                if (node.data.options) {
                                  const option = node.data.options.find((o: any) => o.id === selection);
                                  if (option) label = option.label;
                                } else if (selection === 'yes') {
                                  label = node.data.yesLabel || 'Yes';
                                } else if (selection === 'no') {
                                  label = node.data.noLabel || 'No';
                                }
                                return (
                                  <Badge key={selection} variant="secondary" className="mr-2">
                                    {label}
                                  </Badge>
                                );
                              })}
                            </div>
                            {feedback.options && Object.entries(feedback.options)
                              .filter(([optionId]) => nodeSelections.includes(optionId))
                              .map(([optionId, message]) => (
                                <p key={optionId} className="text-sm text-muted-foreground mt-2">
                                  {message}
                                </p>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Comparison with others */}
            <Card>
              <CardHeader>
                <CardTitle>How You Compare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.nodeStats).map(([nodeId, stats]: [string, any]) => {
                    const node = currentFlow?.nodes.find(n => n.id === nodeId);
                    if (!node) return null;

                    const totalResponses = Object.values(stats.selections).reduce((a: number, b: number) => a + b, 0);
                    const userSelections = selections[nodeId] || [];

                    return (
                      <div key={nodeId} className="space-y-2">
                        <h4 className="font-medium">{node.data.title || node.data.content}</h4>
                        <div className="space-y-1">
                          {Object.entries(stats.selections).map(([optionId, count]: [string, any]) => {
                            let label = optionId;
                            if (node.data.options) {
                              const option = node.data.options.find((o: any) => o.id === optionId);
                              if (option) label = option.label;
                            } else if (optionId === 'yes') {
                              label = node.data.yesLabel || 'Yes';
                            } else if (optionId === 'no') {
                              label = node.data.noLabel || 'No';
                            }

                            const percentage = Math.round((count / totalResponses) * 100);
                            const isSelected = userSelections.includes(optionId);

                            return (
                              <div key={optionId} className="flex items-center gap-2">
                                <div className="w-32 truncate">{label}</div>
                                <div className="flex-1 h-2 bg-muted rounded-full">
                                  <div
                                    className={cn(
                                      "h-2 rounded-full",
                                      isSelected ? "bg-primary" : "bg-muted-foreground/30"
                                    )}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="w-12 text-right text-sm">
                                  {percentage}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Start Over
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const resultsUrl = window.location.href;
                  navigator.clipboard.writeText(resultsUrl);
                  toast.success('Results URL copied to clipboard');
                }}
              >
                Share Results
              </Button>
              {userIdentification.email && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Implement email results
                    toast.success('Results sent to your email');
                  }}
                >
                  Email Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

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

  if (showResults) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto space-y-8">
          <ResultsScreen />
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
        <WelcomeScreen />
      </div>
    );
  }

  const canGoBack = nodeHistory.length > 1;
  const canGoNext = currentNode && (
    currentNode.type === 'startNode' ||
    currentNode.type === 'endNode' ||
    (selections[currentNode.id] && selections[currentNode.id].length > 0 &&
      (currentNode.type !== 'multipleChoice' ||
        !currentNode.data.minSelections ||
        selections[currentNode.id].length >= currentNode.data.minSelections))
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-2xl">
        <div className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                {project.description && (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
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
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : currentNode.type === 'endNode' ? (
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