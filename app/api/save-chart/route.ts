/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  console.log("Received POST request to /api/save-chart");

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log("Unauthorized access attempt");
      return NextResponse.json(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Authenticated user:", (session.user as any).id);

    const body = await request.json();
    console.log("Received request body:", body);

    if (!body.content || !body.projectId) {
      console.log("Missing required content in request");
      return NextResponse.json(
        { statusCode: 400, message: "Missing required content" },
        { status: 400 }
      );
    }

    console.log("Chart content:", body.content);

    // First, get existing flows for this project
    const existingFlows = await prisma.flow.findMany({
      where: {
        projectId: body.projectId
      }
    });

    // Create a map of existing flows by ID
    const existingFlowMap = new Map(existingFlows.map(flow => [flow.id, flow]));

    // Process each flow in the content array
    const results = await Promise.all(body.content.map(async (flow: any) => {
      const flowExists = existingFlowMap.has(flow.id);

      if (flowExists) {
        // Update existing flow
        return await prisma.flow.update({
          where: {
            id: flow.id
          },
          data: {
            name: flow.name,
            content: JSON.stringify({
              nodes: flow.nodes,
              edges: flow.edges,
            }),
            onePageMode: flow.onePageMode,
            color: flow.color,
          }
        });
      } else {
        // Create new flow
        return await prisma.flow.create({
          data: {
            id: flow.id,
            name: flow.name,
            content: JSON.stringify({
              nodes: flow.nodes,
              edges: flow.edges,
            }),
            onePageMode: flow.onePageMode,
            color: flow.color,
            projectId: body.projectId
          }
        });
      }
    }));

    // Delete flows that no longer exist in the content
    const currentFlowIds = new Set(body.content.map((f: any) => f.id));
    const flowsToDelete = existingFlows.filter(flow => !currentFlowIds.has(flow.id));

    if (flowsToDelete.length > 0) {
      await prisma.flow.deleteMany({
        where: {
          id: {
            in: flowsToDelete.map(f => f.id)
          }
        }
      });
    }

    console.log("Saved flows:", results);

    return NextResponse.json({
      success: true,
      message: "Flows saved successfully",
      flows: results,
    });
  } catch (err: any) {
    console.error("Error in POST route:", err);
    return NextResponse.json(
      { statusCode: 500, message: err.message },
      { status: 500 }
    );
  }
}
