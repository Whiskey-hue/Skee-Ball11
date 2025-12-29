"use client"

import type { Reward } from "./skee-ball-game"

interface GameHeaderProps {
  score: number
  rewards: Reward[]
  onRewardsClick: () => void
}

export function GameHeader({ score, rewards, onRewardsClick }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
      <h1
        className="text-3xl md:text-5xl text-[#ffd700] drop-shadow-[0_0_10px_#ffd700]"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        Skee Ball
      </h1>

      <button onClick={onRewardsClick} className="flex items-center gap-3 hover:scale-105 transition-transform">
        {rewards.map((reward) => {
          const isUnlocked = score >= reward.points
          return (
            <div
              key={reward.id}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center transition-all duration-300 ${
                reward.claimed
                  ? "bg-gradient-to-b from-[#4a5a6a]/50 to-[#2a3a4a]/50"
                  : isUnlocked
                    ? "bg-gradient-to-b from-[#ffd700]/30 to-[#ff8c00]/30 shadow-[0_0_20px_#ffd700] animate-pulse"
                    : "bg-[#1a2744]/80"
              }`}
            >
              {reward.icon === "bunny" && (
                <svg
                  viewBox="0 0 48 48"
                  className={`w-10 h-10 ${reward.claimed ? "opacity-60" : isUnlocked ? "opacity-100" : "opacity-40"}`}
                >
                  <ellipse
                    cx="18"
                    cy="8"
                    rx="5"
                    ry="12"
                    fill={reward.claimed ? "#666" : isUnlocked ? "#f8d7da" : "#666"}
                  />
                  <ellipse
                    cx="18"
                    cy="8"
                    rx="2.5"
                    ry="8"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ffb6c1" : "#555"}
                  />
                  <ellipse
                    cx="30"
                    cy="8"
                    rx="5"
                    ry="12"
                    fill={reward.claimed ? "#666" : isUnlocked ? "#f8d7da" : "#666"}
                  />
                  <ellipse
                    cx="30"
                    cy="8"
                    rx="2.5"
                    ry="8"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ffb6c1" : "#555"}
                  />
                  <circle cx="24" cy="28" r="14" fill={reward.claimed ? "#666" : isUnlocked ? "#f8d7da" : "#666"} />
                  <circle cx="19" cy="26" r="2" fill={reward.claimed ? "#444" : isUnlocked ? "#333" : "#444"} />
                  <circle cx="29" cy="26" r="2" fill={reward.claimed ? "#444" : isUnlocked ? "#333" : "#444"} />
                  <ellipse
                    cx="24"
                    cy="32"
                    rx="2"
                    ry="1.5"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ffb6c1" : "#555"}
                  />
                  <circle
                    cx="16"
                    cy="30"
                    r="3"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ffb6c1" : "#555"}
                    opacity="0.6"
                  />
                  <circle
                    cx="32"
                    cy="30"
                    r="3"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ffb6c1" : "#555"}
                    opacity="0.6"
                  />
                </svg>
              )}
              {reward.icon === "ferris" && (
                <svg
                  viewBox="0 0 48 48"
                  className={`w-10 h-10 ${reward.claimed ? "opacity-60" : isUnlocked ? "opacity-100" : "opacity-40"}`}
                >
                  <circle
                    cx="24"
                    cy="20"
                    r="14"
                    fill="none"
                    stroke={reward.claimed ? "#666" : isUnlocked ? "#9b7ed9" : "#666"}
                    strokeWidth="3"
                  />
                  <circle cx="24" cy="20" r="3" fill={reward.claimed ? "#666" : isUnlocked ? "#ffd700" : "#666"} />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180
                    const x = 24 + 14 * Math.cos(rad)
                    const y = 20 + 14 * Math.sin(rad)
                    return (
                      <g key={i}>
                        <line
                          x1="24"
                          y1="20"
                          x2={x}
                          y2={y}
                          stroke={reward.claimed ? "#666" : isUnlocked ? "#9b7ed9" : "#666"}
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill={
                            reward.claimed
                              ? "#555"
                              : isUnlocked
                                ? ["#ff6b6b", "#ffd700", "#6bff6b", "#6bb5ff"][i % 4]
                                : "#555"
                          }
                        />
                      </g>
                    )
                  })}
                  <line
                    x1="18"
                    y1="34"
                    x2="12"
                    y2="46"
                    stroke={reward.claimed ? "#666" : isUnlocked ? "#9b7ed9" : "#666"}
                    strokeWidth="3"
                  />
                  <line
                    x1="30"
                    y1="34"
                    x2="36"
                    y2="46"
                    stroke={reward.claimed ? "#666" : isUnlocked ? "#9b7ed9" : "#666"}
                    strokeWidth="3"
                  />
                </svg>
              )}
              {reward.icon === "cake" && (
                <svg
                  viewBox="0 0 48 48"
                  className={`w-10 h-10 ${reward.claimed ? "opacity-60" : isUnlocked ? "opacity-100" : "opacity-40"}`}
                >
                  <rect
                    x="8"
                    y="28"
                    width="32"
                    height="16"
                    rx="2"
                    fill={reward.claimed ? "#666" : isUnlocked ? "#f5deb3" : "#666"}
                  />
                  <rect
                    x="8"
                    y="28"
                    width="32"
                    height="4"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ffb6c1" : "#555"}
                  />
                  <rect
                    x="12"
                    y="20"
                    width="24"
                    height="8"
                    rx="2"
                    fill={reward.claimed ? "#666" : isUnlocked ? "#ffe4b5" : "#666"}
                  />
                  <rect
                    x="12"
                    y="20"
                    width="24"
                    height="3"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ffb6c1" : "#555"}
                  />
                  <rect
                    x="16"
                    y="14"
                    width="16"
                    height="6"
                    rx="2"
                    fill={reward.claimed ? "#666" : isUnlocked ? "#f5deb3" : "#666"}
                  />
                  <rect
                    x="16"
                    y="14"
                    width="16"
                    height="2"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#87ceeb" : "#555"}
                  />
                  <rect
                    x="18"
                    y="8"
                    width="2"
                    height="6"
                    fill={reward.claimed ? "#666" : isUnlocked ? "#ffd700" : "#666"}
                  />
                  <rect
                    x="23"
                    y="8"
                    width="2"
                    height="6"
                    fill={reward.claimed ? "#666" : isUnlocked ? "#ffd700" : "#666"}
                  />
                  <rect
                    x="28"
                    y="8"
                    width="2"
                    height="6"
                    fill={reward.claimed ? "#666" : isUnlocked ? "#ffd700" : "#666"}
                  />
                  <ellipse
                    cx="19"
                    cy="6"
                    rx="2"
                    ry="3"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ff6b6b" : "#555"}
                  />
                  <ellipse
                    cx="24"
                    cy="6"
                    rx="2"
                    ry="3"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ff6b6b" : "#555"}
                  />
                  <ellipse
                    cx="29"
                    cy="6"
                    rx="2"
                    ry="3"
                    fill={reward.claimed ? "#555" : isUnlocked ? "#ff6b6b" : "#555"}
                  />
                </svg>
              )}
              {reward.icon === "star" && (
                <svg
                  viewBox="0 0 48 48"
                  className={`w-10 h-10 ${reward.claimed ? "opacity-60" : isUnlocked ? "opacity-100" : "opacity-40"}`}
                >
                  <defs>
                    <linearGradient id={`starGrad-${reward.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={reward.claimed ? "#666" : isUnlocked ? "#ffd700" : "#666"} />
                      <stop offset="100%" stopColor={reward.claimed ? "#555" : isUnlocked ? "#ff8c00" : "#555"} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M24 4 L28 16 L40 18 L31 27 L34 40 L24 34 L14 40 L17 27 L8 18 L20 16 Z"
                    fill={`url(#starGrad-${reward.id})`}
                  />
                  <circle cx="20" cy="20" r="2" fill={reward.claimed ? "#444" : isUnlocked ? "#333" : "#444"} />
                  <circle cx="28" cy="20" r="2" fill={reward.claimed ? "#444" : isUnlocked ? "#333" : "#444"} />
                  <path
                    d="M20 26 Q24 30 28 26"
                    fill="none"
                    stroke={reward.claimed ? "#444" : isUnlocked ? "#333" : "#444"}
                    strokeWidth="1.5"
                  />
                </svg>
              )}
            </div>
          )
        })}
      </button>

      {/* Score box */}
      <div className="bg-gradient-to-b from-[#3d2817] to-[#2d1810] border-4 border-[#d4a574] rounded-lg px-6 py-2 min-w-[100px]">
        <span className="text-2xl md:text-3xl text-[#ffd700]" style={{ fontFamily: "var(--font-pixel)" }}>
          {score}
        </span>
      </div>
    </div>
  )
}
