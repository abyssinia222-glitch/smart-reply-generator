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
          content: `Write exactly 3 short ${tone} replies to the user's message. Return only valid JSON in this exact format: ["reply 1", "reply 2", "reply 3"]`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "No replies generated" },
        { status: 500 }
      );
    }

    let replies: string[] = [];

    try {
      const parsed = JSON.parse(content);
      replies = Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === "string").slice(0, 3)
        : [];
    } catch (error) {
      console.error("JSON parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    if (replies.length === 0) {
      return NextResponse.json(
        { error: "No replies generated" },
        { status: 500 }
      );
    }

    if (usage) {
      const { error: updateError } = await supabase
        .from("usage")
        .update({ count: usage.count + 1 })
        .eq("id", usage.id);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update usage" },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase.from("usage").insert({
        user_email: email,
        date: today,
        count: 1,
      });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to save usage" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ replies });
  } catch (error) {
    console.error("Generate route error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}