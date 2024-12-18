import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;

  // Fetch the project with its published flows
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
          activeVersion: {
            select: {
              content: true,
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
    flows: project.charts.map(flow => ({
      id: flow.id,
      name: flow.name,
      content: flow.activeVersion?.content || flow.content,
      version: flow.version,
    })),
  };

  return NextResponse.json(transformedProject);
} 