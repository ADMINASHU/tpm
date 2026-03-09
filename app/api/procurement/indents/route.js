import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Indent from "@/lib/models/Indent";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId } = session.user;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    await dbConnect();

    const query = { factoryId };
    if (status) query.status = status;

    const indents = await Indent.find(query)
      .populate("requestedBy", "name")
      .populate("items.suggestedSupplier", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: indents });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId } = session.user;
    const userId = session.user.id;
    const body = await req.json();

    await dbConnect();

    const indentCount = await Indent.countDocuments({ factoryId });
    const indentNumber = `IND-${(indentCount + 1).toString().padStart(4, "0")}`;

    const indent = await Indent.create({
      ...body,
      indentNumber,
      requestedBy: userId,
      factoryId,
      status: "Approval Pending",
    });

    return NextResponse.json({ success: true, data: indent });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
