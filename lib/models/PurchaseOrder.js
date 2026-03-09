import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    indentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Indent",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Issued", "Fulfilled", "Cancelled"],
      default: "Draft",
    },
    items: [
      {
        configId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "items.configModel",
        },
        configModel: { type: String, enum: ["ComponentConfig", "SpareConfig"] },
        itemName: { type: String, required: true },
        supplierItemName: { type: String }, // Alias for vendor
        make: { type: String },
        quantity: { type: Number, required: true },
        agreedRate: { type: Number, required: true },
        taxPercent: { type: Number, default: 18 },
      },
    ],
    totalAmount: { type: Number, required: true },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", PurchaseOrderSchema);
