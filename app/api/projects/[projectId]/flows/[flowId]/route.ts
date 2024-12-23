import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../auth/[...nextauth]/options";

export async function GET(
  request: Request,
  context: { params: { projectId: string; flowId: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get both flow and project data
    const [flow, project] = await Promise.all([
      prisma.chartInstance.findFirst({
        where: {
          id: context.params.flowId,
          projectId: context.params.projectId,
          user: {
            email: session.user.email
          }
        }
      }),
      prisma.project.findUnique({
        where: {
          id: context.params.projectId,
          user: {
            email: session.user.email
          }
        }
      })
    ]);

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    console.log('API GET flow - Full project data:', JSON.stringify(project, null, 2));

    // Extract local variables from flow content
    let variables = [];
    if (flow.content) {
      try {
        const contentObj = JSON.parse(flow.content);
        if (contentObj && Array.isArray(contentObj.variables)) {
          // Ensure local scope is set
          variables = contentObj.variables.map(v => ({
            ...v,
            scope: 'local'
          }));
        }
      } catch (err) {
        console.error('Error parsing flow content:', err);
      }
    }

    // Get global variables from project and ensure scope is set
    const globalVariables = (project.variables || []).map(v => ({
      ...v,
      scope: 'global'
    }));

    const processedFlow = {
      ...flow,
      variables,
      globalVariables
    };

    console.log('API GET flow - Full response data:', JSON.stringify({ flow: processedFlow }, null, 2));
    
    return NextResponse.json({ 
      flow: {
        ...flow,
        variables,
        globalVariables
      }
    });
  } catch (error) {
    console.error("Error fetching flow:", error);
    return NextResponse.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
}

// PUT endpoint for saving flow data (nodes/edges)
export async function PUT(
  req: Request,
  { params }: { params: { projectId: string; flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log('API PUT: Received flow data:', JSON.stringify(body, null, 2));

    // Get current flow to preserve any fields not being updated
    const currentFlow = await prisma.chartInstance.findUnique({
      where: { id: params.flowId }
    });

    if (!currentFlow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    // Update the flow with new data
    const flow = await prisma.chartInstance.update({
      where: {
        id: params.flowId,
        projectId: params.projectId,
        user: { email: session.user.email }
      },
      data: {
        content: body.content,
        name: body.name || currentFlow.name,
        color: body.color || currentFlow.color,
        onePageMode: body.onePageMode ?? currentFlow.onePageMode,
        updatedAt: new Date()
      }
    });

    console.log('API PUT: Updated flow:', JSON.stringify(flow, null, 2));
    return NextResponse.json({ flow });
  } catch (error) {
    console.error("API PUT: Error:", error);
    return NextResponse.json(
      { error: "API error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH endpoint for updating flow settings
export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string; flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log('API PATCH: Received body:', JSON.stringify(body, null, 2));
    
    const { name, color, onePageMode, content, variables } = body;

    // Get the current flow to preserve content
    const currentFlow = await prisma.chartInstance.findUnique({
      where: { id: params.flowId }
    });

    let currentContent = {};
    if (currentFlow?.content) {
      try {
        currentContent = JSON.parse(currentFlow.content);
        console.log('API PATCH: Current content:', JSON.stringify(currentContent, null, 2));
      } catch (err) {
        console.error('API PATCH: Error parsing current content:', err);
      }
    }

    // Preserve nodes/edges and update variables
    const newContent = {
      ...currentContent,
      variables: variables || [],
      ...(content ? JSON.parse(content) : {})
    };

    console.log('API PATCH: New content:', JSON.stringify(newContent, null, 2));

    const updateData: any = {
      updatedAt: new Date(),
      content: JSON.stringify(newContent)
    };

    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (onePageMode !== undefined) updateData.onePageMode = onePageMode;

    console.log('API PATCH: Update data:', JSON.stringify(updateData, null, 2));

    const flow = await prisma.chartInstance.update({
      where: {
        id: params.flowId,
        projectId: params.projectId,
        user: { email: session.user.email }
      },
      data: updateData
    });

    // Parse content for response
    let responseFlow = { ...flow };
    if (flow.content) {
      try {
        const contentObj = JSON.parse(flow.content);
        responseFlow = {
          ...flow,
          variables: contentObj.variables || []
        };
      } catch (err) {
        console.error('API PATCH: Error parsing response content:', err);
        responseFlow = {
          ...flow,
          variables: variables || []
        };
      }
    }
    
    console.log('API PATCH: Response:', JSON.stringify(responseFlow, null, 2));
    return NextResponse.json({ flow: responseFlow });
  } catch (error) {
    console.error("API PATCH: Error:", error);
    return NextResponse.json(
      { error: "API error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.chartInstance.delete({
      where: {
        id: params.flowId,
        projectId: params.projectId,
        user: {
          email: session.user.email
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flow:", error);
    return NextResponse.json(
      { error: "Failed to delete flow" },
      { status: 500 }
    );
  }
}