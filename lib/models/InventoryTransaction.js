import mongoose from "mongoose";

const InventoryTransactionSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },
        factory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Factory",
            // Optional to match Item model and support global/unassigned items
        },
        type: {
            type: String,
            enum: [
                "OPENING_STOCK",
                "GRN",
                "STOCK_TRANSFER_IN",
                "STOCK_TRANSFER_OUT",
                "PRODUCTION_CONSUMPTION",
                "PRODUCTION_OUTPUT",
                "ADJUSTMENT",
                "RETURN_TO_VENDOR"
            ],
            required: true,
        },
        quantity: {
            type: Number,
            required: true, // The change in quantity (positive for additions, negative for deductions)
        },
        balanceAfter: {
            type: Number,
            required: true, // Snapshot of currentQuantity after this transaction
        },
        reference: {
            type: String, // e.g. "INV-123", "PO-456", "BUILD-789"
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        notes: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Indexes for fast lookups
InventoryTransactionSchema.index({ item: 1, createdAt: -1 });
InventoryTransactionSchema.index({ factory: 1, createdAt: -1 });

export default mongoose.models.InventoryTransaction ||
    mongoose.model("InventoryTransaction", InventoryTransactionSchema);
