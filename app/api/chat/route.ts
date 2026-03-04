import { NextRequest, NextResponse } from 'next/server'
import { agents, getDeviceHost, type DeviceId } from '@/lib/agents'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentName, message } = body

    if (!agentName || !message) {
      return NextResponse.json(
        { error: 'agentName and message are required' },
        { status: 400 }
      )
    }

    const agent = agents.find(
      a => a.name.toLowerCase() === agentName.toLowerCase()
    )

    if (!agent) {
      return NextResponse.json(
        { error: `Agent "${agentName}" not found` },
        { status: 404 }
      )
    }

    const host = getDeviceHost(agent.device)

    // System prompt that gives the agent its personality
    const systemPrompt = `You are ${agent.name}, a ${agent.role} on the BlackRoad AI team (${agent.team} team). You are running on device "${agent.device}" using model "${agent.model}". Stay in character. Be helpful and concise.`

    try {
      // Call Ollama API on the target Raspberry Pi
      const ollamaResponse = await fetch(`${host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: agent.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!ollamaResponse.ok) {
        throw new Error(`Ollama returned ${ollamaResponse.status}`)
      }

      const data = await ollamaResponse.json()

      return NextResponse.json({
        agent: agent.name,
        device: agent.device,
        model: agent.model,
        content: data.message?.content || 'No response from model',
      })
    } catch (ollamaError) {
      // If Pi is unreachable, return a clear error (not a fake response)
      const errorMessage =
        ollamaError instanceof Error ? ollamaError.message : 'Unknown error'
      return NextResponse.json(
        {
          error: `Cannot reach ${agent.device} (${host}): ${errorMessage}`,
          agent: agent.name,
          device: agent.device,
          offline: true,
        },
        { status: 503 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
