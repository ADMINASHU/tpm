import { NextResponse } from "next/server";
import { getCurrentISTDate } from "@/lib/dateUtils";
import dbConnect from "@/lib/db";
import VendorInvoice from "@/lib/models/VendorInvoice";
// Note: This endpoint should be secured by an API key or internal webhook secret in production.

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    // Basic static secret check for cron jobs
    if (
      authHeader !== `Bearer ${process.env.CRON_SECRET || "secret-cron-key"}`
    ) {
      return NextResponse.json(
        { error: "Unauthorized cron access" },
        { status: 401 },
      );
    }

    await dbConnect();

    // 1. Payment Ageing Analysis
    // Find all unpaid invoices
    const unpaidInvoices = await VendorInvoice.find({
      paymentStatus: { $ne: "Paid" },
    }).populate("supplierId", "name contactEmail");

    const now = getCurrentISTDate();
    const buckets = {
      "0-30": [],
      "31-60": [],
      "61-90": [],
      "90+": [],
    };

    for (const invoice of unpaidInvoices) {
      const diffTime = Math.abs(now - new Date(invoice.invoiceDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const agingRecord = {
        invoiceNumber: invoice.invoiceNumber,
        supplier: invoice.supplierId?.name || "Unknown",
        amount: invoice.totalAmount,
        daysOverdue: diffDays,
      };

      if (diffDays <= 30) buckets["0-30"].push(agingRecord);
      else if (diffDays <= 60) buckets["31-60"].push(agingRecord);
      else if (diffDays <= 90) buckets["61-90"].push(agingRecord);
      else buckets["90+"].push(agingRecord);
    }

    // 2. Formatting the summary table for WhatsApp/Email output
    let summaryText = `*Payment Ageing Analysis Report*\n\n`;
    summaryText += `*0-30 Days:* ${buckets["0-30"].length} Invoices\n`;
    summaryText += `*31-60 Days:* ${buckets["31-60"].length} Invoices\n`;
    summaryText += `*61-90 Days:* ${buckets["61-90"].length} Invoices\n`;
    summaryText += `*90+ Days:* ${buckets["90+"].length} Invoices\n\n`;

    // Example mock API to Notification Gateway
    console.log(
      `[CRON NOTIFICATION] WhatsApp / Email sent to Finance Team:\n`,
      summaryText,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Payment Ageing Cron executed successfully",
        report: summaryText,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("CRON Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
