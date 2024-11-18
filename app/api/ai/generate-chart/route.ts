import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { description } = await request.json();
    const chartId = uuidv4();

    const prompt = `
    Generate a questionnaire flow chart about: "${description}"
    
    MANDATORY STRUCTURE:
    - Minimum nodes: 1 startNode, 3 question nodes, 1 endNode
    - All nodes must connect to an endNode
    - No empty arrays or missing properties
    - All properties must match examples exactly
    
    CRITICAL FLOW RULES:
    1. Start: startNode at {x: 500, y: 100}
    2. End: At least one endNode
    3. Connections: Every node must have path to endNode
    4. NO DEAD ENDS ALLOWED - every branch must reach endNode
    5. Node IDs: "{nodeType}-{randomString}" format (e.g. "yesNo-x7k2p9")
    6. Instance ID: All nodes must include instanceId: "${chartId}"
    
    POSITIONING:
    - Vertical spacing: ~200px
    - Horizontal spacing: ~300px
    - Main flow: x ≈ 500
    - Left branches: x ≈ 200
    - Right branches: x ≈ 800
    - All coordinates must be positive
    
    NODE SPECIFICATIONS:
    
    startNode:
    {
      id: "startNode-{random}",
      type: "startNode",
      position: {x: 500, y: 100},
      data: {
        label: "Start",
        instanceId: "${chartId}",
        options: [{ label: "DEFAULT", nextNodeId: null }]
      },
      style: { background: "#ecfdf5", borderColor: "#6ee7b7" },
      width: 226,
      height: 153
    }
    
    yesNo:
    {
      id: "yesNo-{random}",
      type: "yesNo",
      data: {
        label: "yesNo node",
        instanceId: "${chartId}",
        question: "Question text",
        options: [
          { label: "yes", nextNodeId: "target-id" },
          { label: "no", nextNodeId: "target-id" }
        ]
      },
      width: 226,
      height: 217
    }
    
    singleChoice:
    {
      id: "singleChoice-{random}",
      type: "singleChoice",
      data: {
        label: "singleChoice node",
        instanceId: "${chartId}",
        question: "Question text",
        options: [
          { id: "{uuid}", label: "Option", nextNodeId: "target-id" }
        ]
      },
      width: 226,
      height: [based on options]
    }
    
    multipleChoice:
    {
      id: "multipleChoice-{random}",
      type: "multipleChoice",
      data: {
        label: "multipleChoice node",
        instanceId: "${chartId}",
        question: "Question text",
        options: [{ id: "{uuid}", label: "Option" }],
        nextNodeId: "target-id"
      },
      width: 288,
      height: [based on options]
    }
    
    weightNode:
    {
      id: "weightNode-{random}",
      type: "weightNode",
      data: {
        label: "weightNode node",
        instanceId: "${chartId}",
        weight: [1-10],
        nextNodeId: "target-id",
        options: [{ label: "DEFAULT", nextNodeId: "target-id" }]
      },
      width: 260,
      height: 175
    }
    
    functionNode:
    {
      id: "functionNode-{random}",
      type: "functionNode",
      data: {
        label: "functionNode node",
        instanceId: "${chartId}",
        variableScope: "local",
        selectedVariable: "",
        sequences: [],
        handles: ["default"]
      },
      width: 275,
      height: 331
    }
    
    endNode:
    {
      id: "endNode-{random}",
      type: "endNode",
      data: {
        label: "End",
        instanceId: "${chartId}",
        endType: "end",
        redirectTab: ""
      },
      style: { background: "#fef2f2", borderColor: "#fca5a5" },
      width: 233,
      height: 243
    }
    
    EDGE REQUIREMENTS:
    {
      id: "reactflow__edge-{sourceId}-{sourceHandle}-{targetId}",
      animated: true,
      style: { stroke: "#94a3b8", strokeWidth: 2 },
      source: "source-id",
      sourceHandle: [
        yesNo: "yes"/"no",
        singleChoice: "{optionId}-target",
        functionNode: "handle-id",
        others: null
      ],
      target: "target-id",
      targetHandle: null,
      type: "editableEdge"
    }
    
    Return format:
    {
      id: "${chartId}",
      name: "${description} Flow",
      nodes: [Nodes as specified above],
      edges: [Edges as specified above],
      color: "#721d62",
      onePageMode: false,
      publishedVersions: [],
      variables: []
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a flow chart generator that creates questionnaire flows. Generate ONLY valid JSON following the exact node and edge specifications. Every node must connect to the final end node through some path.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content received from OpenAI" },
        { status: 500 }
      );
    }

    const chart = JSON.parse(content);
    return NextResponse.json(chart);
  } catch (error) {
    console.error("Error generating chart:", error);
    return NextResponse.json(
      { error: "Failed to generate chart" },
      { status: 500 }
    );
  }
}
