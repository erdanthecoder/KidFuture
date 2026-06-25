import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }
  const payload = verifyToken(auth.slice(7))
  if (!payload || payload.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const { userId, amount } = await req.json()
    if (!userId || !amount || amount < 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { housePoints: { increment: amount } },
    })
    return NextResponse.json({ housePoints: user.housePoints })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}