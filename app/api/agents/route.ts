import { NextResponse } from 'next/server'

export type Agent = {
  name: string
  emoji: string
  role: string
  device: string
  model: string
  team: string
  online: boolean
  hasBackend: boolean
}

const AGENTS: Omit<Agent, 'online' | 'hasBackend'>[] = [
  { name: 'Lucidia', emoji: '🖤', role: 'Systems Lead', device: 'lucidia', model: 'tinyllama', team: 'Infrastructure' },
  { name: 'Marcus', emoji: '👔', role: 'Product Manager', device: 'lucidia', model: 'llama3.2:3b', team: 'Infrastructure' },
  { name: 'Viktor', emoji: '💪', role: 'Senior Developer', device: 'lucidia', model: 'codellama:7b', team: 'Infrastructure' },
  { name: 'Sophia', emoji: '📊', role: 'Data Analyst', device: 'lucidia', model: 'gemma2:2b', team: 'Infrastructure' },
  { name: 'CECE', emoji: '💜', role: 'Creative Lead', device: 'cecilia', model: 'cece', team: 'Creative' },
  { name: 'Luna', emoji: '🌙', role: 'UX Designer', device: 'cecilia', model: 'llama3.2:3b', team: 'Creative' },
  { name: 'Dante', emoji: '⚡', role: 'Backend Engineer', device: 'cecilia', model: 'codellama:7b', team: 'Creative' },
  { name: 'Aria-Prime', emoji: '🎯', role: 'Code Specialist', device: 'aria', model: 'qwen2.5-coder:3b', team: 'Coding' },
  { name: 'Aria-Tiny', emoji: '⚡', role: 'Quick Responder', device: 'aria', model: 'tinyllama', team: 'Coding' },
]

const DEVICE_HOSTS: Record<string, string> = {
  lucidia: process.env.LUCIDIA_HOST ?? '',
  cecilia: process.env.CECILIA_HOST ?? '',
  aria: process.env.ARIA_HOST ?? '',
}

async function isDeviceOnline(device: string): Promise<boolean> {
  const host = DEVICE_HOSTS[device]
  if (!host) return false
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`http://${host}:11434/`, { signal: controller.signal })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}

export async function GET() {
  const devices = Object.keys(DEVICE_HOSTS)
  const statuses: Record<string, boolean> = {}

  await Promise.all(
    devices.map(async (device) => {
      statuses[device] = await isDeviceOnline(device)
    })
  )

  const agents: Agent[] = AGENTS.map((agent) => ({
    ...agent,
    hasBackend: Boolean(DEVICE_HOSTS[agent.device]),
    online: statuses[agent.device] ?? false,
  }))

  return NextResponse.json({ agents, deviceStatuses: statuses })
}
