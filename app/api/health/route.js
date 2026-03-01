import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // mongoose.connection.readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        const state = mongoose.connection.readyState;

        if (state === 1) {
            return NextResponse.json({ status: "connected", node: "Primary" }, { status: 200 });
        }

        // Try to connect if not connected
        if (!process.env.MONGODB_URI) {
            return NextResponse.json({ status: "no_uri", node: "—" }, { status: 200 });
        }

        await mongoose.connect(process.env.MONGODB_URI);
        await mongoose.connection.db.admin().ping();
        return NextResponse.json({ status: "connected", node: "Primary" }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ status: "error", node: "—", error: err.message }, { status: 200 });
    }
}
