// app/api/turn/route.ts
import { NextResponse } from 'next/server';
import { getAiDecision } from '../../../src/agent/gemini';
import { applyRound } from '../../../src/game/engine';
import { GameState, ActionType, AutonomyLevel, TraceRecord, ActionPayload } from '../../../src/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { state, humanAction, autonomy, apiKey } = body as {
      state: GameState;
      humanAction: ActionType;
      autonomy: AutonomyLevel;
      apiKey: string;
    };

    let aiAction: ActionType = 'SHARE';
    
    // explicitly define type as ActionPayload
    let aiDecision: ActionPayload = { 
      type: 'SHARE', 
      explanation: 'Observer Mode: No AI inference. Defaulting to SHARE.', 
      confidence: 1 
    };

    // skip LLM call if autonomy is 0
    if (autonomy > 0) {
      if (!apiKey) return NextResponse.json({ error: 'API Key is required' }, { status: 401 });
      const decision = await getAiDecision(state, autonomy, apiKey);
      aiDecision = decision;
      aiAction = decision.type;
    }

    const newState = applyRound(state, humanAction, aiAction);

    const trace: TraceRecord = {
      traceId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actor: 'ai',
      autonomyLevel: autonomy,
      stateSummary: state,
      legalActions: ['SHARE', 'STEAL'],
      modelOutput: aiDecision,
      isValidated: true,
    };

    return NextResponse.json({ newState, trace });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Turn failed' }, { status: 500 });
  }
}