import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, tone, email } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: usage, error: usageError } = await supabase
      .from("usage")
      .select("*")
      .eq("user_email", email)
      .eq("date", today)
      .maybeSingle();

    if (usageError) {
      console.error("Supabase read error:", usageError);

      return NextResponse.json(
        { error: "Failed to check usage" },
        { status: 500 }
      );
    }

    if (usage && usage.count >= 20) {
      return NextResponse.json(
        { error: "Daily limit reached" },
        { status: 403 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Generate 3 different ${tone} replies to the user's message.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || "";

    const replies = text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .slice(0, 3);

    if (usage) {
      await supabase
        .from("usage")
        .update({ count: usage.count + 1 })
        .eq("id", usage.id);
    } else {
      await supabase.from("usage").insert({
        user_email: email,
        date: today,
        count: 1,
      });
    }

    return NextResponse.json({
      replies,
    });
  } catch (error) {
    console.error("Generate route error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}