import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
    if (!process.env.MONGODB_URI) return NextResponse.json({ users: [] });
    const { default: dbConnect } = await import("@/lib/db");
    const { default: User } = await import("@/lib/models/User");
    await dbConnect();
    const users = await User.find().lean();
    return NextResponse.json({ users });
}

export async function POST(req) {
    if (!process.env.MONGODB_URI) return NextResponse.json({ error: "No DB" }, { status: 500 });
    const { default: dbConnect } = await import("@/lib/db");
    const { default: User } = await import("@/lib/models/User");
    const { default: bcrypt } = await import("bcryptjs");
    await dbConnect();
    const body = await req.json();
    const { name, email, password, role, factoryId } = body;
    if (!name || !email || !password || !role || !factoryId)
        return NextResponse.json({ error: "All fields required" }, { status: 400 });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, factoryId });
    return NextResponse.json({ user }, { status: 201 });
}
