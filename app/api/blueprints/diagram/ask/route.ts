/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { geminiRegistry } from '@/lib/gemini';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';

import { rateLimit, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const ASK_SYSTEM_PROMPT = `You are a senior system architect explaining a technology stack and system architecture to a developer.
The developer is asking a question about a specific component (node) in their architecture or the diagram as a whole.

You have access to:
- The context map (what they are building, their scale, budget, team, skills, constraints).
- The full chat history leading up to this architecture.
- The diagram nodes and edges.

Your response must be:
- Practical, technical, direct, and honest (opinionated by default).
- Focused specifically on the node or the diagram aspect in question.
- Formatted with clean markdown (lists, bold, tables where appropriate).
- Explained like a senior engineer over coffee — concise, clear, and high-signal, avoiding fluff.`;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limitRes = await rateLimit(ip, 'diagram_ask', 15, 60);
  if (!limitRes.success) {
    return createRateLimitResponse(limitRes.reset);
  }

  try {
    const body = await req.json();
    const { blueprintId, nodeId, question } = body;

    if (!blueprintId || !question) {
      return NextResponse.json({ error: 'Missing blueprintId or question' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(blueprints)
      .where(eq(blueprints.id, blueprintId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }

    const blueprint = result[0];
    const currentGraph = blueprint.diagramGraph as any;

    let targetNodeData = null;
    if (nodeId && currentGraph?.nodes) {
      const node = currentGraph.nodes.find((n: any) => n.id === nodeId);
      if (node) {
        targetNodeData = node.data;
      }
    }

    const prompt = `
Question from Developer: "${question}"

${
  nodeId
    ? `Target Node in Question: ${nodeId} (${targetNodeData ? targetNodeData.label : 'Unknown'})
Node Metadata:
- Category: ${targetNodeData?.category || 'N/A'}
- Why Chosen: ${targetNodeData?.why || 'N/A'}
- Free Tier Limits: ${targetNodeData?.free_tier || 'N/A'}
- Cost at Scale: ${targetNodeData?.cost_at_scale || 'N/A'}
- Upgrade Signal: ${targetNodeData?.upgrade_signal || 'N/A'}
- Alternatives: ${targetNodeData?.alternatives?.join(', ') || 'None'}`
    : 'This is a general question about the overall architecture diagram.'
}

Full Context Map:
${JSON.stringify(blueprint.contextMap, null, 2)}

Current Diagram Graph:
${JSON.stringify(currentGraph, null, 2)}

Last few messages in chat history:
${JSON.stringify(blueprint.chatHistory?.slice(-6) || [], null, 2)}

Please provide a highly useful, concise response answering the developer's question in this exact architecture context.
`;

    const currentKey = geminiRegistry.acquireKey();
    const google = createGoogleGenerativeAI({ apiKey: currentKey.key });

    const response = await generateText({
      model: google('gemini-2.5-flash'),
      system: ASK_SYSTEM_PROMPT,
      prompt,
    });

    return NextResponse.json({ answer: response.text });
  } catch (error) {
    console.error('Error answering diagram question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
