import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }
  const payload = verifyToken(auth.slice(7))
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  const actions = await prisma.adminAction.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  return NextResponse.json(actions)
}

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
    const { type, data, active } = await req.json()
    if (type === 'disco' || type === 'rickroll' || type === 'crabrave') {
      await prisma.adminAction.updateMany({
        where: { type, active: true },
        data: { active: false },
      })
    }
    const action = await prisma.adminAction.create({
      data: { type, data: data || null, active: active !== false, createdBy: payload.id },
    })
    return NextResponse.json(action)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }
  const payload = verifyToken(auth.slice(7))
  if (!payload || payload.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const { type } = await req.json()
    await prisma.adminAction.updateMany({
      where: { type, active: true },
      data: { active: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}