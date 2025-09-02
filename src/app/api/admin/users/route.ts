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

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  // Verify admin status
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || 'all'
    const status = searchParams.get('status') || 'all'
    
    // Build where clause
    const where: any = {}
    
    // Add search filter
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { walletAddress: { contains: search, mode: 'insensitive' } },
        { referralCode: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Add plan filter
    if (plan && plan !== 'all') {
      where.plan = plan
    }
    
    // Add status filter (we'll need to determine this based on user properties)
    // For now, we'll just fetch all users and filter on the client side if needed
    
    // Fetch users
    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        username: true,
        walletAddress: true,
        plan: true,
        referralCode: true,
        balance: true,
        totalEarned: true,
        createdAt: true,
        isActive: true,
        loginAttempts: true,
        // Include triangle position if user is in a triangle
        trianglePositions: {
          select: {
            position: true,
            triangleId: true
          },
          take: 1
        }
      }
    })
    
    // Transform data for frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      plan: user.plan,
      trianglePosition: user.trianglePositions[0]?.position || undefined,
      triangleId: user.trianglePositions[0]?.triangleId || undefined,
      referralCode: user.referralCode,
      balance: user.balance,
      totalEarned: user.totalEarned,
      createdAt: user.createdAt.toISOString(),
      status: user.isActive ? (user.loginAttempts >= 5 ? 'suspended' : 'active') : 'pending'
    }))
    
    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH /api/admin/users/:id - Update user status
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
    const { action } = body
    
    // Validate action
    const validActions = ['suspend', 'activate', 'delete']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
    let updatedUser
    
    switch (action) {
      case 'suspend':
        updatedUser = await prisma.user.update({
          where: { id },
          data: { 
            isActive: false,
            loginAttempts: 5 // Set to max to indicate suspension
          }
        })
        break
        
      case 'activate':
        updatedUser = await prisma.user.update({
          where: { id },
          data: { 
            isActive: true,
            loginAttempts: 0 // Reset login attempts
          }
        })
        break
        
      case 'delete':
        // Soft delete - mark as inactive
        updatedUser = await prisma.user.update({
          where: { id },
          data: { 
            isActive: false,
            loginAttempts: 5
          }
        })
        break
    }
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}