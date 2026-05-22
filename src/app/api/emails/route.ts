import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import { fetchGmailEmails } from "@/lib/gmail";

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const emails = await fetchGmailEmails(session.user.id);

    if (!emails) {
        return NextResponse.json({ error: "Emails not found" }, { status: 404 });
    }
    return NextResponse.json(emails);
}
