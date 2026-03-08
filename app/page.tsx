"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
              AI writing tool
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Smart Reply Generator
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Pricing
            </Link>

            {session ? (
              <button
                onClick={() => signOut()}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Login with GitHub
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
              For messages, email, and chat
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">
              Write smarter replies in seconds
            </h2>
            <p className="mt-4 text-gray-600">
              Generate polished reply options with AI, save time, and sound more
              confident in every conversation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Open App
              </Link>

              <Link
                href="/pricing"
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                View Pricing
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              Why people would pay for this
            </h3>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="font-medium text-gray-900">Save time</p>
                <p className="mt-1 text-sm text-gray-600">
                  Generate 3 reply options instantly instead of staring at a
                  blank box.
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="font-medium text-gray-900">Sound better</p>
                <p className="mt-1 text-sm text-gray-600">
                  Choose friendly, casual, or professional replies depending on
                  the situation.
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="font-medium text-gray-900">Use it daily</p>
                <p className="mt-1 text-sm text-gray-600">
                  Great for email, customer support, networking, and quick
                  messages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}