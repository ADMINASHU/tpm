import mongoose from "mongoose";

const VendorInvoiceSchema = new mongoose.Schema(
    {
        vendorName: { type: String, required: true },
        invoiceNo: { type: String, required: true },
        date: { type: Date, required: true },
        dueDate: { type: Date, required: true },
        totalAmount: { type: Number, required: true },
        balanceAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Pending", "Partial", "Paid"],
            default: "Pending",
        },
        factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    },
    { timestamps: true }
);

export default mongoose.models.VendorInvoice || mongoose.model("VendorInvoice", VendorInvoiceSchema);
