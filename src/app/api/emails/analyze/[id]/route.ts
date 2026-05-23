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
        if (existingAnalysis) return NextResponse.json(existingAnalysis)
         const prompt = `
            Summarize this email in 1-2 sentences.
            Classify it into category (work, personal, promotion, notification).
            Suggest priority (high, medium, low).
            Optionally provide sentiment (positive, neutral, negative) and intent.
            Also generate a professional suggested reply.

            Email Body:
            ${email.body ?? ""}
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-5.4-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });
        
        const text = response.choices[0].message?.content ?? "";
        console.log("text==================?", text);

        // Parse OpenAI output
        const matchSummary = text.match(/Summary:\s*(.*)/i);
        const matchCategory = text.match(/Category:\s*(.*)/i);
        const matchPriority = text.match(/Priority:\s*(.*)/i);
        const matchSentiment = text.match(/Sentiment:\s*(.*)/i);
        const matchIntent = text.match(/Intent:\s*(.*)/i);
        const matchSuggestedReply = text.match(/Suggested Reply:\s*(.*)/i);

        const summary = matchSummary?.[1].trim() ?? "";
        const category = matchCategory?.[1].trim() ?? "";
        const priority = matchPriority?.[1].trim() ?? "";
        const sentiment = matchSentiment?.[1].trim() ?? "";
        const intent = matchIntent?.[1].trim() ?? "";
        const suggestedReply = matchSuggestedReply?.[1].trim() ?? "";

        // Save to database
        const analysis = await prisma.emailAnalysis.create({
            data: {
                emailId: email.id,
                summary,
                category,
                priority,
                sentiment,
                intent,
                suggestedReply,
            },
        });

        return NextResponse.json(analysis);
    } catch (err) {
        console.error("Error analyzing emails:", err);
        return NextResponse.json({ error: "Failed to analyze emails" }, { status: 500 });
    }
}
