"use client"

export function Lanterns() {
  const lanternPositions = [
    { left: "5%", top: "10%" },
    { left: "15%", top: "5%" },
    { left: "25%", top: "15%" },
    { left: "75%", top: "10%" },
    { left: "85%", top: "5%" },
    { left: "95%", top: "12%" },
    { left: "10%", top: "40%" },
    { left: "90%", top: "35%" },
  ]

  return (
    <>
      {lanternPositions.map((pos, i) => (
        <div key={i} className="absolute lantern-glow" style={{ left: pos.left, top: pos.top }}>
          <div className="relative">
            <div className="w-8 h-10 md:w-10 md:h-12 bg-gradient-to-b from-[#ff6b35] to-[#ff4500] rounded-full opacity-80 shadow-[0_0_20px_#ff6b35]" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-[#8b4513] rounded-t-lg" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#d4a574]" />
          </div>
        </div>
      ))}
    </>
  )
}
