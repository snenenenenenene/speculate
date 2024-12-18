import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;

    // Fetch the project with its active flows
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        flows: {
          where: {
            versions: {
              some: {
                isActive: true,
              },
            },
          },
          include: {
            versions: {
              where: {
                isActive: true,
              },
              take: 1,
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
      flows: project.flows.map(flow => ({
        id: flow.id,
        name: flow.name,
        description: flow.description,
        content: flow.versions[0]?.content,
        version: flow.versions[0]?.version,
      })),
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error('Error fetching published project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
} 