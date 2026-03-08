import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("usage")
      .select("*")
      .eq("user_email", email)
      .eq("date", today)
      .maybeSingle();

    if (error) {
      console.error("Usage route error:", error);
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    return NextResponse.json({ count: data?.count || 0 });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}