import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const email = await prisma.email.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!email) {
        return NextResponse.json({ error: "Emails not found" }, { status: 404 });
    }
    return NextResponse.json(email);
}
