import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { nanoid } from "nanoid";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// GET /api/projects/[projectId]/flows
export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        OR: [
          { userId: user.id },
          {
            collaborators: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get all flows for the project
    const flows = await prisma.chartInstance.findMany({
      where: {
        projectId: params.projectId,
        OR: [
          { userId: user.id },
          {
            project: {
              collaborators: {
                some: {
                  userId: user.id
                }
              }
            }
          }
        ]
      },
      include: {
        versions: {
          orderBy: {
            version: 'desc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Process each flow to extract variables from content and format versions
    const processedFlows = flows.map(flow => {
      let variables = [];
      if (flow.content) {
        try {
          const contentObj = JSON.parse(flow.content);
          if (contentObj && Array.isArray(contentObj.variables)) {
            variables = contentObj.variables;
          }
        } catch (err) {
          console.error('Error parsing flow content:', err);
        }
      }
      
      // Format versions data
      const formattedVersions = flow.versions?.map(version => ({
        id: version.id,
        version: version.version,
        name: version.name,
        content: version.content,
        metadata: version.metadata,
        createdAt: version.createdAt,
        publishedAt: version.publishedAt,
        createdBy: {
          id: version.user.id,
          name: version.user.name,
          email: version.user.email
        }
      })) || [];

      return {
        ...flow,
        variables,
        versions: formattedVersions
      };
    });

    console.log('API: Returning flows with variables and versions:', processedFlows);
    return NextResponse.json({ flows: processedFlows });
  } catch (error) {
    console.error("Error fetching flows:", error);
    return NextResponse.json(
      { error: "Failed to fetch flows" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/flows - Create new flow
export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, id } = await req.json();

    // Create a new flow with basic structure
    const flow = await prisma.chartInstance.create({
      data: {
        id: id || nanoid(), // Use provided ID or generate a new one
        name: name || `Flow ${new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })}`,
        content: JSON.stringify({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 }
        }),
        project: {
          connect: {
            id: params.projectId
          }
        },
        user: {
          connect: {
            email: user.email
          }
        }
      }
    });

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error creating flow:", error);
    return NextResponse.json(
      { error: "Failed to create flow" },
      { status: 500 }
    );
  }
}