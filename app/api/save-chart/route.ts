import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  console.log("=== Save Chart API Called ===");
  
  try {
    // 1. Check Authentication
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user) {
      console.log("Authentication failed - no session");
      return new NextResponse(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Parse Request Body
    const body = await request.json();
    console.log("Request body projectId:", body.projectId);
    console.log("Request body content length:", body.content?.length);

    if (!body.content || !body.projectId) {
      console.log("Missing required fields:", { 
        hasContent: !!body.content, 
        hasProjectId: !!body.projectId 
      });
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: "Missing required content or projectId" 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 3. Process Flows
    const flowsToSave = Array.isArray(body.content) ? body.content : [body.content];
    console.log(`Processing ${flowsToSave.length} flows`);

    const results = [];
    for (const flow of flowsToSave) {
      console.log(`Processing flow: ${flow.id}`);
      
      try {
        const flowData = {
          name: flow.name,
          content: JSON.stringify({
            id: flow.id,
            name: flow.name,
            nodes: flow.nodes || [],
            edges: flow.edges || [],
            color: flow.color || "#80B500",
            onePageMode: flow.onePageMode || false,
            publishedVersions: flow.publishedVersions || [],
            variables: flow.variables || []
          }),
          onePageMode: flow.onePageMode || false,
          isPublished: false,
          version: 1,
          color: flow.color || "#80B500",
          projectId: body.projectId
        };

        // Check for existing flow
        const existingFlow = await prisma.flow.findUnique({
          where: { id: flow.id }
        });

        let result;
        if (existingFlow) {
          console.log(`Updating existing flow: ${flow.id}`);
          result = await prisma.flow.update({
            where: { id: flow.id },
            data: flowData
          });
        } else {
          console.log(`Creating new flow: ${flow.id}`);
          result = await prisma.flow.create({
            data: {
              id: flow.id,
              ...flowData
            }
          });
        }

        results.push(result);
        console.log(`Successfully processed flow: ${flow.id}`);
      } catch (error) {
        console.error(`Error processing flow ${flow.id}:`, error);
        throw error;
      }
    }

    // 4. Send Response
    console.log(`Successfully processed all flows. Sending response.`);
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Flows saved successfully",
        flows: results
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Save-chart error:", error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}