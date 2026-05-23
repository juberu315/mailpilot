import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch emails from the database for this user
    const emails = await prisma.email.findMany({
      where: { userId: session.user.id },
      orderBy: { receivedAt: "desc" }, // newest first
      take: 50, // optional: limit to latest 50 emails
    });

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: "No emails found" }, { status: 404 });
    }

    return NextResponse.json(emails);
  } catch (err) {
    console.error("Failed to fetch emails from DB", err);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}