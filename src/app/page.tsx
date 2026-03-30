export default function HomePage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">VIT-AP Campus Navigator</h1>
      <p className="text-sm text-gray-600">
        JSON-first campus directory + deterministic assistant (no LLM).
      </p>

      <div className="grid grid-cols-2 gap-3">
        <a className="rounded-lg border bg-white p-4" href="/places">
          Places
        </a>
        <a className="rounded-lg border bg-white p-4" href="/chat">
          Chat
        </a>
        <a className="rounded-lg border bg-white p-4" href="/events">
          Events
        </a>
        <a className="rounded-lg border bg-white p-4" href="/emergency">
          Emergency
        </a>
      </div>
    </main>
  );
}
