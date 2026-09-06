import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const notifications = db.getNotifications(userId);
  const unreadCount = db.getUnreadCount(userId);
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (body.markAllRead && body.userId) {
    db.markAllRead(body.userId);
  } else if (body.id) {
    db.markRead(body.id);
  }
  return NextResponse.json({ success: true });
}
