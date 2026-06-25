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
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const year = searchParams.get('year')
  const where: any = {}
  if (subject) where.subject = subject
  if (year) where.year = parseInt(year)
  const lessons = await prisma.lesson.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(lessons)
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
    const { title, subject, year, content, videoUrl } = await req.json()
    const lesson = await prisma.lesson.create({
      data: { title, subject, year, content, videoUrl: videoUrl || null, createdBy: payload.id },
    })
    return NextResponse.json(lesson)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}