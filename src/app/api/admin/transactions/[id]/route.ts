import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Helper function to verify admin status
async function verifyAdmin(request: NextRequest) {
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
    
    if (decoded && decoded.user && decoded.user.isAdmin) {
      return decoded.user
    }
    
    return null
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

// PATCH /api/admin/transactions/:id - Update transaction status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin status
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body
    
    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CONSOLIDATED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { status }
    })
    
    // If transaction is completed and it's a payout, update user balance
    if (status === 'COMPLETED' && updatedTransaction.type === 'PAYOUT') {
      const user = await prisma.user.findUnique({
        where: { id: updatedTransaction.userId }
      })
      
      if (user) {
        await prisma.user.update({
          where: { id: updatedTransaction.userId },
          data: {
            balance: {
              decrement: updatedTransaction.amount
            },
            totalEarned: {
              increment: updatedTransaction.amount
            }
          }
        })
      }
    }
    
    // If transaction is completed and it's a deposit, update user balance
    if (status === 'COMPLETED' && updatedTransaction.type === 'DEPOSIT') {
      const user = await prisma.user.findUnique({
        where: { id: updatedTransaction.userId }
      })
      
      if (user) {
        await prisma.user.update({
          where: { id: updatedTransaction.userId },
          data: {
            balance: {
              increment: updatedTransaction.amount
            }
          }
        })
      }
    }
    
    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}