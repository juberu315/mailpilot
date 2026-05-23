import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function fetchGmailEmails(userId: string) {
  // 1. Get user's Google account tokens
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account) throw new Error("Google account not linked");

  // 2. Initialize OAuth2 client
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: account.access_token!,
    refresh_token: account.refresh_token!,
  });


  // 3. Refresh access token if expired
  try {
    const tokenResponse = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials({ access_token: tokenResponse.token });
  } catch (err) {
    console.error("Failed to refresh access token", err);
    throw new Error("Failed to refresh access token");
  }

  // 3. Connect to Gmail API
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

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
        userId,
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

  return emails;
}