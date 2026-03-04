'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Agent {
  name: string
  emoji: string
  role: string
  device: string
  model: string
  team: string
}

interface ChatMessage {
  agent: string
  content: string
  error?: boolean
  timestamp: number
}

interface DeviceStatus {
  device: string
  online: boolean
  latencyMs: number | null
}

interface AgentStatus {
  name: string
  online: boolean
  modelAvailable: boolean
}

interface StatusResponse {
  devices: DeviceStatus[]
  agents: AgentStatus[]
  summary: { onlineAgents: number; devicesOnline: number; totalAgents: number; totalDevices: number }
}

interface Plan {
  name: string
  price: number
  agents: number
  messagesPerDay: number
  features: string[]
}

// ─── Agent Data ──────────────────────────────────────────────────────────────

const agents: Agent[] = [
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

const plans: Record<string, Plan> = {
  free: { name: 'Free', price: 0, agents: 1, messagesPerDay: 10, features: ['1 agent access', '10 messages/day', 'Community support'] },
  pro: { name: 'Pro', price: 19, agents: 5, messagesPerDay: 500, features: ['5 agent access', '500 messages/day', 'Priority support', 'API access'] },
  enterprise: { name: 'Enterprise', price: 49, agents: 9, messagesPerDay: -1, features: ['All 9 agents', 'Unlimited messages', 'Dedicated support', 'Custom models', 'SLA guarantee'] },
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0])
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'pricing'>('dashboard')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  // ─── Fetch agent/device status ─────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/status')
      if (res.ok) {
        const data: StatusResponse = await res.json()
        setStatus(data)
      }
    } catch {
      // Status check failed silently - devices might be offline
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  // ─── Chat with real Pi backend ─────────────────────────────────────────────

  const handleSend = async () => {
    if (!message.trim() || loading) return

    const userMessage: ChatMessage = { agent: 'You', content: message, timestamp: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName: selectedAgent.name, message: message }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessages(prev => [...prev, {
          agent: selectedAgent.name,
          content: data.content,
          timestamp: Date.now(),
        }])
      } else {
        setMessages(prev => [...prev, {
          agent: 'System',
          content: data.error || `${selectedAgent.name} is unreachable. Device "${selectedAgent.device}" may be offline.`,
          error: true,
          timestamp: Date.now(),
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        agent: 'System',
        content: 'Network error: Could not reach the server. Check your connection.',
        error: true,
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  // ─── Stripe checkout ──────────────────────────────────────────────────────

  const handleCheckout = async (planId: string) => {
    if (planId === 'free') return
    setCheckoutLoading(planId)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Checkout failed. Is Stripe configured?')
      }
    } catch {
      alert('Could not connect to payment server.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  // ─── Helper: get agent online status ───────────────────────────────────────

  const isAgentOnline = (name: string): boolean | null => {
    if (!status) return null
    const agentStatus = status.agents.find(a => a.name === name)
    return agentStatus?.online ?? null
  }

  const getDeviceStatus = (device: string): DeviceStatus | undefined => {
    return status?.devices.find(d => d.device === device)
  }

  // ─── Render helpers ────────────────────────────────────────────────────────

  const teamAgents: Record<string, Agent[]> = {
    Infrastructure: agents.filter(a => a.team === 'Infrastructure'),
    Creative: agents.filter(a => a.team === 'Creative'),
    Coding: agents.filter(a => a.team === 'Coding'),
  }

  const teamIcons: Record<string, string> = { Infrastructure: '🏢', Creative: '🎨', Coding: '💻' }

  const statusDot = (agentName: string) => {
    const online = isAgentOnline(agentName)
    const color = online === null ? '#666' : online ? '#00ff00' : '#ff4444'
    return <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
  }

  // ─── Layout ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BlackRoad AI Network
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>
          {status ? `${status.summary.onlineAgents}/${status.summary.totalAgents} Agents Online` : '9 AI Agents'} · {status ? `${status.summary.devicesOnline}/${status.summary.totalDevices} Devices` : '3 Devices'} · Raspberry Pi Mesh
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['dashboard', 'chat', 'pricing'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            data-testid={`tab-${tab}`}
            style={{
              background: activeTab === tab ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#1a1a1a',
              border: activeTab === tab ? 'none' : '1px solid #333',
              borderRadius: 8,
              padding: '0.75rem 1.5rem',
              color: 'white',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '0.95rem',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Dashboard Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div data-testid="dashboard-view">
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'AGENTS', value: status ? `${status.summary.onlineAgents}/${status.summary.totalAgents}` : '9', color: '#667eea' },
              { label: 'DEVICES', value: status ? `${status.summary.devicesOnline}/${status.summary.totalDevices}` : '3', color: '#667eea' },
              { label: 'STATUS', value: status ? (status.summary.devicesOnline === status.summary.totalDevices ? 'ALL UP' : 'PARTIAL') : 'CHECKING', color: status?.summary.devicesOnline === status?.summary.totalDevices ? '#00ff00' : '#ffaa00' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                <div style={{ color: '#888', fontSize: '0.85rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Device Status */}
          {status && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#667eea', marginBottom: '1rem' }}>Device Health</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {status.devices.map(device => (
                  <div key={device.device} style={{ background: '#1a1a1a', border: `1px solid ${device.online ? '#333' : '#ff4444'}`, borderRadius: 12, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{device.device}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {device.latencyMs !== null && <span style={{ color: '#666', fontSize: '0.8rem' }}>{device.latencyMs}ms</span>}
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: device.online ? '#00ff00' : '#ff4444' }} />
                      </div>
                    </div>
                    <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      {device.online ? 'Online - Ollama responding' : 'Offline - Check Pi connection'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Teams */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(teamAgents).map(([teamName, teamMembers]) => (
              <div key={teamName} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', color: '#667eea', marginBottom: '1rem' }}>
                  {teamIcons[teamName]} {teamName} Team
                </h2>
                {teamMembers.map(agent => (
                  <div
                    key={agent.name}
                    onClick={() => { setSelectedAgent(agent); setActiveTab('chat') }}
                    data-testid={`agent-card-${agent.name}`}
                    style={{
                      background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                      padding: '0.85rem', marginBottom: '0.75rem', cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>{agent.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{agent.name}</div>
                        <div style={{ color: '#888', fontSize: '0.8rem' }}>{agent.role}</div>
                        <div style={{ color: '#555', fontSize: '0.75rem' }}>{agent.model} · {agent.device}</div>
                      </div>
                      {statusDot(agent.name)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Chat Tab ───────────────────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div data-testid="chat-view" style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Agent Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {agents.map(agent => (
              <button
                key={agent.name}
                onClick={() => { setSelectedAgent(agent); setMessages([]) }}
                data-testid={`chat-agent-${agent.name}`}
                style={{
                  background: selectedAgent.name === agent.name ? '#667eea' : '#1a1a1a',
                  border: selectedAgent.name === agent.name ? '1px solid #667eea' : '1px solid #333',
                  borderRadius: 20,
                  padding: '0.4rem 0.8rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}
              >
                <span>{agent.emoji}</span> {agent.name}
              </button>
            ))}
          </div>

          {/* Selected Agent Info */}
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{selectedAgent.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedAgent.name}</div>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>{selectedAgent.role} · {selectedAgent.team} Team</div>
                <div style={{ color: '#555', fontSize: '0.8rem' }}>
                  {selectedAgent.model} on {selectedAgent.device}
                  {status && (() => {
                    const ds = getDeviceStatus(selectedAgent.device)
                    return ds ? (ds.online ? ` · ${ds.latencyMs}ms` : ' · OFFLINE') : ''
                  })()}
                </div>
              </div>
              {statusDot(selectedAgent.name)}
            </div>
          </div>

          {/* Messages */}
          <div data-testid="chat-messages" style={{
            height: 400, overflowY: 'auto', padding: '1rem', background: '#0a0a0a',
            border: '1px solid #222', borderRadius: 12, marginBottom: '1rem',
          }}>
            {messages.length === 0 ? (
              <div style={{ color: '#555', textAlign: 'center', padding: '4rem 1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedAgent.emoji}</div>
                <div>Send a message to talk to {selectedAgent.name} on {selectedAgent.device}</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#444' }}>
                  Messages are routed to the Raspberry Pi running Ollama
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{
                  marginBottom: '0.75rem', padding: '0.75rem', borderRadius: 8,
                  background: msg.agent === 'You' ? '#1a1a3a' : msg.error ? '#3a1a1a' : '#1a1a1a',
                  borderLeft: msg.error ? '3px solid #ff4444' : 'none',
                }}>
                  <div style={{
                    color: msg.agent === 'You' ? '#8888ff' : msg.error ? '#ff6666' : '#667eea',
                    fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.3rem',
                  }}>
                    {msg.agent}
                  </div>
                  <div style={{ color: '#ddd', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div style={{ padding: '0.75rem', color: '#667eea', fontSize: '0.9rem' }}>
                {selectedAgent.name} is thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={`Message ${selectedAgent.name}...`}
              disabled={loading}
              data-testid="chat-input"
              style={{
                flex: 1, background: '#0a0a0a', border: '1px solid #333', borderRadius: 8,
                padding: '0.85rem 1rem', color: 'white', fontSize: '1rem',
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              data-testid="chat-send"
              style={{
                background: loading ? '#444' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none', borderRadius: 8, padding: '0.85rem 1.5rem',
                color: 'white', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Pricing Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'pricing' && (
        <div data-testid="pricing-view" style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Plans</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '2rem' }}>
            Access BlackRoad&apos;s AI agent mesh network
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(plans).map(([id, plan]) => (
              <div
                key={id}
                data-testid={`plan-${id}`}
                style={{
                  background: '#1a1a1a',
                  border: id === 'pro' ? '2px solid #667eea' : '1px solid #333',
                  borderRadius: 16, padding: '2rem', position: 'relative',
                }}
              >
                {id === 'pro' && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '0.25rem 1rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 'bold',
                  }}>
                    POPULAR
                  </div>
                )}
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>${plan.price}</span>
                  {plan.price > 0 && <span style={{ color: '#888' }}>/mo</span>}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                  {plan.features.map(feature => (
                    <li key={feature} style={{ padding: '0.4rem 0', color: '#ccc', fontSize: '0.9rem' }}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(id)}
                  disabled={checkoutLoading !== null}
                  data-testid={`checkout-${id}`}
                  style={{
                    width: '100%',
                    background: id === 'free' ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: id === 'free' ? '1px solid #555' : 'none',
                    borderRadius: 8, padding: '0.85rem', color: 'white', fontWeight: 'bold',
                    cursor: checkoutLoading ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
                  }}
                >
                  {checkoutLoading === id ? 'Redirecting...' : id === 'free' ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem', color: '#555', fontSize: '0.85rem' }}>
            Payments processed securely by Stripe. Cancel anytime.
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #222', color: '#555' }}>
        <p style={{ fontSize: '0.9rem' }}>BlackRoad AI Network · Powered by Raspberry Pi Mesh</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Lucidia · Cecilia · Aria</p>
      </div>
    </div>
  )
}
