import mongoose from "mongoose";

const InventoryTransactionSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: false, // Optional if it's a product
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FinishedProduct",
            required: false, // Optional if it's an item
        },
        entityTag: {
            type: String, // Serial Number or Hex Tag
        },
        configId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // For master configuration reference
        },
        configModel: {
            type: String, // 'ComponentConfig', 'SpareConfig', or 'ProductConfig'
            required: false,
        },
        factory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Factory",
            required: true,
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
        unitPrice: {
            type: Number,
            default: 0, // Cost per unit during opening load or PO
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
