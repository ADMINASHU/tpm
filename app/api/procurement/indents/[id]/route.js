import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Indent from "@/lib/models/Indent";
import Supplier from "@/lib/models/Supplier";
import User from "@/lib/models/User";
import Factory from "@/lib/models/Factory";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    await dbConnect();

    const indent = await Indent.findOneAndDelete({
      _id: id,
      factoryId: session.user.factoryId,
      status: "Approval Pending", // Only allow deleting pending indents
    });

    if (!indent) {
      return NextResponse.json(
        { error: "Indent not found or not in pending status" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Indent deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();
    await dbConnect();

    const indent = await Indent.findOneAndUpdate(
      {
        _id: id,
        factoryId: session.user.factoryId,
        status: "Approval Pending",
      },
      { $set: body },
      { new: true },
    );

    if (!indent) {
      return NextResponse.json(
        { error: "Indent not found or not in pending status" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: indent });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
