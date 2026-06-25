import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return NextResponse.json({ error: 'No token' }, { status: 401 })
  const payload = verifyToken(auth.slice(7))
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const homeworkId = searchParams.get('homeworkId')
  const where: any = { userId: payload.id }
  if (homeworkId) where.homeworkId = homeworkId
  const subs = await prisma.homeworkSubmission.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(subs)
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return NextResponse.json({ error: 'No token' }, { status: 401 })
  const payload = verifyToken(auth.slice(7))
  if (!payload || payload.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  try {
    const { homeworkId, answers } = await req.json()
    const sub = await prisma.homeworkSubmission.create({
      data: { homeworkId, userId: payload.id, answers: JSON.stringify(answers), submitted: true },
    })
    return NextResponse.json(sub)
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return NextResponse.json({ error: 'No token' }, { status: 401 })
  const payload = verifyToken(auth.slice(7))
  if (!payload || payload.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  try {
    const { id, score, feedback } = await req.json()
    const sub = await prisma.homeworkSubmission.update({ where: { id }, data: { score, feedback } })
    return NextResponse.json(sub)
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}