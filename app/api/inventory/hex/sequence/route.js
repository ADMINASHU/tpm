import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import HexRegistry from "@/lib/models/HexRegistry";
import { getCurrentISTDate } from "@/lib/dateUtils";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId } = session.user;
    const body = await req.json();
    const { type, factoryCode, count } = body; // type: "Serialized" or "Product"

    await dbConnect();

    const generatedCodes = [];
    const date = getCurrentISTDate();
    const year = date.getUTCFullYear().toString().slice(-2); // e.g., "26"
    let month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // e.g., "03"
    const currentMonthString = `${year}-${month}`;

    if (type === "Product") {
      const sequenceFormat = `${factoryCode}${year}${month}`;

      // Atomic counter update per format and month
      for (let i = 0; i < count; i++) {
        // Find highest sequence for this format and month to auto-reset
        const lastTag = await HexRegistry.findOne({
          factoryId,
          sequenceFormat,
          sequenceMonth: currentMonthString,
        }).sort({ sequenceNumber: -1 });

        let nextSeq = 1;
        if (lastTag && lastTag.sequenceNumber) {
          nextSeq = lastTag.sequenceNumber + 1;
        }

        const sequenceString = nextSeq.toString().padStart(4, "0");
        const fullSerial = `${sequenceFormat}${sequenceString}`;

        // Create placeholder record to lock it
        await HexRegistry.create({
          hexCode: fullSerial, // Reusing hexCode field for Series ID
          status: "Inwarded", // Pending map
          sequenceFormat,
          sequenceNumber: nextSeq,
          sequenceMonth: currentMonthString,
          purchasePrice: 0,
          factoryId,
        });

        generatedCodes.push(fullSerial);
      }
    } else {
      // Hex 4-Digit generation
      for (let i = 0; i < count; i++) {
        // Generate a random 4 digit hex for now (or sequential 0000-FFFF)
        // Assuming sequential: find highest, convert to dec, add 1, convert to hex
        const lastHex = await HexRegistry.findOne({
          factoryId,
          hexCode: { $regex: /^[0-9A-Fa-f]{4}$/ },
        }).sort({ createdAt: -1 });

        let nextDec = 0;
        if (lastHex && lastHex.hexCode) {
          nextDec = parseInt(lastHex.hexCode, 16) + 1;
        }

        if (nextDec > 65535) nextDec = 0; // wrap around FFFF

        const newHex = nextDec.toString(16).toUpperCase().padStart(4, "0");

        await HexRegistry.create({
          hexCode: newHex,
          status: "Inwarded",
          purchasePrice: 0,
          factoryId,
        });

        generatedCodes.push(newHex);
      }
    }

    return NextResponse.json(
      { success: true, codes: generatedCodes },
      { status: 201 },
    );
  } catch (error) {
    console.error("API Error in Hex Sequence:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
