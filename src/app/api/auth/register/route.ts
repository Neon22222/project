import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, walletAddress, planType, referrerId } = body

    // Validate required fields
    if (!username || !password || !walletAddress || !planType) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { walletAddress }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Username or wallet address already exists' },
        { status: 400 }
      )
    }

    // Validate plan type
    const validPlans = ['King', 'Queen', 'Bishop', 'Knight']
    if (!validPlans.includes(planType)) {
      return NextResponse.json(
        { message: 'Invalid plan type' },
        { status: 400 }
      )
    }

    // Find upline user if referrer ID is provided
    let uplineId = null
    if (referrerId) {
      const upline = await prisma.user.findFirst({
        where: {
          OR: [
            { id: referrerId },
            { username: referrerId },
            { referralCode: referrerId }
          ]
        }
      })
      
      if (upline) {
        uplineId = upline.id
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate unique referral code
    const referralCode = `${username.toUpperCase()}_${Date.now()}`

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { name: planType }
    })

    if (!plan) {
      return NextResponse.json(
        { message: 'Plan not found' },
        { status: 400 }
      )
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        walletAddress,
        plan: planType,
        referralCode,
        uplineId,
        balance: 0,
        totalEarned: 0,
        isAdmin: false,
        isActive: true,
        loginAttempts: 0
      }
    })

    // Generate deposit information
    const depositInfo = {
      transactionId: `DEP_${crypto.randomBytes(16).toString('hex')}`,
      amount: plan.price,
      coin: 'USDT',
      network: 'TRC20',
      walletAddress: process.env.CRYPTO_WALLET_ADDRESS || 'TBD...',
      positionId: newUser.id,
      positionKey: newUser.referralCode
    }

    // Create pending transaction
    await prisma.transaction.create({
      data: {
        userId: newUser.id,
        type: 'DEPOSIT',
        amount: plan.price,
        status: 'PENDING',
        transactionId: depositInfo.transactionId,
        description: `Initial deposit for ${planType} plan`,
        metadata: depositInfo
      }
    })

    console.log('User registered successfully:', newUser.username)
    
    return NextResponse.json({ 
      success: true,
      message: 'Registration successful',
      deposit: depositInfo
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}