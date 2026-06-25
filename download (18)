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
  const quizzes = await prisma.quiz.findMany({ where, include: { creator: { select: { name: true } } } })
  return NextResponse.json(quizzes)
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
    const data = await req.json()
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        subject: data.subject,
        year: data.year,
        questions: JSON.stringify(data.questions),
        timeLimit: data.timeLimit,
        createdBy: payload.id,
      },
    })
    return NextResponse.json(quiz)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}