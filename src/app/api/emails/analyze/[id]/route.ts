import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";



export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
     // Get all unread emails

    const { id } = await params; // now safe to use

    try {
        const email = await prisma.email.findUnique({
            where: { id, userId: session.user.id },
        });

        if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

        // Check if analysis already exists
        const existingAnalysis = await prisma.emailAnalysis.findFirst({
            where: { emailId: email.id },
        });
        if (existingAnalysis?.summary && existingAnalysis.category && existingAnalysis.priority && existingAnalysis.suggestedReply) return NextResponse.json({...email, ...existingAnalysis})
        
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

        const response = await openai.chat.completions.create({
            model: "gpt-5.4-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });
        
        const rawText = response.choices[0].message?.content ?? "";
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
        }
        const summary = parsed.summary ?? "";
        const category = parsed.category ?? "";
        const priority = parsed.priority ?? null;
        const sentiment = parsed.sentiment ?? null;
        const intent = parsed.intent ?? null;
        const suggestedReply = parsed.suggestedReply ?? null;

        // Save to database
        const analysis = await prisma.emailAnalysis.upsert({
            where: { id: existingAnalysis?.id ?? "" }, // use existing id or generate new
            create: {
                emailId: email.id,
                summary: summary ?? "",
                category: category ?? "",
                priority: priority ?? null,
                sentiment: sentiment ?? null,
                intent: intent ?? null,
                suggestedReply: suggestedReply ?? null,
            },
            update: {
                summary: summary ?? "",
                category: category ?? "",
                priority: priority ?? null,
                sentiment: sentiment ?? null,
                intent: intent ?? null,
                suggestedReply: suggestedReply ?? null,
            },
        });

        return NextResponse.json({...email, ...analysis});
    } catch (err) {
        console.error("Error analyzing emails:", err);
        return NextResponse.json({ error: "Failed to analyze emails" }, { status: 500 });
    }
}
