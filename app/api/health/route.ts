import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'BlackRoad AI Dashboard',
    agents: 9,
    devices: ['lucidia', 'cecilia', 'aria'],
    timestamp: new Date().toISOString(),
  })
}
