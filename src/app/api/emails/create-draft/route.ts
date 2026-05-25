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

  // Fetch email record and account
  const email = await prisma.email.findUnique({ where: { id: emailId } });
  if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
  });
  if (!account) return NextResponse.json({ error: "Google account not linked" }, { status: 400 });

  try {
    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: account.access_token!,
      refresh_token: account.refresh_token!,
    });

    // Force token refresh if expired
    oauth2Client.on("tokens", (tokens) => {
      if (tokens.refresh_token) {
        // Save new refresh token if provided
        prisma.account.update({
          where: { id: account.id },
          data: { refresh_token: tokens.refresh_token },
        }).catch(console.error);
      }
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Build raw email
    const rawMessage = [
      `From: ${session.user.email}`,
      `To: ${email.sender}`,
      `Subject: Re: ${email.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset="UTF-8"`,
      ``,
      draftBody,
    ].join("\r\n");

    // URL-safe base64 encoding
    const base64Encoded = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Create draft
    const draftRes = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw: base64Encoded } },
    });

    return NextResponse.json({ success: true, draftId: draftRes.data.id });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Failed to create Gmail draft:", err?.response?.data || err.message);
    const status = err?.response?.status || 500;
    const errorMsg = err?.response?.data?.error?.message || "Failed to create Gmail draft";
    return NextResponse.json({ error: errorMsg }, { status });
  }
}