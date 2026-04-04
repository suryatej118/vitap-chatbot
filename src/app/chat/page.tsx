"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "bot";
  content: string;
  place_id?: string;
};

export default function ChatPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Hello! Ask me where a place is. (e.g., 'Find Library')"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setIsLoading(true);

    const start_id =
      typeof window !== "undefined" ? localStorage.getItem("vitap.startPointId") ?? "MAIN_GATE" : "MAIN_GATE";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, start_id }),
      });

      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      if (data?.start_id) {
        localStorage.setItem("vitap.startPointId", data.start_id);
        window.dispatchEvent(new Event("vitap:startPointChanged"));
      }

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data.reply, place_id: data.place_id },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, I encountered an error connecting to the server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex h-[calc(100vh-140px)] flex-col space-y-4">
      <div className="flex-1 overflow-y-auto rounded-xl border bg-white p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                m.role === "user"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{m.content}</div>
              {m.place_id && (
                <a
                  href={`/places/${m.place_id}`}
                  className="mt-2 text-xs font-semibold underline block"
                >
                  View full details →
                </a>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-500">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Where is..."
          className="flex-1 rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-black"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
