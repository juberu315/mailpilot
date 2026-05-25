import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);

    const emails = await prisma.email.findMany({
      where: { userId: session.user.id },
      orderBy: { receivedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        sender: true,
        subject: true,
        snippet: true,
        read: true,
        receivedAt: true,
      },
    });

    // Optional: total count for frontend pagination
    const totalCount = await prisma.email.count({ where: { userId: session.user.id } });

    return NextResponse.json({
      emails,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (err) {
    console.error("Failed to fetch emails with pagination", err);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}