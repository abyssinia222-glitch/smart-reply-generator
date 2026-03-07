"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("friendly");
  const [length, setLength] = useState("medium");
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setReplies([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, tone, length }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate replies.");
        return;
      }

      setReplies(data.replies || []);
    } catch (error) {
      console.error("Failed to generate replies:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Smart Reply Generator
        </h1>

        <p className="mb-8 text-gray-600">
          Generate quick AI replies for messages, emails, or chats.
        </p>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Message
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleGenerate();
              }
            }}
            placeholder="Paste the message here..."
            className="min-h-[160px] w-full rounded-xl border border-gray-300 p-4 text-gray-900 outline-none transition focus:border-black"
          />

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tone
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTone("friendly")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  tone === "friendly"
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Friendly
              </button>

              <button
                onClick={() => setTone("casual")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  tone === "casual"
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Casual
              </button>

              <button
                onClick={() => setTone("professional")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  tone === "professional"
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Professional
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reply Length
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setLength("short")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  length === "short"
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Short
              </button>

              <button
                onClick={() => setLength("medium")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  length === "medium"
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Medium
              </button>

              <button
                onClick={() => setLength("long")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  length === "long"
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Long
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !message.trim()}
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Replies"}
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading || !message.trim()}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Regenerate
            </button>

            <button
              onClick={() => {
                setMessage("");
                setReplies([]);
                setError("");
              }}
              disabled={loading}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>

          {loading && (
            <p className="mt-4 text-sm text-gray-500">
              Creating reply options...
            </p>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        {replies.length > 0 && (
          <div className="space-y-6">
            {replies.map((reply, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Reply Option {index + 1}
                  </h2>

                  <button
                    onClick={() => handleCopy(reply, index)}
                    className={`rounded-lg px-4 py-2 text-sm text-white transition ${
                      copiedIndex === index ? "bg-green-600" : "bg-black"
                    }`}
                  >
                    {copiedIndex === index ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700">
                  {reply}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}