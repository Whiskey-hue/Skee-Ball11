"use client"

import { useState, useCallback, useRef, useEffect } from "react"
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

export default function SkeeBallGame({ autoStart = false }: { autoStart?: boolean }) {
  const [gameStarted, setGameStarted] = useState(Boolean(autoStart))
  const [score, setScore] = useState(0)
  const [ballsLeft, setBallsLeft] = useState(5)
  const [gameOver, setGameOver] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [rewards, setRewards] = useState<Reward[]>([
    { id: "1", name: "Cute Bunny Plushie", points: 30, icon: "bunny", claimed: false },
    { id: "2", name: "Ferris Wheel Ride", points: 60, icon: "ferris", claimed: false },
    { id: "3", name: "Sweet Cake Dessert", points: 90, icon: "cake", claimed: false },
    { id: "4", name: "Gold Star Trophy", points: 120, icon: "star", claimed: false },
  ])
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [unlockedRewards, setUnlockedRewards] = useState<Reward[]>([])
  const [showRewardsPanel, setShowRewardsPanel] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [remainingPoints, setRemainingPoints] = useState<number>(0)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: "LEGEND", score: 250 },
    { rank: 2, name: "CHAMPION", score: 200 },
    { rank: 3, name: "MASTER", score: 150 },
    { rank: 4, name: "ROOKIE", score: 100 },
    { rank: 5, name: "NEWBIE", score: 50 },
  ])
  const scoreRef = useRef(score)
  scoreRef.current = score

  // Simulate other players updating leaderboard
  useEffect(() => {
    const interval = setInterval(() => {
      const names = ["ALEX", "JAMIE", "TAYLOR", "MORGAN", "CASEY", "RILEY", "SKYLER"]
      const randomName = names[Math.floor(Math.random() * names.length)]
      const randomScore = Math.floor(Math.random() * 200) + 50

      const newEntry: LeaderboardEntry = { rank: 0, name: randomName, score: randomScore }
      setLeaderboard(prev => {
        const updated = [...prev, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((entry, index) => ({ ...entry, rank: index + 1 }))
        return updated
      })
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleScore = useCallback((points: number) => {
    if (points > 0) {
      setScore((prev) => prev + points)
    }
    setBallsLeft((prev) => {
      const newBalls = prev - 1
      if (newBalls === 0) {
        setTimeout(() => {
          const fs = scoreRef.current + points
          setFinalScore(fs)
          const unlocked = rewards.filter(reward => !reward.claimed && fs >= reward.points)
          if (unlocked.length > 0) {
            setUnlockedRewards(unlocked)
            setRemainingPoints(fs)
            setShowRewardModal(true)
          } else {
            // No rewards unlocked: finalize, reset score/balls, return to start
            updateLeaderboard(fs)
            setScore(0)
            setBallsLeft(5)
            setRemainingPoints(0)
            setGameOver(false)
            setGameStarted(false)
          }
        }, 200) // Wait for ball reset
      }
      return newBalls
    })
  }, [])



  const claimReward = (reward: Reward) => {
    const fs = finalScore ?? scoreRef.current
    if (fs < reward.points) return
    setRewards((prev) => prev.map((r) => (r.id === reward.id ? { ...r, claimed: true } : r)))
    updateLeaderboard(fs)
    setFinalScore(fs)
    setShowRewardModal(false)
    setUnlockedRewards([])
    setGameOver(false)
    setGameStarted(false)
    setScore(0)
    setBallsLeft(5)
    setRemainingPoints(0)
  }

  const continueAfterReward = () => {
    // Preserve score and name, reset balls to play on
    setShowRewardModal(false)
    setUnlockedRewards([])
    setBallsLeft(5)
    setGameOver(false)
    setRemainingPoints(0)
  }

  const redeemReward = (reward: Reward) => {
    const affordable = remainingPoints >= reward.points
    const alreadyClaimed = rewards.find((r) => r.id === reward.id)?.claimed
    if (!affordable || alreadyClaimed) return
    setRewards((prev) => prev.map((r) => (r.id === reward.id ? { ...r, claimed: true } : r)))
    setRemainingPoints((p) => p - reward.points)
  }

  const finishClaiming = () => {
    const fs = finalScore ?? scoreRef.current
    updateLeaderboard(fs)
    setFinalScore(fs)
    setShowRewardModal(false)
    setUnlockedRewards([])
    setGameOver(false)
    setGameStarted(false)
    setScore(0)
    setBallsLeft(5)
    setRemainingPoints(0)
  }

  const updateLeaderboard = (finalScore: number) => {
    const name = playerName.trim() || "PLAYER"
    const newEntry: LeaderboardEntry = { rank: 0, name, score: finalScore }

    setLeaderboard((prev) => {
      // Keep the newest score for this player, then rank and cap at top 5
      const withoutPlayer = prev.filter((entry) => entry.name !== name)
      return [...withoutPlayer, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
    })
  }

  const resetGame = () => {
    setScore(0)
    setBallsLeft(5)
    setGameOver(false)
    setGameStarted(false) // Reset gameStarted to false to show start screen
    setRemainingPoints(0)
    setFinalScore(null)
  }

  const startGame = () => {
    const name = playerName.trim()
    if (!name) return // Require name
    setPlayerName(name)
    setGameStarted(true)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2744] to-[#0a1628] p-4 md:p-8">
      <Lanterns />

      {!gameStarted && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center max-w-md mx-4">
            <h1
              className="text-5xl md:text-7xl text-[#ffd700] mb-6 drop-shadow-[0_0_30px_#ffd700] animate-pulse"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              SKEE BALL
            </h1>

            <p className="text-sm text-[#d4a574] mb-4" style={{ fontFamily: "var(--font-pixel)" }}>
              Enter your name to appear on the leaderboard
            </p>

            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 12))}
              placeholder="Enter your name (required)"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && playerName.trim()) startGame() }}
              aria-label="Player name"
              className="mb-4 w-full px-4 py-3 rounded-md text-black bg-[#fff9e0] placeholder-[#8a6a00] ring-2 ring-[#ffd700]/40 focus:outline-none focus:ring-4 focus:ring-[#ffd700] transition-shadow"
            />

            <button
              onClick={startGame}
              disabled={!playerName.trim()}
              className={`w-full px-6 py-4 border-4 border-[#ffd700] rounded-lg text-[#ffd700] text-2xl transition-all shadow-[0_0_30px_#ff6b35] ${
                playerName.trim()
                  ? "bg-gradient-to-b from-[#ff6b35] to-[#d4532a] hover:brightness-110 hover:scale-105"
                  : "bg-gray-500 cursor-not-allowed opacity-50"
              }`}
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

      {showRewardModal && unlockedRewards.length > 0 && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#3d2817] to-[#2d1810] border-4 border-[#ffd700] rounded-lg p-8 text-center shadow-2xl max-w-md">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl md:text-3xl text-[#ffd700] mb-4" style={{ fontFamily: "var(--font-pixel)" }}>
              CONGRATULATIONS!
            </h2>
            <p className="text-xl text-[#d4a574] mb-6" style={{ fontFamily: "var(--font-pixel)" }}>
              Choose your reward!
            </p>
            <div className="mb-4">
              <p className="text-lg text-[#ffd700]" style={{ fontFamily: "var(--font-pixel)" }}>
                Points Available: {remainingPoints}
              </p>
            </div>
            <div className="space-y-4 mb-6">
              {unlockedRewards.map((reward) => {
                const affordable = remainingPoints >= reward.points
                const claimed = rewards.find((r) => r.id === reward.id)?.claimed
                return (
                  <div key={reward.id} className="flex gap-3 items-center">
                    <button
                      onClick={() => redeemReward(reward)}
                      disabled={!affordable || claimed}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg text-lg transition-all ${
                        claimed
                          ? "bg-[#1a1a1a] border-[#444] text-[#777] cursor-not-allowed"
                          : affordable
                              ? "bg-gradient-to-b from-[#ff6b35] to-[#d4532a] border-[#ffd700] text-[#ffd700] hover:brightness-110"
                              : "bg-[#333] border-[#555] text-[#888] cursor-not-allowed"
                      }`}
                      style={{ fontFamily: "var(--font-pixel)" }}
                    >
                      {reward.name} — {reward.points} pts
                    </button>
                    {claimed && (
                      <span className="text-[#4a5a6a]" style={{ fontFamily: "var(--font-pixel)" }}>
                        CLAIMED
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={continueAfterReward}
                className="flex-1 px-4 py-3 border-2 border-[#ffd700] rounded-lg text-[#ffd700] text-lg bg-[#1a2744] hover:brightness-110 transition-all"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                CONTINUE
              </button>
              <button
                onClick={finishClaiming}
                className="flex-1 px-4 py-3 bg-gradient-to-b from-[#ff6b35] to-[#d4532a] border-2 border-[#ffd700] rounded-lg text-[#ffd700] text-lg hover:brightness-110 transition-all"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                CLAIM & FINISH
              </button>
            </div>
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
              Final Score: {finalScore ?? score}
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
