import SkeeBallGame from "../../components/skee-ball-game"

export const metadata = {
  title: "Play Skee Ball",
}

export default function PlayPage({ searchParams }: { searchParams?: { autostart?: string } }) {
  const auto = searchParams?.autostart === "1" || searchParams?.autostart === "true"
  return (
    <main>
      <SkeeBallGame autoStart={auto} />
    </main>
  )
}
