import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

// Helper function to verify user authentication
async function verifyUser(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    // Verify and decode the session token
    const decoded = jwt.verify(
      sessionToken,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as { user: any }
    
    if (decoded && decoded.user) {
      return decoded.user
    }
    
    return null
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

const prisma = new PrismaClient()

// GET /api/user/wallet - Get user's wallet data
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User access required' },
        { status: 401 }
      )
    }
    
    // Fetch user with wallet and transaction information
    const userData: any = await prisma.user.findUnique({
      where: { id: user.id }
    })
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Fetch user's transactions
    const userTransactions: any = await prisma.transaction.findMany({
      where: {
        userId: user.id
      }
    })
    
    // Fetch user's triangle positions
    const userTrianglePositions: any = await (prisma as any).position.findMany({
      where: {
        userId: user.id
      },
      include: {
        triangle: true
      }
    })
    
    // Calculate wallet statistics
    const balance = userData.balance
    const totalEarned = userData.totalEarned
    
    // Calculate pending earnings from triangle positions
    let pendingEarnings = 0
    let referralBonus = 0
    let positionInfo = null
    
    // Get referral bonus from transactions
    const referralTransactions = userTransactions.filter((tx: any) => tx.type === 'REFERRAL')
    referralBonus = referralTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0)
    
    // Get the most recent triangle position if exists
    if (userTrianglePositions && userTrianglePositions.length > 0) {
      const currentPosition = userTrianglePositions[0]
      const triangle = currentPosition.triangle
      
      // Calculate filled positions in the triangle
      const filledPositions = await (prisma as any).position.count({
        where: {
          triangleId: triangle.id,
          userId: {
            not: null
          }
        }
      })
      
      // Get plan details for payout calculation
      const plan = await prisma.plan.findUnique({
        where: { name: triangle.planType }
      })
      
      const expectedPayout = plan ? plan.payout : 0
      
      positionInfo = {
        positionKey: String.fromCharCode(65 + currentPosition.position),
        triangleComplete: !!triangle.completedAt,
        earnedFromPosition: triangle.completedAt ? expectedPayout : 0,
        filledPositions: filledPositions
      }
      
      // If triangle is complete but user hasn't claimed payout yet, add to pending
      if (triangle.completedAt && !triangle.payoutProcessed) {
        pendingEarnings += expectedPayout
      }
    }
    
    // Transform transaction history for frontend
    const transactionHistory = userTransactions.map((tx: any) => ({
      id: tx.id,
      type: tx.type.toLowerCase(),
      amount: tx.amount,
      status: tx.status.toLowerCase(),
      transactionId: tx.transactionId || undefined,
      date: tx.createdAt.toISOString().split('T')[0]
    }))
    
    // Transform data for frontend
    const responseData = {
      balance,
      pendingEarnings,
      totalEarned,
      referralBonus,
      positionInfo,
      history: transactionHistory
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching user wallet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user wallet data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}