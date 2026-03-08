"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();

  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("friendly");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateReply() {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    if (!session?.user?.email) {
      alert("Please login first");
      return;
    }

    setLoading(true);

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

      if (data.reply) {
        setReply(data.reply);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate reply");
    }

    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>Smart Reply Generator</h1>

      <p>Logged in as: {session?.user?.email}</p>

      <textarea
        placeholder="Paste the message you want to reply to..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "100%",
          height: 120,
          padding: 10,
          marginTop: 10,
        }}
      />

      <div style={{ marginTop: 15 }}>
        <label>Tone:</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="friendly">Friendly</option>
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <button
        onClick={generateReply}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Reply"}
      </button>

      {reply && (
        <div style={{ marginTop: 30 }}>
          <h3>AI Reply</h3>
          <p
            style={{
              background: "#f5f5f5",
              padding: 15,
              borderRadius: 8,
            }}
          >
            {reply}
          </p>
        </div>
      )}
    </main>
  );
}