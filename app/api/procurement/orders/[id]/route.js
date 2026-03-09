import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import PurchaseOrder from "@/lib/models/PurchaseOrder";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const order = await PurchaseOrder.findOneAndUpdate(
      { _id: id, factoryId: session.user.factoryId },
      { $set: body },
      { new: true },
    )
      .populate(
        "supplierId",
        "name primaryContactName primaryContactEmail primaryContactPhone",
      )
      .populate("factoryId", "name billingAddress gstNumber stores");

    if (!order) {
      return NextResponse.json(
        { error: "Purchase Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const order = await PurchaseOrder.findOneAndDelete({
      _id: id,
      factoryId: session.user.factoryId,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Purchase Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Purchase Order deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
