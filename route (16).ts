import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }
  const payload = verifyToken(auth.slice(7))
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const housePointsToAdd = Math.floor(user.stars / 30)
    if (housePointsToAdd === 0) {
      return NextResponse.json({ error: 'Not enough stars (need 30)' }, { status: 400 })
    }
    const starsUsed = housePointsToAdd * 30
    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: {
        stars: { decrement: starsUsed },
        housePoints: { increment: housePointsToAdd },
      },
    })
    return NextResponse.json({ stars: updated.stars, housePoints: updated.housePoints, converted: housePointsToAdd })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}