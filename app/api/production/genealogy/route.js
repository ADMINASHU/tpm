import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import HexRegistry from "@/lib/models/HexRegistry";
import FinishedProduct from "@/lib/models/FinishedProduct";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId } = session.user;
    const body = await req.json();
    const { parentSerial, childHexes } = body;

    await dbConnect();

    // 1. Locate the Parent Product
    const parent = await FinishedProduct.findOne({
      serialNumber: parentSerial,
      factoryId,
    });
    if (!parent)
      return NextResponse.json(
        { error: "Parent Product not found" },
        { status: 404 },
      );

    // 2. Map Genealogy - Update Child Hex Tags to point to Parent
    for (const childHex of childHexes) {
      const hexRecord = await HexRegistry.findOne({
        hexCode: childHex,
        factoryId,
      });

      if (!hexRecord) {
        return NextResponse.json(
          { error: `Child tag ${childHex} not found in stock` },
          { status: 400 },
        );
      }

      if (hexRecord.status !== "Available") {
        return NextResponse.json(
          {
            error: `Child tag ${childHex} is not Available (Current status: ${hexRecord.status})`,
          },
          { status: 400 },
        );
      }

      hexRecord.parentSerialNumber = parent._id;
      hexRecord.status = "Consumed";
      await hexRecord.save();

      parent.components.push(childHex);
    }

    await parent.save();

    return NextResponse.json({ success: true, parent }, { status: 200 });
  } catch (error) {
    console.error("API Error in Genealogy:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
