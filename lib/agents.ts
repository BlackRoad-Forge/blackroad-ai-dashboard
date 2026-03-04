// Agent definitions and Pi device mapping
// Each device is a Raspberry Pi running Ollama

export interface Agent {
  name: string
  emoji: string
  role: string
  device: DeviceId
  model: string
  team: TeamName
}

export type DeviceId = 'lucidia' | 'cecilia' | 'aria'
export type TeamName = 'Infrastructure' | 'Creative' | 'Coding'

// Map device names to Pi network addresses
// Configure these in .env or they default to local network
export const DEVICE_HOSTS: Record<DeviceId, string> = {
  lucidia: process.env.PI_LUCIDIA_HOST || 'http://lucidia.local:11434',
  cecilia: process.env.PI_CECILIA_HOST || 'http://cecilia.local:11434',
  aria: process.env.PI_ARIA_HOST || 'http://aria.local:11434',
}

export const agents: Agent[] = [
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

export function getAgent(name: string): Agent | undefined {
  return agents.find(a => a.name.toLowerCase() === name.toLowerCase())
}

export function getAgentsByTeam(team: TeamName): Agent[] {
  return agents.filter(a => a.team === team)
}

export function getDeviceHost(device: DeviceId): string {
  return DEVICE_HOSTS[device]
}
