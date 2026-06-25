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
  const games = await prisma.game.findMany({ where })
  return NextResponse.json(games)
}

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
    const { gameId, score } = await req.json()
    const game = await prisma.game.findUnique({ where: { id: gameId } })
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    const existing = await prisma.gameScore.findUnique({
      where: { userId_gameId: { userId: payload.id, gameId } },
    })
    if (existing) {
      if (score > existing.score) {
        const updated = await prisma.gameScore.update({
          where: { id: existing.id },
          data: { score },
        })
        return NextResponse.json(updated)
      }
      return NextResponse.json(existing)
    }
    const gameScore = await prisma.gameScore.create({
      data: { userId: payload.id, gameId, score, stars: Math.floor(score / 10) },
    })
    await prisma.user.update({
      where: { id: payload.id },
      data: { stars: { increment: gameScore.stars } },
    })
    return NextResponse.json(gameScore)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}