import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { retry } from "@/lib/utils";

async function analyzeEmail(prompt: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const text = await retry(async () => {
    const res = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    return res.choices[0].message?.content ?? "";
  }, 3, 1500);
  return text;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Fetch email
    const email = await prisma.email.findUnique({
      where: { id, userId: session.user.id },
    });
    if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

    // Check existing analysis
    const existingAnalysis = await prisma.emailAnalysis.findUnique({
      where: { emailId: email.id },
    });
    if (
      existingAnalysis?.summary &&
      existingAnalysis.category &&
      existingAnalysis.priority &&
      existingAnalysis.suggestedReply
    ) {
      return NextResponse.json({ ...email, ...existingAnalysis });
    }

    // Prepare AI prompt
    const prompt = `
      Summarize this email in 1-2 sentences.
      Classify it into category (work, personal, promotion, notification).
      Suggest priority (high, medium, low).
      Optionally provide sentiment (positive, neutral, negative) and intent.
      Also generate a professional suggested reply.

      Please respond ONLY in JSON format:

      {
        "summary": "...",
        "category": "...",
        "priority": "...",
        "sentiment": "...",
        "intent": "...",
        "suggestedReply": "..."
      }

      Email Body:
      ${email.body ?? ""}
    `;


    const rawText = await analyzeEmail(prompt)
    let parsed: {
      summary?: string;
      category?: string;
      priority?: string;
      sentiment?: string;
      intent?: string;
      suggestedReply?: string;
    } = {};

    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse AI JSON:", err, rawText);
      // fallback empty values
      parsed = {};
    }

    // Safe optional fields
    const summary = parsed.summary ?? "";
    const category = parsed.category ?? "";
    const priority = parsed.priority ?? null;
    const sentiment = parsed.sentiment ?? null;
    const intent = parsed.intent ?? null;
    const suggestedReply = parsed.suggestedReply ?? null;

    // Upsert AI analysis (create if not exists, update if exists)
    const analysis = await prisma.emailAnalysis.upsert({
      where: { emailId: email.id },
      create: {
        emailId: email.id,
        summary,
        category,
        priority,
        sentiment,
        intent,
        suggestedReply,
      },
      update: {
        summary,
        category,
        priority,
        sentiment,
        intent,
        suggestedReply,
      },
    });

    return NextResponse.json({ ...email, ...analysis });
  } catch (err) {
    console.error("Error analyzing email:", err);
    return NextResponse.json({ error: "Failed to analyze email" }, { status: 500 });
  }
}