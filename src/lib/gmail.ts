import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function getGmailClient(userId: string) {
  // Get the user’s Google account tokens
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account) throw new Error("Google account not linked");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_MAIL_CLIENT_ID,
    process.env.GOOGLE_MAIL_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token!,
    refresh_token: account.refresh_token!,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Attach event listener to refresh tokens automatically
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      account.refresh_token = tokens.refresh_token;
    }
    if (tokens.access_token) {
      account.access_token = tokens.access_token;
    }
    // Save updated tokens to DB
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: account.access_token,
        refresh_token: account.refresh_token,
      },
    });
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}