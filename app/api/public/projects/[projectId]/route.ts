import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;

  // Fetch the project with its published flows and active versions
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      mainStartFlowId: true,
      charts: {
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          name: true,
          content: true,
          version: true,
          color: true,
          onePageMode: true,
          isPublished: true,
          publishedAt: true,
          activeVersionId: true,
          activeVersion: {
            select: {
              id: true,
              version: true,
              name: true,
              content: true,
              metadata: true,
              createdAt: true,
              publishedAt: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  }

  // Transform the response to include only necessary data
  const transformedProject = {
    id: project.id,
    name: project.name,
    description: project.description,
    mainStartFlowId: project.mainStartFlowId,
    flows: project.charts.map(flow => {
      // Use the active version's content if available, otherwise use the flow's content
      const content = flow.activeVersion?.content || flow.content;
      let parsedContent;
      try {
        // Ensure content is properly parsed and use the active version's content
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        
        // Log the raw content for debugging
        console.log('Raw flow content:', {
          flowId: flow.id,
          hasActiveVersion: !!flow.activeVersion,
          activeVersionId: flow.activeVersionId,
          rawContent: content,
          isString: typeof content === 'string',
          contentLength: typeof content === 'string' ? content.length : 'N/A'
        });

        // Ensure each node has all required properties
        if (parsedContent.nodes) {
          parsedContent.nodes = parsedContent.nodes.map((node: any) => {
            console.log('Processing node:', {
              nodeId: node.id,
              nodeType: node.type,
              nodeData: node.data,
              hasImages: !!node.data?.images,
              imageCount: node.data?.images?.length,
              rawNode: node
            });

            // Ensure node.data exists
            if (!node.data) {
              node.data = {};
            }

            // Common image handling for all visual nodes
            if (node.data?.isVisual) {
              console.log('Processing visual node:', {
                nodeId: node.id,
                nodeType: node.type,
                originalData: {
                  ...node.data,
                  images: node.data.images ? {
                    isArray: Array.isArray(node.data.images),
                    length: node.data.images?.length,
                    firstImage: node.data.images?.[0],
                    rawImages: node.data.images
                  } : 'no images'
                }
              });

              const processedNode = {
                ...node,
                data: {
                  ...node.data,
                  images: Array.isArray(node.data.images) ? node.data.images : [],
                }
              };

              console.log('Processed visual node:', {
                nodeId: node.id,
                nodeType: node.type,
                processedData: {
                  ...processedNode.data,
                  images: {
                    isArray: Array.isArray(processedNode.data.images),
                    length: processedNode.data.images?.length,
                    firstImage: processedNode.data.images?.[0]
                  }
                }
              });

              return processedNode;
            }

            // Additional processing for specific node types
            switch (node.type) {
              case 'startNode':
                return {
                  ...node,
                  data: {
                    ...node.data,
                    type: 'start',
                    images: Array.isArray(node.data.images) ? node.data.images : [],
                    welcomeMessage: node.data.welcomeMessage || '',
                    isVisual: node.data.isVisual || false,
                  }
                };
              case 'endNode':
                return {
                  ...node,
                  data: {
                    ...node.data,
                    images: Array.isArray(node.data.images) ? node.data.images : [],
                    exitMessage: node.data.exitMessage || '',
                  }
                };
              case 'yesNo':
              case 'singleChoice':
              case 'multipleChoice':
                return {
                  ...node,
                  data: {
                    ...node.data,
                    images: Array.isArray(node.data.images) ? node.data.images : [],
                    content: node.data.content || '',
                  }
                };
              default:
                return node;
            }
          });
        }

        // Create a properly structured flow object
        const newFlow = {
          id: flow.id,
          name: flow.name,
          nodes: parsedContent.nodes || [],
          edges: parsedContent.edges || [],
          color: flow.color,
          onePageMode: flow.onePageMode,
          variables: parsedContent.variables || [],
          version: flow.version,
          isPublished: flow.isPublished,
          publishedAt: flow.publishedAt,
          activeVersionId: flow.activeVersionId,
        };

        console.log('Transformed flow:', {
          flowId: newFlow.id,
          nodeCount: newFlow.nodes.length,
          nodesWithImages: newFlow.nodes.filter(n => n.data.images?.length > 0).length,
          firstNodeWithImages: newFlow.nodes.find(n => n.data.images?.length > 0)
        });

        return newFlow;
      } catch (error) {
        console.error('Error parsing flow content:', error);
        return {
          id: flow.id,
          name: flow.name,
          nodes: [],
          edges: [],
          color: flow.color,
          onePageMode: flow.onePageMode,
          variables: [],
          version: flow.version,
          isPublished: flow.isPublished,
          publishedAt: flow.publishedAt,
          activeVersionId: flow.activeVersionId,
        };
      }
    }),
  };

  console.log('Transformed project:', {
    projectId: transformedProject.id,
    flowCount: transformedProject.flows.length,
    flowsWithNodes: transformedProject.flows.map(f => ({
      flowId: f.id,
      nodeCount: f.nodes.length,
      nodesWithImages: f.nodes.filter(n => n.data.images?.length > 0).length
    }))
  });

  return NextResponse.json(transformedProject);
} 