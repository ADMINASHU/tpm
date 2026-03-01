import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function PUT(req, context) {
    const { id } = await context.params;
    if (!process.env.MONGODB_URI) return NextResponse.json({ error: "No DB" }, { status: 500 });
    const { default: dbConnect } = await import("@/lib/db");
    const { default: User } = await import("@/lib/models/User");
    const { default: bcrypt } = await import("bcryptjs");
    await dbConnect();
    const body = await req.json();
    const update = { name: body.name, email: body.email, role: body.role, factoryId: body.factoryId };
    if (body.password) update.password = await bcrypt.hash(body.password, 10);
    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
}

export async function DELETE(req, context) {
    const { id } = await context.params;
    if (!process.env.MONGODB_URI) return NextResponse.json({ error: "No DB" }, { status: 500 });
    const { default: dbConnect } = await import("@/lib/db");
    const { default: User } = await import("@/lib/models/User");
    await dbConnect();
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}

