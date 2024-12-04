import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body?.content || !body?.projectId) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required content or projectId" 
      }, { status: 400 });
    }

    const flowsToSave = Array.isArray(body.content) ? body.content : [body.content];
    const results = [];

    for (const flow of flowsToSave) {
      try {
        const flowData = {
          name: flow.name || "New Flow",
          content: flow.content, // Already stringified from the client
          onePageMode: flow.onePageMode || false,
          isPublished: false,
          version: 1,
          color: flow.color || "#80B500",
          projectId: body.projectId
        };

        let result;
        const existingFlow = await prisma.flow.findUnique({
          where: { id: flow.id }
        });

        if (existingFlow) {
          result = await prisma.flow.update({
            where: { id: flow.id },
            data: flowData
          });
        } else {
          result = await prisma.flow.create({
            data: {
              id: flow.id,
              ...flowData
            }
          });
        }

        results.push(result);
      } catch (error) {
        console.error(`Error processing flow ${flow.id}:`, error);
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Flows saved successfully",
      flows: results
    });

  } catch (error) {
    console.error("Save-chart error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}