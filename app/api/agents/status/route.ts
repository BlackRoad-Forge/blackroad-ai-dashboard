import { NextResponse } from 'next/server'
import { agents, getDeviceHost, type DeviceId } from '@/lib/agents'

interface DeviceStatus {
  device: DeviceId
  host: string
  online: boolean
  models: string[]
  latencyMs: number | null
  error?: string
}

async function checkDevice(device: DeviceId): Promise<DeviceStatus> {
  const host = getDeviceHost(device)
  const start = Date.now()

  try {
    const response = await fetch(`${host}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const models = (data.models || []).map((m: { name: string }) => m.name)

    return {
      device,
      host,
      online: true,
      models,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    return {
      device,
      host,
      online: false,
      models: [],
      latencyMs: null,
      error: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

export async function GET() {
  const devices: DeviceId[] = ['lucidia', 'cecilia', 'aria']

  // Check all devices in parallel
  const deviceStatuses = await Promise.all(devices.map(checkDevice))

  // Map agent status based on device status
  const agentStatuses = agents.map(agent => {
    const deviceStatus = deviceStatuses.find(d => d.device === agent.device)
    return {
      name: agent.name,
      role: agent.role,
      team: agent.team,
      device: agent.device,
      model: agent.model,
      online: deviceStatus?.online ?? false,
      modelAvailable: deviceStatus?.models.includes(agent.model) ?? false,
    }
  })

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    devices: deviceStatuses,
    agents: agentStatuses,
    summary: {
      totalAgents: agents.length,
      onlineAgents: agentStatuses.filter(a => a.online).length,
      devicesOnline: deviceStatuses.filter(d => d.online).length,
      totalDevices: devices.length,
    },
  })
}
