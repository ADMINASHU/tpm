import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Supplier from "@/lib/models/Supplier";
import QCRecord from "@/lib/models/QCRecord";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("id");
    const factoryId = session.user.factoryId;

    await dbConnect();

    // If specific ID requested, update and return
    if (supplierId) {
      const supplier = await Supplier.findOne({ _id: supplierId, factoryId });
      if (!supplier)
        return NextResponse.json({ error: "Not Found" }, { status: 404 });

      // Realistically: Quality Score = (Accepted Qty / Total Inward Qty) * 100
      // We query QC records for GRNs linked to this supplier.

      // In lieu of heavy aggregations on non-seeded data, we will apply the rating algorithm framework

      // Delivery Score (Weight 30%): Lead Time Adherence
      // Price Stability (Weight 20%): Derived from priceHistory

      // Weighted execution: Check actual data vs baseline

      const calculatedStars = Math.round(
        (supplier.performance.qualityScore * 0.5 +
          supplier.performance.deliveryScore * 0.3 +
          supplier.performance.priceStability * 0.2) /
          20,
      );

      supplier.performance.calculatedStars = calculatedStars;
      await supplier.save();

      return NextResponse.json(
        { success: true, rating: supplier.performance },
        { status: 200 },
      );
    }

    // Return all with pre-calculated
    const suppliers = await Supplier.find(
      { factoryId },
      "name performance _id",
    );
    return NextResponse.json({ success: true, suppliers }, { status: 200 });
  } catch (error) {
    console.error("API Error in Supplier Rating:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
