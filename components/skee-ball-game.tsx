"use client"

import { useState, useCallback, useRef } from "react"
import { SkeeBallMachine } from "./skee-ball-machine"
import { Leaderboard } from "./leaderboard"
import { GameHeader } from "./game-header"
import { Lanterns } from "./lanterns"

export interface LeaderboardEntry {
  rank: number
  name: string
  score: number
}

export interface Reward {
  id: string
  name: string
  points: number
  icon: "bunny" | "ferris" | "cake" | "star"
  claimed: boolean
}

export default function SkeeBallGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [ballsLeft, setBallsLeft] = useState(5)
  const [gameOver, setGameOver] = useState(false)
  const [rewards, setRewards] = useState<Reward[]>([
    { id: "1", name: "Cute Bunny Plushie", points: 50, icon: "bunny", claimed: false },
    { id: "2", name: "Ferris Wheel Ride", points: 100, icon: "ferris", claimed: false },
    { id: "3", name: "Sweet Cake Dessert", points: 150, icon: "cake", claimed: false },
    { id: "4", name: "Gold Star Trophy", points: 200, icon: "star", claimed: false },
  ])
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [unlockedReward, setUnlockedReward] = useState<Reward | null>(null)
  const [showRewardsPanel, setShowRewardsPanel] = useState(false)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: "LEGEND", score: 250 },
    { rank: 2, name: "CHAMPION", score: 200 },
    { rank: 3, name: "MASTER", score: 150 },
    { rank: 4, name: "ROOKIE", score: 100 },
    { rank: 5, name: "NEWBIE", score: 50 },
  ])
  const scoreRef = useRef(score)
  scoreRef.current = score

  const handleScore = useCallback((points: number) => {
    if (points > 0) {
      setScore((prev) => {
        const newScore = prev + points
        checkForUnlockedRewards(newScore)
        return newScore
      })
    }
    setBallsLeft((prev) => {
      const newBalls = prev - 1
      if (newBalls === 0) {
        setTimeout(() => {
          setGameOver(true)
          updateLeaderboard(scoreRef.current + points)
        }, 500)
      }
      return newBalls
    })
  }, [])

  const checkForUnlockedRewards = (currentScore: number) => {
    const newlyUnlocked = rewards.find((reward) => !reward.claimed && currentScore >= reward.points)
    if (newlyUnlocked) {
      setUnlockedReward(newlyUnlocked)
      setShowRewardModal(true)
    }
  }

  const claimReward = () => {
    if (unlockedReward) {
      setRewards((prev) => prev.map((r) => (r.id === unlockedReward.id ? { ...r, claimed: true } : r)))
      setShowRewardModal(false)
      setUnlockedReward(null)
    }
  }

  const updateLeaderboard = (finalScore: number) => {
    const playerName = "PLAYER"
    const newEntry: LeaderboardEntry = { rank: 0, name: playerName, score: finalScore }

    const updatedBoard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))

    setLeaderboard(updatedBoard)
  }

  const resetGame = () => {
    setScore(0)
    setBallsLeft(5)
    setGameOver(false)
    setGameStarted(false) // Reset gameStarted to false to show start screen
  }

  const startGame = () => {
    setGameStarted(true)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2744] to-[#0a1628] p-4 md:p-8">
      <Lanterns />

      {!gameStarted && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <h1
              className="text-5xl md:text-7xl text-[#ffd700] mb-8 drop-shadow-[0_0_30px_#ffd700] animate-pulse"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              SKEE BALL
            </h1>
            <button
              onClick={startGame}
              className="px-12 py-6 bg-gradient-to-b from-[#ff6b35] to-[#d4532a] border-4 border-[#ffd700] rounded-lg text-[#ffd700] text-2xl hover:brightness-110 hover:scale-105 transition-all shadow-[0_0_30px_#ff6b35]"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              CLICK TO START
            </button>
          </div>
        </div>
      )}

      <GameHeader score={score} rewards={rewards} onRewardsClick={() => setShowRewardsPanel(true)} />

      <div className="max-w-6xl mx-auto mt-4 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <SkeeBallMachine ballsLeft={ballsLeft} onScore={handleScore} gameOver={gameOver} />

        <Leaderboard entries={leaderboard} />
      </div>

      {showRewardModal && unlockedReward && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#3d2817] to-[#2d1810] border-4 border-[#ffd700] rounded-lg p-8 text-center shadow-2xl max-w-md animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl md:text-3xl text-[#ffd700] mb-4" style={{ fontFamily: "var(--font-pixel)" }}>
              CONGRATULATIONS!
            </h2>
            <p className="text-xl text-[#d4a574] mb-6" style={{ fontFamily: "var(--font-pixel)" }}>
              Claim your prize!
            </p>
            <div className="mb-6">
              <p className="text-lg text-[#ffd700]" style={{ fontFamily: "var(--font-pixel)" }}>
                {unlockedReward.name}
              </p>
            </div>
            <button
              onClick={claimReward}
              className="px-8 py-3 bg-gradient-to-b from-[#ff6b35] to-[#d4532a] border-2 border-[#ffd700] rounded-lg text-[#ffd700] text-xl hover:brightness-110 transition-all"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              CLAIM NOW
            </button>
          </div>
        </div>
      )}

      {showRewardsPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#3d2817] to-[#2d1810] border-4 border-[#d4a574] rounded-lg p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl text-[#ffd700]" style={{ fontFamily: "var(--font-pixel)" }}>
                REWARDS
              </h2>
              <button
                onClick={() => setShowRewardsPanel(false)}
                className="text-[#ffd700] text-3xl hover:brightness-110"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {rewards.map((reward) => {
                const isUnlocked = score >= reward.points
                return (
                  <div
                    key={reward.id}
                    className={`p-4 rounded-lg border-2 flex items-center gap-4 transition-all ${
                      reward.claimed
                        ? "bg-[#1a2744]/50 border-[#4a5a6a] opacity-60"
                        : isUnlocked
                          ? "bg-gradient-to-r from-[#ffd700]/20 to-[#ff8c00]/20 border-[#ffd700] shadow-[0_0_20px_#ffd700]"
                          : "bg-[#1a0a0a] border-[#3d2817]"
                    }`}
                  >
                    <div className="text-4xl">{reward.claimed ? "✓" : isUnlocked ? "🎁" : "🔒"}</div>
                    <div className="flex-1">
                      <p
                        className={`text-lg ${isUnlocked ? "text-[#ffd700]" : "text-[#666]"}`}
                        style={{ fontFamily: "var(--font-pixel)" }}
                      >
                        {reward.name}
                      </p>
                      <p
                        className={`text-sm ${isUnlocked ? "text-[#d4a574]" : "text-[#555]"}`}
                        style={{ fontFamily: "var(--font-pixel)" }}
                      >
                        {reward.points} points
                      </p>
                    </div>
                    {reward.claimed && (
                      <span className="text-[#4a5a6a]" style={{ fontFamily: "var(--font-pixel)" }}>
                        CLAIMED
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-[#3d2817] to-[#2d1810] border-4 border-[#d4a574] rounded-lg p-8 text-center shadow-2xl">
            <h2 className="text-2xl md:text-3xl text-[#ffd700] mb-4" style={{ fontFamily: "var(--font-pixel)" }}>
              GAME OVER!
            </h2>
            <p className="text-xl text-[#d4a574] mb-6" style={{ fontFamily: "var(--font-pixel)" }}>
              Final Score: {score}
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-gradient-to-b from-[#ff6b35] to-[#d4532a] border-2 border-[#ffd700] rounded-lg text-[#ffd700] hover:brightness-110 transition-all"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
