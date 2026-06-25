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
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { teacher: { select: { name: true, avatar: true } } },
  })
  return NextResponse.json(announcements)
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
    const { content, classId, type } = await req.json()
    const announcement = await prisma.announcement.create({
      data: { content, teacherId: payload.id, classId: classId || null, type: type || 'normal' },
    })
    const full = await prisma.announcement.findUnique({
      where: { id: announcement.id },
      include: { teacher: { select: { name: true, avatar: true } } },
    })
    return NextResponse.json(full)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}