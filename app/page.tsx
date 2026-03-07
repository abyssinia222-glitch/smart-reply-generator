"use client";

import { useState } from "react";

const replyTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "dm", label: "DM" },
  { value: "support", label: "Support" },
];

const tones = [
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
];

const lengths = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

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

  const renderOptionGroup = (
    title: string,
    items: { value: string; label: string }[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <div className="mt-5">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {title}
      </label>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = selected === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelect(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
            AI writing tool
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Smart Reply Generator
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Paste a message, choose the format you want, and generate three
            polished reply options instantly.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Original Message
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
            className="min-h-[170px] w-full rounded-2xl border border-gray-300 p-4 text-gray-900 outline-none transition focus:border-black"
          />

          {renderOptionGroup("Reply Type", replyTypes, replyType, setReplyType)}
          {renderOptionGroup("Tone", tones, tone, setTone)}
          {renderOptionGroup("Reply Length", lengths, length, setLength)}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !message.trim()}
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Replies"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setReplies([]);
                setError("");
              }}
              disabled={loading}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>

            <p className="text-sm text-gray-500">
              Press Ctrl + Enter to generate faster
            </p>
          </div>

          {loading && (
            <p className="mt-4 text-sm text-gray-500">
              Creating reply options...
            </p>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        {replies.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Generated Replies
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose your favorite and copy it with one click.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {replies.map((reply, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reply Option {index + 1}
                    </h3>

                    <button
                      onClick={() => handleCopy(reply, index)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
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
          </div>
        )}
      </div>
    </main>
  );
}