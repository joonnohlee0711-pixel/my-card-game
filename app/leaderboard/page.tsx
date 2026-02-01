"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Demo leaderboard data
const demoLeaderboard = [
  { id: 1, player: "player1", score: 850, moves: 12, time: 25, date: "2025.01.15" },
  { id: 2, player: "player2", score: 780, moves: 15, time: 35, date: "2025.01.14" },
  { id: 3, player: "player3", score: 720, moves: 18, time: 45, date: "2025.01.13" },
  { id: 4, player: "player4", score: 650, moves: 22, time: 55, date: "2025.01.12" },
  { id: 5, player: "player5", score: 600, moves: 25, time: 60, date: "2025.01.11" },
]

function getRankEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇"
    case 2:
      return "🥈"
    case 3:
      return "🥉"
    default:
      return ""
  }
}

function getRankClass(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-yellow-50"
    case 2:
      return "bg-gray-50"
    case 3:
      return "bg-orange-50"
    default:
      return ""
  }
}

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-muted p-5 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            🏆 리더보드
          </h1>
          <Link href="/">
            <Button variant="secondary">게임으로 돌아가기</Button>
          </Link>
        </header>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">상위 10위</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>순위</TableHead>
                  <TableHead>플레이어</TableHead>
                  <TableHead>점수</TableHead>
                  <TableHead>이동</TableHead>
                  <TableHead>시간</TableHead>
                  <TableHead>날짜</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoLeaderboard.map((entry, index) => {
                  const rank = index + 1
                  return (
                    <TableRow key={entry.id} className={getRankClass(rank)}>
                      <TableCell className="font-medium">
                        {getRankEmoji(rank)} {rank}
                      </TableCell>
                      <TableCell>{entry.player}</TableCell>
                      <TableCell className="font-bold">{entry.score}</TableCell>
                      <TableCell>{entry.moves}</TableCell>
                      <TableCell>{entry.time}초</TableCell>
                      <TableCell>{entry.date}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
