import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { description } = await request.json(); // Default to 10 nodes if not specified
    console.log(description);
    const chartId = uuidv4();

    const prompt = `
    Generate a questionnaire flow chart about: "${description}"
    
    ### MANDATORY STRUCTURE:
    - Target node count: get the total node count from the description if not mentioned default to 10: ${description} (Ensure the total nodes match this count as closely as possible.)
    - Minimum nodes: 1 startNode, 1 endNode
    - Include various node types (yesNo, singleChoice, multipleChoice, weightNode, functionNode) to diversify the questionnaire.
    - All nodes must connect to an endNode.
    - No empty arrays or missing properties.
    - All properties must match examples exactly.

    ### CRITICAL FLOW RULES:
    1. Start: The flow must start with a startNode at {x: 500, y: 100}.
    2. End: At least one endNode is required.
    3. Connections: Every node must have a valid path to an endNode. No dead ends are allowed.
    4. Node IDs: Use the format "{nodeType}-{randomString}" (e.g., "yesNo-x7k2p9").
    5. Instance ID: All nodes must include the instanceId "${chartId}".

    ### POSITIONING:
    - Vertical spacing: ~200px between nodes.
    - Horizontal spacing: ~300px between branches.
    - Main flow: Nodes in the main branch should align approximately at x ≈ 500.
    - Left branches: Nodes branching left should align at x ≈ 200.
    - Right branches: Nodes branching right should align at x ≈ 800.
    - Ensure no nodes overlap by dynamically adjusting coordinates.

    ### NODE SPECIFICATIONS:
    - startNode:
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

    - yesNo:
      {
        id: "yesNo-{random}",
        type: "yesNo",
        data: {
          label: "Yes/No Question",
          instanceId: "${chartId}",
          question: "Question text",
          options: [
            { label: "Yes", nextNodeId: "target-id" },
            { label: "No", nextNodeId: "target-id" }
          ]
        },
        width: 226,
        height: 217
      }

    - singleChoice:
      {
        id: "singleChoice-{random}",
        type: "singleChoice",
        data: {
          label: "Single Choice Question",
          instanceId: "${chartId}",
          question: "Choose one option:",
          options: [
            { id: "{uuid}", label: "Option", nextNodeId: "target-id" }
          ]
        },
        width: 226,
        height: [based on options]
      }

    - multipleChoice:
      {
        id: "multipleChoice-{random}",
        type: "multipleChoice",
        data: {
          label: "Multiple Choice Question",
          instanceId: "${chartId}",
          question: "Select all that apply:",
          options: [{ id: "{uuid}", label: "Option" }],
          nextNodeId: "target-id"
        },
        width: 288,
        height: [based on options]
      }

    - weightNode:
      {
        id: "weightNode-{random}",
        type: "weightNode",
        data: {
          label: "Weight Node",
          instanceId: "${chartId}",
          weight: 5,
          nextNodeId: "target-id",
          options: [{ label: "DEFAULT", nextNodeId: "target-id" }]
        },
        width: 260,
        height: 175
      }

    - functionNode:
      {
        id: "functionNode-{random}",
        type: "functionNode",
        data: {
          label: "Function Node",
          instanceId: "${chartId}",
          variableScope: "local",
          selectedVariable: "",
          sequences: [],
          handles: ["default"]
        },
        width: 275,
        height: 331
      }

    - endNode:
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

    ### EDGE REQUIREMENTS:
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

    ### RETURN FORMAT:
    {
      id: "${chartId}",
      name: "${description} Flow",
      nodes: [Array of nodes, matching the target node count],
      edges: [Array of edges],
      color: "#721d62",
      onePageMode: false,
      publishedVersions: [],
      variables: []
    }
    `;

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
