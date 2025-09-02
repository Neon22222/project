import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock triangle data endpoint
  return NextResponse.json({
    completion: 60,
    positions: Array(15).fill(null).map((_, i) => i < 9 ? { id: `pos-${i}`, username: `User${i}`, plan: 'King' } : null),
    currentUserPosition: 0
  })
}