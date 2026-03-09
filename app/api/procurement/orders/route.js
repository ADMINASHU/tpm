import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import PurchaseOrder from "@/lib/models/PurchaseOrder";
import Supplier from "@/lib/models/Supplier";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId } = session.user;
    await dbConnect();

    const orders = await PurchaseOrder.find({ factoryId })
      .populate(
        "supplierId",
        "name primaryContactName primaryContactEmail primaryContactPhone",
      )
      .populate("factoryId", "name billingAddress gstNumber stores")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
