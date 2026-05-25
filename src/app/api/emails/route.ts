import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import { getGmailClient } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const gmail = await getGmailClient(session.user.id);

    // 4. Fetch unread emails
    const messagesRes = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX", "UNREAD"],
        maxResults: 20,
    });

    const messages = messagesRes.data.messages || [];
    const emails = [];

    for (const msg of messages) {
        const fullMsg = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
        });

        const headers = fullMsg.data.payload?.headers || [];
        const sender = headers.find(h => h.name === "From")?.value || "Unknown";
        const subject = headers.find(h => h.name === "Subject")?.value || "No subject";
        const snippet = fullMsg.data.snippet || "";
        const body = snippet; // or parse fullMsg.data.payload.parts for full body

        // 5. Store email in DB
        const email = await prisma.email.upsert({
        where: { gmailId: msg.id! },
        update: {},
        create: {
            userId: session.user.id,
            gmailId: msg.id!,
            sender,
            subject,
            body,
            snippet,
            receivedAt: new Date(),
        },
        });

        emails.push(email);
    }

    if (!emails) {
        return NextResponse.json({ error: "Emails not found" }, { status: 404 });
    }
    return NextResponse.json(emails);
}
