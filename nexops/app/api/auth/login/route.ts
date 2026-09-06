import { NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "@/lib/auth/helpers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const user = validateCredentials(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set("nexops_session", JSON.stringify({
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      tenantId: user.tenantId,
      clientId: user.clientId,
    }), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
