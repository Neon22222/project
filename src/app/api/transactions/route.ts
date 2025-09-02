import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock transactions endpoint
  return NextResponse.json([
    {
      id: '1',
      type: 'DEPOSIT',
      amount: 1.0,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    }
  ])
}