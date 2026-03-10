import { NextRequest, NextResponse } from 'next/server'

const DEVICE_HOSTS: Record<string, string> = {
  lucidia: process.env.LUCIDIA_HOST ?? '',
  cecilia: process.env.CECILIA_HOST ?? '',
  aria: process.env.ARIA_HOST ?? '',
}

export async function POST(request: NextRequest) {
  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { message, agentName, agentDevice, agentModel, agentRole } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  const host = DEVICE_HOSTS[agentDevice]

  if (host) {
    try {
      const ollamaRes = await fetch(`http://${host}:11434/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: agentModel,
          prompt: message,
          stream: false,
          system: `You are ${agentName}, a ${agentRole} in the BlackRoad AI Network running on Raspberry Pi. Keep responses concise and helpful.`,
        }),
      })

      if (ollamaRes.ok) {
        const data = await ollamaRes.json()
        return NextResponse.json({ response: data.response, source: 'ollama' })
      }
    } catch {
      // Fall through to demo response
    }
  }

  // Demo response when no backend is configured or request failed
  return NextResponse.json({
    response: `Hello! I'm ${agentName}, your ${agentRole}. I'm running on ${agentDevice} using ${agentModel}. How can I help with BlackRoad today?`,
    source: 'demo',
  })
}
