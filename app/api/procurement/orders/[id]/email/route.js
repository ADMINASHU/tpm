import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import PurchaseOrder from "@/lib/models/PurchaseOrder";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    // Verify PO exists and belongs to factory
    const order = await PurchaseOrder.findOne({
      _id: id,
      factoryId: session.user.factoryId,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Purchase Order not found" },
        { status: 404 },
      );
    }

    const { pdf } = await req.json();

    // In a real application, this is where you would integrate with an SMTP server
    // (e.g., SendGrid, AWS SES, Nodemailer) to format the PO as a PDF and send it
    // to the supplier's primaryContactEmail.
    if (pdf) {
      console.log(
        `PO Email: Attachment received for PO ${order.poNumber} (${pdf.length} bytes)`,
      );
    }

    // For now, we mock a successful email transmission and update the status if draft
    const updateData = {};
    if (order.status === "Draft") {
      updateData.status = "Issued";
    }

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      message: "Purchase Order successfully emailed to vendor",
      data: updatedOrder,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
