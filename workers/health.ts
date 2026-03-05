/**
 * BlackRoad AI Dashboard - Cloudflare Worker
 * Health check endpoint and long-running task handler
 *
 * Copyright 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
 * Proprietary and confidential. See LICENSE for details.
 */

interface Env {
  DEPLOY_URL?: string
}

interface HealthResponse {
  status: string
  service: string
  version: string
  timestamp: string
  agents: number
  devices: number
  uptime: string
}

interface TaskResponse {
  id: string
  status: string
  created: string
  type: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Powered-By': 'BlackRoad OS',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    if (url.pathname === '/api/health') {
      const response: HealthResponse = {
        status: 'healthy',
        service: 'blackroad-ai-dashboard',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        agents: 9,
        devices: 3,
        uptime: 'operational',
      }
      return new Response(JSON.stringify(response), { status: 200, headers })
    }

    if (url.pathname === '/api/status') {
      const status = {
        infrastructure: { device: 'lucidia', agents: ['Lucidia', 'Marcus', 'Viktor', 'Sophia'], status: 'online' },
        creative: { device: 'cecilia', agents: ['CECE', 'Luna', 'Dante'], status: 'online' },
        coding: { device: 'aria', agents: ['Aria-Prime', 'Aria-Tiny'], status: 'online' },
      }
      return new Response(JSON.stringify(status), { status: 200, headers })
    }

    if (url.pathname === '/api/tasks' && request.method === 'POST') {
      const body = await request.json() as { type?: string }
      const task: TaskResponse = {
        id: crypto.randomUUID(),
        status: 'queued',
        created: new Date().toISOString(),
        type: body.type || 'default',
      }
      return new Response(JSON.stringify(task), { status: 201, headers })
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers })
  },
}
