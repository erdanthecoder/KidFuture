import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return NextResponse.json({ error: 'No token' }, { status: 401 })
  const payload = verifyToken(auth.slice(7))
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const year = searchParams.get('year')
  const where: any = {}
  if (subject) where.subject = subject
  if (year) where.year = parseInt(year)
  const homework = await prisma.homework.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(homework)
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return NextResponse.json({ error: 'No token' }, { status: 401 })
  const payload = verifyToken(auth.slice(7))
  if (!payload || payload.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  try {
    const { title, description, subject, year, dueDate, questions } = await req.json()
    const hw = await prisma.homework.create({
      data: { title, description, subject, year, dueDate, questions: JSON.stringify(questions), createdBy: payload.id },
    })
    return NextResponse.json(hw)
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return NextResponse.json({ error: 'No token' }, { status: 401 })
  const payload = verifyToken(auth.slice(7))
  if (!payload || payload.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  try {
    const { id } = await req.json()
    await prisma.homeworkSubmission.deleteMany({ where: { homeworkId: id } })
    await prisma.homework.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}