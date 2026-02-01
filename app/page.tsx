"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

// Fruit emojis (10 pairs = 20 cards)
const fruitEmojis = ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍑", "🍒", "🍍"]

interface CardData {
  emoji: string
  id: number
}

interface GameState {
  cards: CardData[]
  flippedCards: number[]
  matchedPairs: number
  moves: number
  seconds: number
  score: number
  isProcessing: boolean
  gameStarted: boolean
}

export default function CardGame() {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    seconds: 0,
    score: 1000,
    isProcessing: false,
    gameStarted: false,
  })

  const [winModalOpen, setWinModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array: CardData[]): CardData[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Initialize game
  const initGame = useCallback(() => {
    const cardPairs: CardData[] = []
    fruitEmojis.forEach((fruit) => {
      cardPairs.push({ emoji: fruit, id: Math.random() })
      cardPairs.push({ emoji: fruit, id: Math.random() })
    })

    setGameState({
      cards: shuffleArray(cardPairs),
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      seconds: 0,
      score: 1000,
      isProcessing: false,
      gameStarted: false,
    })
    setWinModalOpen(false)
  }, [])

  // Initialize game on mount
  useEffect(() => {
    initGame()
  }, [initGame])

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (gameState.gameStarted && gameState.matchedPairs < fruitEmojis.length) {
      timer = setInterval(() => {
        setGameState((prev) => ({ ...prev, seconds: prev.seconds + 1 }))
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [gameState.gameStarted, gameState.matchedPairs])

  // Calculate score
  const calculateScore = (moves: number, seconds: number): number => {
    const baseScore = 1000
    const movePenalty = moves * 10
    const timePenalty = seconds * 2
    return Math.max(0, baseScore - movePenalty - timePenalty)
  }

  // Handle card click
  const handleCardClick = (index: number) => {
    if (gameState.isProcessing) return
    if (gameState.flippedCards.includes(index)) return

    // Check if card is already matched
    const isMatched = gameState.cards[index] && 
      gameState.flippedCards.length >= 2 && 
      gameState.cards[gameState.flippedCards[0]]?.emoji === gameState.cards[index]?.emoji

    if (isMatched) return

    // Start game if not started
    if (!gameState.gameStarted) {
      setGameState((prev) => ({ ...prev, gameStarted: true }))
    }

    // Flip card
    const newFlippedCards = [...gameState.flippedCards, index]
    setGameState((prev) => ({ ...prev, flippedCards: newFlippedCards }))

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      const newMoves = gameState.moves + 1
      setGameState((prev) => ({
        ...prev,
        moves: newMoves,
        isProcessing: true,
      }))

      const [index1, index2] = newFlippedCards
      const card1 = gameState.cards[index1]
      const card2 = gameState.cards[index2]

      setTimeout(() => {
        if (card1.emoji === card2.emoji) {
          // Match found
          const newMatchedPairs = gameState.matchedPairs + 1
          setGameState((prev) => ({
            ...prev,
            matchedPairs: newMatchedPairs,
            flippedCards: [],
            isProcessing: false,
          }))

          // Check for game completion
          if (newMatchedPairs === fruitEmojis.length) {
            setTimeout(() => {
              setWinModalOpen(true)
            }, 500)
          }
        } else {
          // No match - flip cards back
          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              flippedCards: [],
              isProcessing: false,
            }))
          }, 300)
        }
      }, 1000)
    }
  }

  // Check if card is flipped
  const isCardFlipped = (index: number): boolean => {
    return gameState.flippedCards.includes(index)
  }

  // Check if card is matched
  const isCardMatched = (index: number): boolean => {
    const card = gameState.cards[index]
    if (!card) return false

    // Check if this card's emoji has been matched
    let matchCount = 0
    for (let i = 0; i < gameState.cards.length; i++) {
      if (
        gameState.cards[i].emoji === card.emoji &&
        !gameState.flippedCards.includes(i)
      ) {
        // Check if there was a previous match
        for (let j = 0; j < i; j++) {
          if (
            gameState.cards[j].emoji === card.emoji &&
            !gameState.flippedCards.includes(j)
          ) {
            matchCount++
          }
        }
      }
    }

    // A card is matched if we've found pairs of the same emoji that are not currently flipped
    // We need to track matched cards differently
    return false
  }

  // Better approach: track matched indices
  const [matchedIndices, setMatchedIndices] = useState<Set<number>>(new Set())

  // Reset matched indices when game resets
  useEffect(() => {
    if (gameState.moves === 0 && gameState.matchedPairs === 0) {
      setMatchedIndices(new Set())
    }
  }, [gameState.moves, gameState.matchedPairs])

  // Update card click handler to track matched indices
  const handleCardClickWithMatching = (index: number) => {
    if (gameState.isProcessing) return
    if (gameState.flippedCards.includes(index)) return
    if (matchedIndices.has(index)) return

    // Start game if not started
    if (!gameState.gameStarted) {
      setGameState((prev) => ({ ...prev, gameStarted: true }))
    }

    // Flip card
    const newFlippedCards = [...gameState.flippedCards, index]
    setGameState((prev) => ({ ...prev, flippedCards: newFlippedCards }))

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      const newMoves = gameState.moves + 1
      setGameState((prev) => ({
        ...prev,
        moves: newMoves,
        isProcessing: true,
      }))

      const [index1, index2] = newFlippedCards
      const card1 = gameState.cards[index1]
      const card2 = gameState.cards[index2]

      setTimeout(() => {
        if (card1.emoji === card2.emoji) {
          // Match found
          const newMatchedPairs = gameState.matchedPairs + 1
          setMatchedIndices((prev) => new Set([...prev, index1, index2]))
          setGameState((prev) => ({
            ...prev,
            matchedPairs: newMatchedPairs,
            flippedCards: [],
            isProcessing: false,
          }))

          // Check for game completion
          if (newMatchedPairs === fruitEmojis.length) {
            setTimeout(() => {
              setWinModalOpen(true)
            }, 500)
          }
        } else {
          // No match - flip cards back
          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              flippedCards: [],
              isProcessing: false,
            }))
          }, 300)
        }
      }, 1000)
    }
  }

  const currentScore = calculateScore(gameState.moves, gameState.seconds)
  const finalScore = calculateScore(gameState.moves, gameState.seconds)

  // Handle sign in (demo - no actual Supabase connection)
  const handleSignIn = () => {
    if (email && password) {
      setCurrentUser(email)
      setLoginModalOpen(false)
      setEmail("")
      setPassword("")
    }
  }

  // Handle sign up (demo)
  const handleSignUp = () => {
    if (email && password) {
      setCurrentUser(email)
      setLoginModalOpen(false)
      setEmail("")
      setPassword("")
    }
  }

  // Handle sign out
  const handleSignOut = () => {
    setCurrentUser(null)
  }

  return (
    <main className="min-h-screen bg-muted p-5 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            🍎 카드 뒤집기 게임
          </h1>
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <span className="font-semibold text-primary">{currentUser}</span>
                <Button variant="secondary" onClick={handleSignOut}>
                  로그아웃
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setLoginModalOpen(true)}>
                로그인
              </Button>
            )}
          </div>
        </header>

        {/* Game Info */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <Card className="px-6 py-4">
            <span className="text-muted-foreground text-sm mr-2">이동 횟수:</span>
            <span className="text-2xl font-bold text-primary">{gameState.moves}</span>
          </Card>
          <Card className="px-6 py-4">
            <span className="text-muted-foreground text-sm mr-2">시간:</span>
            <span className="text-2xl font-bold text-primary">{gameState.seconds}초</span>
          </Card>
          <Card className="px-6 py-4">
            <span className="text-muted-foreground text-sm mr-2">점수:</span>
            <span className="text-2xl font-bold text-primary">{currentScore}</span>
          </Card>
        </div>

        {/* Game Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button onClick={initGame}>게임 시작</Button>
          <Button variant="secondary" onClick={initGame}>
            다시 시작
          </Button>
          <Link href="/leaderboard">
            <Button variant="secondary">리더보드</Button>
          </Link>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-3 md:gap-4 max-w-[700px] mx-auto">
          {gameState.cards.map((card, index) => {
            const isFlipped = gameState.flippedCards.includes(index)
            const isMatched = matchedIndices.has(index)

            return (
              <div
                key={card.id}
                className="aspect-square cursor-pointer perspective-1000"
                onClick={() => handleCardClickWithMatching(index)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    isFlipped || isMatched ? "rotate-y-180" : ""
                  }`}
                >
                  {/* Card Back */}
                  <div
                    className={`absolute inset-0 backface-hidden rounded-xl flex items-center justify-center text-3xl md:text-5xl shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white ${
                      isMatched ? "opacity-60" : ""
                    }`}
                  >
                    🎴
                  </div>
                  {/* Card Front */}
                  <div
                    className={`absolute inset-0 backface-hidden rounded-xl flex items-center justify-center text-3xl md:text-5xl shadow-md bg-white rotate-y-180 ${
                      isMatched ? "opacity-60" : ""
                    }`}
                  >
                    {card.emoji}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Win Modal */}
        <Dialog open={winModalOpen} onOpenChange={setWinModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">🎉 축하합니다!</DialogTitle>
            </DialogHeader>
            <div className="text-center">
              <p className="mb-4">게임을 완료했습니다!</p>
              <div className="space-y-2 text-left bg-muted p-4 rounded-lg mb-4">
                <p>
                  이동 횟수: <strong>{gameState.moves}</strong>
                </p>
                <p>
                  시간: <strong>{gameState.seconds}</strong>초
                </p>
                <p>
                  최종 점수: <strong>{finalScore}</strong>
                </p>
              </div>
              {currentUser && (
                <Button className="w-full mb-2">점수 저장</Button>
              )}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setWinModalOpen(false)}
              >
                닫기
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Login Modal */}
        <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">로그인 / 회원가입</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleSignIn}>
                  로그인
                </Button>
                <Button variant="secondary" className="flex-1" onClick={handleSignUp}>
                  회원가입
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setLoginModalOpen(false)}
              >
                취소
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
