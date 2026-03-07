"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("friendly");
  const [length, setLength] = useState("medium");
  const [replyType, setReplyType] = useState("text");
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
        body: JSON.stringify({ message, tone, length, replyType }),
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
            placeholder="Paste the message here..."
            className="min-h-[160px] w-full rounded-xl border border-gray-300 p-4 text-gray-900 outline-none focus:border-black"
          />

          {/* Reply Type */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reply Type
            </label>

            <div className="flex flex-wrap gap-3">
              {["text", "email", "dm", "support"].map((type) => (
                <button
                  key={type}
                  onClick={() => setReplyType(type)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    replyType === type
                      ? "bg-black text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tone
            </label>

            <div className="flex flex-wrap gap-3">
              {["friendly", "casual", "professional"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    tone === t
                      ? "bg-black text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reply Length
            </label>

            <div className="flex flex-wrap gap-3">
              {["short", "medium", "long"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    length === l
                      ? "bg-black text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !message.trim()}
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Replies"}
            </button>

            <button
              onClick={() => {
                setMessage("");
                setReplies([]);
                setError("");
              }}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm"
            >
              Clear
            </button>
          </div>

          {loading && (
            <p className="mt-4 text-sm text-gray-500">
              Creating reply options...
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>

        {replies.length > 0 && (
          <div className="space-y-6">
            {replies.map((reply, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">

                  <h2 className="text-lg font-semibold text-gray-900">
                    Reply Option {index + 1}
                  </h2>

                  <button
                    onClick={() => handleCopy(reply, index)}
                    className={`rounded-lg px-4 py-2 text-sm text-white ${
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