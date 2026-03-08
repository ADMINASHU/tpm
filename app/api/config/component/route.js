import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SystemConfig from "@/lib/models/SystemConfig";

export async function GET() {
  try {
    await dbConnect();

    let config = await SystemConfig.findOne({ type: "COMPONENT_CONFIG" });

    // Auto-create initial default if not found
    if (!config) {
      config = await SystemConfig.create({
        type: "COMPONENT_CONFIG",
        categories: ["IC", "PCB", "Passive", "Enclosure", "Hardware"],
        baseUoms: ["Nos", "Kg", "Meters", "Sets"],
        makes: ["Yageo", "Murata", "TDK", "Vishay", "TE Connectivity"],
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("GET /api/config/component error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const { categories, baseUoms, makes } = body;

    let config = await SystemConfig.findOneAndUpdate(
      { type: "COMPONENT_CONFIG" },
      { $set: { categories, baseUoms, makes } },
      { upsert: true, returnDocument: "after" },
    );

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("PUT /api/config/component error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
