import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SystemConfig from "@/lib/models/SystemConfig";
import SpareConfig from "@/lib/models/SpareConfig";
import ProductConfig from "@/lib/models/ProductConfig";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { factoryId } = session.user;
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    await dbConnect();

    let options = [];

    if (category === "Component") {
      const config = await SystemConfig.findOne({
        type: "COMPONENT_CONFIG",
      }).lean();
      if (config && config.categories) {
        options = config.categories.map((cat) => ({
          label: cat,
          value: cat,
        }));
      }
    } else if (category === "Spare_Part") {
      const spares = await SpareConfig.find({ factoryId })
        .select("itemName _id")
        .lean();
      options = spares.map((s) => ({
        label: s.itemName,
        value: s._id.toString(),
      }));
    } else if (category === "Product") {
      const products = await ProductConfig.find({ factoryId })
        .select("productName _id")
        .lean();
      options = products.map((p) => ({
        label: p.productName,
        value: p._id.toString(),
      }));
    }

    return NextResponse.json({ success: true, options });
  } catch (error) {
    console.error("Trend Options Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
