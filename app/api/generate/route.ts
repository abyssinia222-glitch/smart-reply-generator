import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, tone, length } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const selectedTone =
      tone === "casual" || tone === "professional" || tone === "friendly"
        ? tone
        : "friendly";

    const selectedLength =
      length === "short" || length === "medium" || length === "long"
        ? length
        : "medium";

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Generate exactly 3 short, natural reply options in a ${selectedTone} tone. Each reply should be ${selectedLength} length. Return only valid JSON in this exact format: ["reply 1", "reply 2", "reply 3"]`,
        },
        {
          role: "user",
          content: `Message: ${message}`,
        },
      ],
      temperature: 0.8,
    });

    const text = completion.choices[0]?.message?.content || "[]";

    let replies: string[] = [];

    try {
      const parsed = JSON.parse(text);
      replies = Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === "string").slice(0, 3)
        : [];
    } catch {
      replies = [];
    }

    if (replies.length === 0) {
      replies = [
        "Thanks for your message.",
        "Happy to chat more.",
        "Appreciate you reaching out.",
      ];
    }

    return NextResponse.json({ replies });
  } catch (error) {
    console.error("OpenAI error:", error);

    return NextResponse.json(
      { error: "Something went wrong while generating replies." },
      { status: 500 }
    );
  }
}