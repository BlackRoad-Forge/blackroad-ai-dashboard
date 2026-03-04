import { test, expect } from '@playwright/test'

test.describe('API Routes', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(body.service).toBe('blackroad-ai-dashboard')
    expect(body.version).toBe('2.0.0')
    expect(body.timestamp).toBeTruthy()
  })

  test('GET /api/agents/status returns agent data', async ({ request }) => {
    const response = await request.get('/api/agents/status')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.agents).toHaveLength(9)
    expect(body.devices).toHaveLength(3)
    expect(body.summary.totalAgents).toBe(9)
    expect(body.summary.totalDevices).toBe(3)
  })

  test('POST /api/chat rejects missing fields', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { agentName: 'Lucidia' },
    })
    expect(response.status()).toBe(400)
  })

  test('POST /api/chat rejects unknown agent', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { agentName: 'NonExistent', message: 'hello' },
    })
    expect(response.status()).toBe(404)
  })

  test('POST /api/stripe/checkout rejects invalid plan', async ({ request }) => {
    const response = await request.post('/api/stripe/checkout', {
      data: { planId: 'invalid_plan' },
    })
    // Either 400 (invalid plan) or 503 (Stripe not configured) is acceptable
    expect([400, 503]).toContain(response.status())
  })

  test('POST /api/stripe/checkout rejects free plan', async ({ request }) => {
    const response = await request.post('/api/stripe/checkout', {
      data: { planId: 'free' },
    })
    // Either 400 (free doesn't need checkout) or 503 (Stripe not configured)
    expect([400, 503]).toContain(response.status())
  })
})
