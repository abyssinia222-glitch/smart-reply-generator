import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { review } = await req.json();

    if (!review || typeof review !== "string") {
      return Response.json({ error: "Review is required" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a business owner replying to Google reviews.

First determine if the review is:
• Positive
• Neutral
• Negative

Then write 3 different reply options.

Guidelines:

If POSITIVE:
• thank the customer
• show appreciation
• invite them back

If NEGATIVE:
• apologize sincerely
• acknowledge the issue
• show commitment to improving
• remain calm and professional

If NEUTRAL:
• thank them
• acknowledge the feedback

General rules:
• keep each reply 2–3 sentences
• sound warm and professional
• do NOT use placeholders like [Customer Name]
• write naturally like a real business owner

Return your answer in this exact format:

OPTION 1:
...

OPTION 2:
...

OPTION 3:
...
`,
        },
        {
          role: "user",
          content: `Customer review: ${review}

Write 3 appropriate reply options from the business owner.`,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    return Response.json({ reply });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to generate reply" },
      { status: 500 }
    );
  }
}