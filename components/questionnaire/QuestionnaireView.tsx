"use client";

import { useCallback, useEffect, useState } from 'react';
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
  description: string;
  content: string;
  version: number;
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

export function QuestionnaireView({ projectId }: QuestionnaireViewProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFlow, setCurrentFlow] = useState<Flow | null>(null);
  const [currentNode, setCurrentNode] = useState<NodeData | null>(null);
  const [nodeHistory, setNodeHistory] = useState<NodeData[]>([]);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const { theme } = useTheme();

  // Fetch project data
  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/public/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        
        // Transform the data to parse flow content
        const transformedData = {
          ...data,
          flows: data.flows.map((flow: Flow) => ({
            ...flow,
            content: typeof flow.content === 'string' ? JSON.parse(flow.content) : flow.content
          }))
        };
        
        console.log('Full project response:', {
          project: transformedData,
          flows: transformedData.flows
        });
        
        setProject(transformedData);
        
        // Find the flow containing the main start node
        if (transformedData.flows.length > 0) {
          // First try to find the main start flow
          const mainFlow = transformedData.flows.find(f => f.id === transformedData.mainStartFlowId);
          let startNode = null;

          if (mainFlow) {
            const flowContent = mainFlow.content;
            startNode = flowContent.nodes.find((n: NodeData) => n.type === 'startNode');
            if (startNode) {
              setCurrentFlow(mainFlow);
              setCurrentNode(startNode);
              setNodeHistory([startNode]);
              return;
            }
          }

          // Fallback to first flow if main flow not found or invalid
          const firstFlow = transformedData.flows[0];
          const flowContent = firstFlow.content;
          startNode = flowContent.nodes.find((n: NodeData) => n.type === 'startNode');
          if (startNode) {
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
  }, []);

  const findNextNode = useCallback((currentNodeId: string, selectedOption?: string) => {
    if (!currentFlow) return null;
    
    const flowContent = currentFlow.content;
    const edges = flowContent.edges as Edge[];
    const nodes = flowContent.nodes as NodeData[];

    console.log('Debug findNextNode:', {
      currentNodeId,
      selectedOption,
      edges: edges.map(e => ({
        ...e,
        matches: {
          sourceMatches: e.source === currentNodeId,
          handleMatches: selectedOption ? e.sourceHandle === selectedOption : e.sourceHandle === null
        }
      })),
      nodes,
      flowContent
    });

    // Find the connecting edge based on the selection
    const edge = edges.find(e => {
      const sourceMatches = e.source === currentNodeId;
      const handleMatches = selectedOption ? e.sourceHandle === selectedOption : e.sourceHandle === null;
      
      console.log('Edge check:', {
        edge: e,
        sourceMatches,
        handleMatches,
        currentNodeId,
        selectedOption
      });
      
      return sourceMatches && handleMatches;
    });

    console.log('Found edge:', edge);

    if (!edge) return null;

    // Find the target node
    const targetNode = nodes.find(n => n.id === edge.target) || null;
    console.log('Target node:', targetNode);
    
    return targetNode;
  }, [currentFlow]);

  const handleNext = useCallback(() => {
    if (!currentNode) return;

    console.log('Debug handleNext:', {
      currentNode,
      currentSelection: selections[currentNode.id],
      currentFlow,
      flowContent: currentFlow ? (
        typeof currentFlow.content === 'string' ? 
        JSON.parse(currentFlow.content) : 
        currentFlow.content
      ) : null
    });

    const currentSelection = selections[currentNode.id];
    let nextNode: NodeData | null = null;

    if (currentNode.type === 'endNode' && currentNode.data.redirectFlow) {
      // Handle flow redirection
      const nextFlow = project?.flows.find(f => f.id === currentNode.data.redirectFlow.id);
      if (nextFlow) {
        setCurrentFlow(nextFlow);
        const flowContent = typeof nextFlow.content === 'string' ? JSON.parse(nextFlow.content) : nextFlow.content;
        const startNode = flowContent.nodes.find((n: NodeData) => n.type === 'startNode');
        if (startNode) {
          nextNode = startNode;
          setNodeHistory([startNode]);
        }
      }
    } else {
      // Find next node based on selection
      const selectedOption = currentSelection?.[0];
      nextNode = findNextNode(currentNode.id, selectedOption);
    }

    console.log('Next node:', nextNode);

    if (nextNode) {
      setCurrentNode(nextNode);
      setNodeHistory(prev => [...prev, nextNode!]);
    } else if (currentNode.type !== 'endNode') {
      console.log('No next node found. Current node:', currentNode);
      toast.error('No next node found');
    }
  }, [currentNode, selections, findNextNode, project?.flows, currentFlow]);

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
      images: node.data.images
    });

    const renderImages = (images: any[]) => {
      if (!images || images.length === 0) return null;
      
      return (
        <div className="space-y-4 mb-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={image.alt || ''}
              className="w-full rounded-lg object-cover"
              style={{ maxHeight: '300px' }}
            />
          ))}
        </div>
      );
    };

    switch (node.type) {
      case 'startNode':
        return (
          <div className="space-y-4">
            {node.data.isVisual ? (
              <div className="space-y-4">
                <img
                  src={node.data.welcomeMessage}
                  alt="Welcome visual"
                  className="w-full rounded-lg object-cover"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            ) : (
              <>
                {renderImages(node.data.images)}
                <div
                  className="prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: node.data.welcomeMessage }}
                />
              </>
            )}
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
                currentNode.data.redirectFlow ? 'Continue' : 'Finish'
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