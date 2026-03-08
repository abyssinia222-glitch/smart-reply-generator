"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

type ReplyCard = {
  id: number;
  text: string;
};

const DAILY_LIMIT = 20;

export default function AppPage() {
  const { data: session } = useSession();

  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("friendly");
  const [replies, setReplies] = useState<ReplyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [usageCount, setUsageCount] = useState(0);

  async function loadUsage() {
    if (!session?.user?.email) return;

    try {
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      });

      const data = await res.json();
      setUsageCount(data.count || 0);
    } catch (error) {
      console.error("Failed to load usage:", error);
    }
  }

  useEffect(() => {
    loadUsage();
  }, [session?.user?.email]);

  async function handleGenerate() {
    if (!session?.user?.email || !message.trim()) return;

    setLoading(true);
    setError("");
    setReplies([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          tone,
          email: session.user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      const replyList: string[] = data.replies || [];

      setReplies(
        replyList.map((text, index) => ({
          id: index + 1,
          text,
        }))
      );

      setMessage("");
      setUsageCount((prev) => prev + 1);
    } catch (error) {
      console.error("Generate failed:", error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            Smart Reply Generator
          </h1>
          <p className="mb-8 text-gray-600">
            Login to generate reply options and track your daily usage.
          </p>

          <button
            onClick={() => signIn("github")}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Login with GitHub
          </button>
        </div>
      </main>
    );
  }

  const remaining = Math.max(0, DAILY_LIMIT - usageCount);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
              AI writing tool
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Smart Reply Generator
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Logged in as: {session.user?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Upgrade
            </Link>

            <button
              onClick={() => signOut()}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Daily free usage
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {usageCount}/{DAILY_LIMIT} used
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {remaining} remaining
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Need more? Upgrade to Pro.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Message
          </label>

          <textarea
            placeholder="Paste the message you want to reply to..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-gray-300 p-4 text-gray-900 outline-none transition focus:border-black"
          />

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tone
            </label>

            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black"
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !message.trim() || remaining === 0}
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate 3 Replies"}
            </button>
          </div>

          {loading && (
            <p className="mt-4 text-sm text-gray-500">
              Creating reply options...
            </p>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {!loading && !error && replies.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">
                Your reply options will appear here after you generate them.
              </p>
            </div>
          )}
        </div>

        {replies.length > 0 && (
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Reply Options
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Pick your favorite and copy it with one click.
              </p>
            </div>

            <div className="space-y-5">
              {replies.map((reply, index) => (
                <div
                  key={reply.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reply Option {reply.id}
                    </h3>

                    <button
                      onClick={() => handleCopy(reply.text, index)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                        copiedIndex === index ? "bg-green-600" : "bg-black"
                      }`}
                    >
                      {copiedIndex === index ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">
                    {reply.text}
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