import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

interface DraftRequest {
  emailId: string;
  draftBody: string;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: DraftRequest = await req.json();
  const { emailId, draftBody } = body;

  // Fetch the email record and account
  const email = await prisma.email.findUnique({ where: { id: emailId } });
  if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
  });
  if (!account || !account.access_token) return NextResponse.json({ error: "Google account not linked" }, { status: 400 });

  try {
    // Initialize Gmail API client
        const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
    access_token: account.access_token!,
    refresh_token: account.refresh_token!,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const rawMessage = [
    `From: ${session.user.email}`,
    `To: ${email.sender}`,
    `Subject: Re: ${email.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    draftBody,
    ].join("\r\n");

    const base64Encoded = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

    const draftRes = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw: base64Encoded } },
    });

    console.log("Draft ID:", draftRes.data.id);

    return NextResponse.json({ success: true, draftId: draftRes.data.id });
  } catch (err) {
    console.error("Failed to create draft:", err);
    return NextResponse.json({ error: "Failed to create Gmail draft" }, { status: 500 });
  }
}