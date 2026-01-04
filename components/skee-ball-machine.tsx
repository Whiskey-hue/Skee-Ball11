"use client"

import { useState, useRef, useEffect } from "react"

interface SkeeBallMachineProps {
  ballsLeft: number
  onScore: (points: number) => void
  gameOver: boolean
}

interface BallState {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  vr: number
  active: boolean
  landed: boolean
  landedHole: string | null
  phase: "rolling" | "airborne" | "bouncing" | "falling"
  z: number
  vz: number
  launchedAt?: number
}

interface Hole {
  id: string
  x: number
  y: number
  radius: number
  points: number
}

const HOLES: Hole[] = [
  { id: "center50", x: 50, y: 32, radius: 8, points: 50 },
  { id: "ring30", x: 50, y: 24, radius: 6, points: 30 },
  { id: "ring20", x: 50, y: 16, radius: 6, points: 20 },
  { id: "top10", x: 50, y: 8, radius: 6, points: 10 },
  { id: "left30", x: 22, y: 24, radius: 7, points: 30 },
  { id: "right20", x: 78, y: 24, radius: 7, points: 20 },
]

const RAMP_Y = 48
const RAMP_HEIGHT = 8

export function SkeeBallMachine({ ballsLeft, onScore, gameOver }: SkeeBallMachineProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [throwPower, setThrowPower] = useState(0)
  const [throwAngle, setThrowAngle] = useState(0)
  const [ball, setBall] = useState<BallState>({
    x: 50,
    y: 88,
    vx: 0,
    vy: 0,
    rotation: 0,
    vr: 0,
    active: false,
    landed: false,
    landedHole: null,
    phase: "rolling",
    z: 0,
    vz: 0,
    launchedAt: 0,
  })
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [litHole, setLitHole] = useState<string | null>(null)
  const startPosRef = useRef({ x: 0, y: 0 })
  const machineRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  // guard to ensure each launch only triggers one scoring event
  const launchedHandledRef = useRef(false)

  const handleStart = (clientX: number, clientY: number) => {
    if (gameOver || ballsLeft === 0 || ball.active) return
    setIsDragging(true)
    startPosRef.current = { x: clientX, y: clientY }
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !machineRef.current) return

    const deltaY = startPosRef.current.y - clientY
    const deltaX = clientX - startPosRef.current.x

    const power = Math.max(0, Math.min(100, deltaY / 1.5))
    const angle = Math.max(-30, Math.min(30, deltaX / 3))

    setThrowPower(power)
    setThrowAngle(angle)
  }

  const handleEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (throwPower > 15) {
      launchBall()
    }
    setThrowPower(0)
    setThrowAngle(0)
  }

  const launchBall = () => {
    const speed = throwPower * 0.28
    const angleRad = (throwAngle * Math.PI) / 180

    // reset per-launch guard
    launchedHandledRef.current = false

    setBall({
      x: 50,
      y: 88,
      vx: Math.sin(angleRad) * speed * 0.5,
      vy: -speed,
      rotation: 0,
      vr: speed * 3,
      active: true,
      landed: false,
      landedHole: null,
      phase: "rolling",
      z: 0,
      vz: 0,
      launchedAt: Date.now(),
    })
  }

  useEffect(() => {
    if (!ball.active || ball.landed) return

    const updateBall = () => {
      setBall((prev) => {
        if (!prev.active || prev.landed) return prev

        // Fail-safe: if ball has been active for too long, reset it and count as a miss
        if (prev.launchedAt && Date.now() - prev.launchedAt > 6000) {
          // mark that this launch has been handled so we don't double-score
          launchedHandledRef.current = true
          // short timeout to let UI reflect final state before resetting
          setTimeout(() => {
            setBall({
              x: 50,
              y: 88,
              vx: 0,
              vy: 0,
              rotation: 0,
              vr: 0,
              active: false,
              landed: false,
              landedHole: null,
              phase: "rolling",
              z: 0,
              vz: 0,
              launchedAt: 0,
            })
            // only call onScore if this launch was the one that scheduled it
            if (launchedHandledRef.current) {
              onScore(0)
              launchedHandledRef.current = false
            }
          }, 100)
          return { ...prev, active: false }
        }

        let newX = prev.x
        let newY = prev.y
        let newVx = prev.vx
        let newVy = prev.vy
        const newVr = prev.vr
        let newZ = prev.z
        let newVz = prev.vz
        let newPhase = prev.phase

        if (newPhase === "rolling") {
          newX += newVx
          newVx *= 0.995
          newVy *= 0.995
          newVy += 0.03

          // Update Y to follow ramp slope
          const distFromCenter = Math.abs(50 - newX)
          const slope = 48 / 50
          newY = 48 - slope * distFromCenter

          if (newX < 18) {
            newX = 18
            newVx = Math.abs(newVx) * 0.7
          }
          if (newX > 82) {
            newX = 82
            newVx = -Math.abs(newVx) * 0.7
          }

          if (newY <= RAMP_Y && newVy < 0) {
            newPhase = "airborne"
            const launchPower = Math.abs(newVy) * 1.3
            newVz = launchPower * 0.9
            newVy = newVy * 0.5
          }

          if (newY > 95) {
            // prevent double scoring for this launch
            launchedHandledRef.current = true
            setTimeout(() => {
              setBall({
                x: 50,
                y: 88,
                vx: 0,
                vy: 0,
                rotation: 0,
                vr: 0,
                active: false,
                landed: false,
                landedHole: null,
                phase: "rolling",
                z: 0,
                vz: 0,
                launchedAt: 0,
              })
              if (launchedHandledRef.current) {
                onScore(0)
                launchedHandledRef.current = false
              }
            }, 200)
            return { ...prev, active: false }
          }
        }

        if (newPhase === "airborne") {
          newX += newVx
          newY += newVy
          newZ += newVz
          newVz -= 0.28
          newVx *= 0.99
          newVy *= 0.99

          if (newX < 8) {
            newX = 8
            newVx = Math.abs(newVx) * 0.5
          }
          if (newX > 92) {
            newX = 92
            newVx = -Math.abs(newVx) * 0.5
          }

          if (newZ <= 0 && newY < RAMP_Y) {
            newZ = 0
            newPhase = "bouncing"
            newVz = Math.abs(newVz) * 0.4
            if (newVz < 0.5) {
              newPhase = "falling"
            }
          }

          if (newZ <= 0 && newY >= RAMP_Y) {
            newPhase = "rolling"
            newZ = 0
            newVz = 0
            newVy = 0.5
          }
        }

        if (newPhase === "bouncing") {
          newX += newVx
          newY += newVy
          newZ += newVz
          newVz -= 0.22
          newVx *= 0.95
          newVy *= 0.95

          if (newX < 8) {
            newX = 8
            newVx = Math.abs(newVx) * 0.4
          }
          if (newX > 92) {
            newX = 92
            newVx = -Math.abs(newVx) * 0.4
          }
          if (newY < 5) {
            newY = 5
            newVy = Math.abs(newVy) * 0.4
          }

          if (newZ <= 0) {
            newZ = 0
            if (Math.abs(newVz) > 0.3) {
              newVz = Math.abs(newVz) * 0.35
            } else {
              newPhase = "falling"
              newVz = 0
            }
          }
        }

        if (newPhase === "falling") {
          newX += newVx
          newY += newVy
          newVx *= 0.92
          newVy *= 0.92
          newVy += 0.1

          if (newX < 8) {
            newX = 8
            newVx = Math.abs(newVx) * 0.3
          }
          if (newX > 92) {
            newX = 92
            newVx = -Math.abs(newVx) * 0.3
          }

          for (const hole of HOLES) {
            const dx = newX - hole.x
            const dy = newY - hole.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < hole.radius) {
              setLitHole(hole.id)
              setLastScore(hole.points)

              // mark this launch handled so other detectors won't schedule a duplicate
              launchedHandledRef.current = true

              setTimeout(() => {
                if (launchedHandledRef.current) {
                  onScore(hole.points)
                  launchedHandledRef.current = false
                }
                setLitHole(null)
                setLastScore(null)
                setBall({
                  x: 50,
                  y: 88,
                  vx: 0,
                  vy: 0,
                  rotation: 0,
                  vr: 0,
                  active: false,
                  landed: false,
                  landedHole: null,
                  phase: "rolling",
                  z: 0,
                  vz: 0,
                  launchedAt: 0,
                })
              }, 3000)

              return {
                ...prev,
                x: hole.x,
                y: hole.y,
                vx: 0,
                vy: 0,
                vr: 0,
                z: 0,
                vz: 0,
                active: true,
                landed: true,
                landedHole: hole.id,
                phase: "falling",
              }
            }
          }

          if (newY > RAMP_Y + 5) {
            // mark handled and schedule a miss
            launchedHandledRef.current = true
            setTimeout(() => {
              setBall({
                x: 50,
                y: 88,
                vx: 0,
                vy: 0,
                rotation: 0,
                vr: 0,
                active: false,
                landed: false,
                landedHole: null,
                phase: "rolling",
                z: 0,
                vz: 0,
                launchedAt: 0,
              })
              if (launchedHandledRef.current) {
                onScore(0)
                launchedHandledRef.current = false
              }
            }, 300)
            return { ...prev, active: false }
          }
        }

        // Instant hole detection at any phase when close enough vertically and horizontally
        for (const hole of HOLES) {
          const dx = newX - hole.x
          const dy = newY - hole.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Only allow scoring when the ball is downward-moving (falling) and close enough to the hole
          if ((newPhase === "falling" || (newPhase === "bouncing" && newVy > 0)) && dist < hole.radius * 0.85 && newVy > 0) {
            setLitHole(hole.id)
            setLastScore(hole.points)

            // mark handled so other checks won't also schedule a score
            launchedHandledRef.current = true

            setTimeout(() => {
              if (launchedHandledRef.current) {
                onScore(hole.points)
                launchedHandledRef.current = false
              }
              setLitHole(null)
              setLastScore(null)
              setBall({
                x: 50,
                y: 88,
                vx: 0,
                vy: 0,
                rotation: 0,
                vr: 0,
                active: false,
                landed: false,
                landedHole: null,
                phase: "rolling",
                z: 0,
                vz: 0,
                launchedAt: 0,
              })
            }, 400)

            return {
              ...prev,
              x: hole.x,
              y: hole.y,
              vx: 0,
              vy: 0,
              vr: 0,
              z: 0,
              vz: 0,
              active: true,
              landed: true,
              landedHole: hole.id,
              phase: "falling",
            }

        }
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          rotation: prev.rotation + newVr,
          vr: newVr * 0.98,
          z: newZ,
          vz: newVz,
          phase: newPhase,
        }
      })

      animationRef.current = requestAnimationFrame(updateBall)
    }

    animationRef.current = requestAnimationFrame(updateBall)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [ball.active, ball.landed, onScore])

  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-[#1a2744] to-[#0f1729] rounded-t-[40px] shadow-2xl overflow-hidden border-4 border-[#8b6914]">
        {/* Header section with SKEE BALL text and lights */}
        <div className="relative bg-gradient-to-b from-[#6b1a1a] to-[#4a1212] pt-2 pb-4 border-b-4 border-[#8b6914]">
          {/* Top decorative arch */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-gradient-to-b from-[#8b6914] to-[#6b5010] rounded-t-full" />

          {/* SKEE BALL text */}
          {/* Light bulbs row */}
          <div className="relative flex justify-center gap-3 mt-4 mb-2 px-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-gradient-to-b from-[#ffd700] to-[#ff8c00] shadow-[0_0_12px_#ffd700,0_0_20px_#ff8c00] animate-pulse"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>

          <div className="relative text-center">
            <h2
              className="text-2xl md:text-3xl tracking-wider text-[#ffd700]"
              style={{
                fontFamily: "var(--font-pixel)",
                textShadow: "0 0 15px #ffd700, 0 3px 0 #8b6914, 2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              SKEE BALL
            </h2>
          </div>
        </div>

        {/* Main playing area */}
        <div
          ref={machineRef}
          className="relative h-[420px] md:h-[500px] overflow-hidden cursor-pointer select-none"
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEnd}
        >
          {/* Target area background - dark maroon */}
          <div className="absolute top-0 left-0 right-0 h-[46%] bg-gradient-to-b from-[#1a0505] via-[#2a0a0a] to-[#3d1010]">
            {/* Red glow from header */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#6b1a1a]/60 to-transparent" />
          </div>

          {/* Lane area - deep red velvet */}
          <div className="absolute top-[46%] left-0 right-0 bottom-0 bg-gradient-to-b from-[#5c1a1a] via-[#7a2020] to-[#4a1515]">
            {/* Subtle lane texture */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-[18%] right-[18%] h-px bg-[#2a0505]"
                  style={{ top: `${15 + i * 15}%` }}
                />
              ))}
            </div>
          </div>

          {/* Side rails - wooden with golden trim */}
          <div className="absolute left-[10%] top-[46%] bottom-0 w-5 bg-gradient-to-r from-[#8b6914] via-[#d4a574] to-[#8b6914] rounded-t-sm shadow-[2px_0_8px_rgba(0,0,0,0.5)]">
            {/* Inner red stripe */}
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-[#6b1a1a] to-[#4a1212]" />
          </div>
          <div className="absolute right-[10%] top-[46%] bottom-0 w-5 bg-gradient-to-l from-[#8b6914] via-[#d4a574] to-[#8b6914] rounded-t-sm shadow-[-2px_0_8px_rgba(0,0,0,0.5)]">
            {/* Inner red stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-[#6b1a1a] to-[#4a1212]" />
          </div>

          {/* Ramp / Launch area */}
          <div
            className="absolute left-[15%] right-[15%] h-[6%] bg-gradient-to-b from-[#5a4a3a] via-[#7a6a5a] to-[#4a3a2a] rounded-t-[100%] border-t-2 border-[#9a8a7a]"
            style={{ top: "42%" }}
          >
            {/* Ramp highlight */}
            <div className="absolute top-0 left-[15%] right-[15%] h-1 bg-gradient-to-r from-transparent via-[#b0a090] to-transparent rounded-full" />
          </div>

          {/* Target holes container */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] h-[42%]">
            {/* Top 10 point hole */}
            <div
              className={`absolute top-[4%] left-1/2 -translate-x-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] ${
                litHole === "top10"
                  ? "bg-[#ffd700] border-[#ffec80] shadow-[0_0_40px_#ffd700,inset_0_0_20px_#ff8c00]"
                  : "bg-[#0a0303] border-[#4a3020] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]"
              }`}
            >
              <span
                className={`text-base md:text-lg font-bold transition-colors ${litHole === "top10" ? "text-[#1a0a0a]" : "text-[#ffd700]"}`}
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                10
              </span>
            </div>

            {/* 20 point hole */}
            <div
              className={`absolute top-[24%] left-1/2 -translate-x-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] ${
                litHole === "ring20"
                  ? "bg-[#ffd700] border-[#ffec80] shadow-[0_0_40px_#ffd700,inset_0_0_20px_#ff8c00]"
                  : "bg-[#0a0303] border-[#4a3020] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]"
              }`}
            >
              <span
                className={`text-base md:text-lg font-bold transition-colors ${litHole === "ring20" ? "text-[#1a0a0a]" : "text-[#ffd700]"}`}
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                20
              </span>
            </div>

            {/* Left 30 hole */}
            <div
              className={`absolute top-[36%] left-[8%] w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] ${
                litHole === "left30"
                  ? "bg-[#ffd700] border-[#ffec80] shadow-[0_0_40px_#ffd700,inset_0_0_20px_#ff8c00]"
                  : "bg-[#0a0303] border-[#4a3020] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]"
              }`}
            >
              <span
                className={`text-base md:text-lg font-bold transition-colors ${litHole === "left30" ? "text-[#1a0a0a]" : "text-[#ffd700]"}`}
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                30
              </span>
            </div>

            {/* Right 20 hole */}
            <div
              className={`absolute top-[36%] right-[8%] w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] ${
                litHole === "right20"
                  ? "bg-[#ffd700] border-[#ffec80] shadow-[0_0_40px_#ffd700,inset_0_0_20px_#ff8c00]"
                  : "bg-[#0a0303] border-[#4a3020] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]"
              }`}
            >
              <span
                className={`text-base md:text-lg font-bold transition-colors ${litHole === "right20" ? "text-[#1a0a0a]" : "text-[#ffd700]"}`}
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                20
              </span>
            </div>

            {/* Center 30 hole (ring around 50) */}
            <div
              className={`absolute top-[44%] left-1/2 -translate-x-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] ${
                litHole === "ring30"
                  ? "bg-[#ffd700] border-[#ffec80] shadow-[0_0_40px_#ffd700,inset_0_0_20px_#ff8c00]"
                  : "bg-[#0a0303] border-[#4a3020] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]"
              }`}
            >
              <span
                className={`text-base md:text-lg font-bold transition-colors ${litHole === "ring30" ? "text-[#1a0a0a]" : "text-[#ffd700]"}`}
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                30
              </span>
            </div>

            {/* Center 50 hole - biggest and most prominent */}
            <div
              className={`absolute top-[66%] left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                litHole === "center50"
                  ? "bg-[#ffd700] border-[#ffec80] shadow-[0_0_50px_#ffd700,inset_0_0_25px_#ff8c00]"
                  : "bg-[#0a0303] border-[#c9a227] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9),0_0_15px_rgba(201,162,39,0.3)]"
              }`}
            >
              <span
                className={`text-xl md:text-2xl font-bold transition-colors ${litHole === "center50" ? "text-[#1a0a0a]" : "text-[#ffd700]"}`}
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                50
              </span>
            </div>

            {/* Concentric ring decorations */}
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[70%] rounded-full border-2 border-[#3a2515]/50 pointer-events-none" />
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full border-2 border-[#3a2515]/50 pointer-events-none" />
          </div>

          {/* Score popup animation */}
          {lastScore !== null && lastScore > 0 && (
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce z-20">
              <span
                className="text-4xl md:text-5xl text-[#ffd700] drop-shadow-[0_0_20px_#ffd700]"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                +{lastScore}
              </span>
            </div>
          )}

          {/* The Ball */}
          {(ball.active || (!ball.active && ballsLeft > 0 && !gameOver)) && (
            <div
              className="absolute w-7 h-7 md:w-8 md:h-8 transition-none z-10"
              style={{
                left: `calc(${ball.active ? ball.x : 50}% - 14px)`,
                top: `calc(${ball.active ? ball.y : 88}% - 14px)`,
                transform: `rotate(${ball.rotation}deg) scale(${
                  isDragging ? 1 + throwPower * 0.003 : 1 + ball.z * 0.03
                })`,
                filter:
                  ball.z > 0
                    ? `drop-shadow(${ball.z * 0.5}px ${ball.z * 0.5}px ${ball.z * 0.3}px rgba(0,0,0,0.5))`
                    : "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))",
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500 shadow-lg relative overflow-hidden">
                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-90" />
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-gray-600 rounded-full opacity-50" />
                <div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{ transform: `rotate(${ball.rotation * 2}deg)` }}
                >
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400 -translate-y-1/2 opacity-30" />
                </div>
              </div>
            </div>
          )}

          {/* Ball shadow when airborne */}
          {ball.active && ball.z > 0 && (
            <div
              className="absolute w-6 h-3 bg-black/30 rounded-full blur-sm"
              style={{
                left: `calc(${ball.x}% - 12px)`,
                top: `calc(${ball.y}% + ${ball.z * 0.5}px)`,
                transform: `scale(${1 - ball.z * 0.02})`,
              }}
            />
          )}

          {/* Power & Direction indicator */}
          {isDragging && (
            <>
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-36 h-3 bg-[#1a0a0a] rounded-full overflow-hidden border-2 border-[#8b6914]">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-75 rounded-full"
                  style={{ width: `${throwPower}%` }}
                />
              </div>
              <div
                className="absolute bottom-16 left-1/2 text-[#ffd700] text-2xl"
                style={{ transform: `translateX(-50%) rotate(${-throwAngle}deg)` }}
              >
                ↑
              </div>
            </>
          )}

          {/* Instructions */}
          {!isDragging && !ball.active && ballsLeft > 0 && !gameOver && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <p
                className="text-[#ffd700] text-xs md:text-sm animate-pulse"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                Drag up to throw!
              </p>
            </div>
          )}
        </div>

        {/* Bottom section with ball tray */}
        <div className="bg-gradient-to-b from-[#1a2744] to-[#0f1729] border-t-4 border-[#8b6914] p-4">
          {/* Ball holder tray */}
          <div className="bg-gradient-to-b from-[#0a0f1a] to-[#050810] border-3 border-[#8b6914] rounded-lg p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <div className="flex justify-center gap-4 md:gap-5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-full border-2 transition-all ${
                    i < ballsLeft
                      ? "bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500 border-[#6a6a6a] shadow-lg"
                      : "bg-[#0a0f1a] border-[#2a3a4a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  }`}
                >
                  {i < ballsLeft && (
                    <div className="relative w-full h-full rounded-full">
                      <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white rounded-full opacity-80" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* BALLS LEFT label */}
          <div className="bg-gradient-to-b from-[#0f1520] to-[#080c12] border-2 border-[#8b6914] rounded-lg p-2 mt-3">
            <p className="text-center text-sm md:text-base text-[#ffd700]" style={{ fontFamily: "var(--font-pixel)" }}>
              BALLS LEFT
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
