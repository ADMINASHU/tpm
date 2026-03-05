import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import QCRecord from "@/lib/models/QCRecord";
import HexRegistry from "@/lib/models/HexRegistry";
import LedgerEntry from "@/lib/models/LedgerEntry";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId, userId } = session.user;
    const body = await req.json();
    const {
      hexCode,
      itemId,
      status,
      quantityTested,
      quantityAccepted,
      quantityRejected,
      isRTV,
      poNumber,
      supplierInvoiceNumber,
      originalIndentNumber,
    } = body;

    await dbConnect();

    // 1. Create QC Record
    const qcRecord = await QCRecord.create({
      hexCode,
      itemId,
      status,
      quantityTested,
      quantityAccepted,
      quantityRejected,
      auditorId: userId,
      isRTV,
      poNumber,
      supplierInvoiceNumber,
      originalIndentNumber,
      factoryId,
    });

    // 2. Update HexRegistry / Stock Status if Accepted
    if (status === "Accepted") {
      if (hexCode) {
        await HexRegistry.findOneAndUpdate(
          { hexCode, factoryId },
          { status: "QC_Passed" }, // Will physically move to 'Available' upon Indexing
        );
      }
      // For Bulk, stock update happens on Indexing

      // Ledger Update: Finalize pending liability
      if (poNumber) {
        await LedgerEntry.create({
          referenceNo: qcRecord._id.toString(),
          type: "Liability_Finalized",
          description: `QC Passed for ${quantityAccepted} units on PO ${poNumber}`,
          amount: 0, // In real app, calculate actual amount = qty * agreedRate
          date: new Date(),
          factoryId,
        });
      }
    }

    // 3. RTV Logic & Ledger
    if (status === "RTV_Rejected" && isRTV) {
      // Update hex tag if applicable
      if (hexCode) {
        await HexRegistry.findOneAndUpdate(
          { hexCode, factoryId },
          { status: "RTV_Rejected" },
        );
      }

      // Ledger Update: Generate Debit Note
      if (poNumber) {
        await LedgerEntry.create({
          referenceNo: qcRecord._id.toString(),
          type: "Debit_Note",
          description: `QC Rejected / RTV for ${quantityRejected} units on PO ${poNumber}`,
          amount: 0, // Debit amount
          date: new Date(),
          factoryId,
        });
      }

      // Trigger RTV Email Logic (Mocked here for now, would use nodemailer / SendGrid)
      console.log(`[EMAIL DISPATCH] To: supplier@example.com`);
      console.log(`Subject: RTV Notification - PO ${poNumber}`);
      console.log(
        `Body: The items listed below did not pass our Quality Control (QC) inspection and require immediate replacement.`,
      );
    }

    return NextResponse.json({ success: true, qcRecord }, { status: 201 });
  } catch (error) {
    console.error("API Error in QC:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
