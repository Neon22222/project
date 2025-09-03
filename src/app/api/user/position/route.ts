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

// GET /api/user/position - Get user's triangle position
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
    
    // Fetch user with triangle position information
    const userData: any = await prisma.user.findUnique({
      where: { id: user.id }
    })
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Fetch user's triangle positions separately
    const userTrianglePositions: any = await (prisma as any).position.findMany({
      where: {
        userId: user.id
      },
      include: {
        triangle: true
      }
    })
    
    // Check if user has any triangle positions
    if (!userTrianglePositions || userTrianglePositions.length === 0) {
      return NextResponse.json(
        { error: 'User has not joined any triangle yet' },
        { status: 404 }
      )
    }
    
    // Get the most recent triangle position
    const currentPosition = userTrianglePositions[0]
    const triangle = currentPosition.triangle
    
    // Calculate completion percentage (assuming 15 positions per triangle)
    const filledPositions = await (prisma as any).position.count({
      where: {
        triangleId: triangle.id,
        userId: {
          not: null
        }
      }
    })
    
    const completion = (filledPositions / 15) * 100
    
    // Map positions to frontend format
    const positions = Array(15).fill(null)
    const trianglePositions: any = await (prisma as any).position.findMany({
      where: {
        triangleId: triangle.id
      },
      include: {
        user: {
          select: {
            username: true,
            plan: true
          }
        }
      }
    })
    
    trianglePositions.forEach((pos: any) => {
      positions[pos.position] = {
        id: pos.id,
        positionKey: String.fromCharCode(65 + pos.position), // A, B, C, etc.
        username: pos.user?.username || null,
        planType: pos.user?.plan || null
      }
    })
    
    // Transform data for frontend
    const responseData = {
      triangle: {
        id: triangle.id,
        planType: triangle.planType,
        isComplete: !!triangle.completedAt,
        positions
      },
      positionKey: String.fromCharCode(65 + currentPosition.position),
      completion: completion
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching user position:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user position data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}