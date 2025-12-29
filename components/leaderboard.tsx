"use client"

import type { LeaderboardEntry } from "./skee-ball-game"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
}

export function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <div className="relative">
      {/* Decorative lanterns on sides */}
      <div className="absolute -left-4 top-1/4 w-6 h-8 bg-gradient-to-b from-[#ff6b35] to-[#ff4500] rounded-full opacity-80 shadow-[0_0_15px_#ff6b35] lantern-glow" />
      <div className="absolute -right-4 top-1/4 w-6 h-8 bg-gradient-to-b from-[#ff6b35] to-[#ff4500] rounded-full opacity-80 shadow-[0_0_15px_#ff6b35] lantern-glow" />
      <div className="absolute -left-4 top-3/4 w-6 h-8 bg-gradient-to-b from-[#ff6b35] to-[#ff4500] rounded-full opacity-80 shadow-[0_0_15px_#ff6b35] lantern-glow" />
      <div className="absolute -right-4 top-3/4 w-6 h-8 bg-gradient-to-b from-[#ff6b35] to-[#ff4500] rounded-full opacity-80 shadow-[0_0_15px_#ff6b35] lantern-glow" />

      {/* Main frame - increased size */}
      <div className="bg-gradient-to-b from-[#3d2817] to-[#2d1810] border-4 border-[#d4a574] rounded-lg p-6 shadow-2xl">
        {/* Header with decorative elements - larger header */}
        <div className="relative bg-gradient-to-r from-[#1a0a0a] via-[#2d1810] to-[#1a0a0a] border-2 border-[#d4a574] rounded-lg p-4 mb-6">
          {/* Decorative dots */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
            <div className="w-2 h-2 bg-[#ffd700] rounded-full shadow-[0_0_5px_#ffd700]" />
            <div className="w-2 h-2 bg-[#ffd700] rounded-full shadow-[0_0_5px_#ffd700]" />
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <div className="w-2 h-2 bg-[#ffd700] rounded-full shadow-[0_0_5px_#ffd700]" />
            <div className="w-2 h-2 bg-[#ffd700] rounded-full shadow-[0_0_5px_#ffd700]" />
          </div>

          <h2 className="text-center text-2xl md:text-3xl text-[#ffd700]" style={{ fontFamily: "var(--font-pixel)" }}>
            LEADERBOARD
          </h2>
        </div>

        {/* Table - larger table with more spacing */}
        <div className="bg-[#1a0a0a] border-2 border-[#d4a574] rounded-lg overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-3 bg-gradient-to-r from-[#2d1810] to-[#3d2817] border-b-2 border-[#d4a574] p-4">
            <span className="text-[#ffd700] text-base md:text-lg font-bold" style={{ fontFamily: "var(--font-pixel)" }}>
              RANK
            </span>
            <span
              className="text-[#ffd700] text-base md:text-lg font-bold text-center"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              PLAYER
            </span>
            <span
              className="text-[#ffd700] text-base md:text-lg font-bold text-right"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              SCORE
            </span>
          </div>

          {/* Data rows */}
          {entries.map((entry, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 p-4 border-b border-[#3d2817] transition-all ${
                entry.name === "PLAYER" ? "bg-[#2d1810]/50 shadow-[inset_0_0_20px_#ffd700/20]" : ""
              }`}
            >
              <span
                className="text-[#d4a574] text-base md:text-lg font-bold"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                #{entry.rank}
              </span>
              <span
                className="text-[#d4a574] text-base md:text-lg text-center truncate"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                {entry.name}
              </span>
              <span
                className="text-[#d4a574] text-base md:text-lg font-bold text-right"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                {entry.score}
              </span>
            </div>
          ))}
        </div>

        {/* Decorative bottom lights */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: i % 2 === 0 ? "#ff6b35" : "#ffd700",
                boxShadow: `0 0 8px ${i % 2 === 0 ? "#ff6b35" : "#ffd700"}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
