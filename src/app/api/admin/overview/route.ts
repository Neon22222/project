import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock admin overview endpoint
  return NextResponse.json({
    stats: {
      totalUsers: 150,
      activeTriangles: 12,
      pendingDeposits: 5,
      totalRevenue: 2500
    },
    recentTransactions: [
      {
        id: '1',
        user: 'john_doe',
        type: 'deposit',
        plan: 'King',
        amount: '1.0 USDT',
        status: 'pending',
        time: new Date().toISOString()
      }
    ],
    pendingActions: [
      {
        id: '1',
        type: 'deposit_approval',
        user: 'john_doe',
        amount: '1.0 USDT',
        priority: 'high'
      }
    ],
    triangles: {
      active: [
        { planType: 'King', count: 5 },
        { planType: 'Queen', count: 3 }
      ],
      completed: [
        { planType: 'King', count: 2 },
        { planType: 'Queen', count: 1 }
      ]
    }
  })
}