import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactEmail: { type: String, required: true },
    gstNumber: { type: String },
    paymentTermsDays: { type: Number, default: 30 },
    agreedProducts: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        supplierItemName: { type: String }, // Alias name vendor uses
        make: { type: String },
        hsnCode: { type: String },
        currency: { type: String, default: "INR" },
        agreedRate: { type: Number, required: true },
        minimumLotSize: { type: Number, default: 1 },
        leadTime: { type: Number, default: 7 }, // Days required for delivery
        isPreferred: { type: Boolean, default: false }, // Primary vendor for Auto-Indent
      },
    ],
    priceHistory: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        oldRate: { type: Number },
        newRate: { type: Number },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    performance: {
      qualityScore: { type: Number, default: 100 },
      deliveryScore: { type: Number, default: 100 },
      priceStability: { type: Number, default: 100 },
      calculatedStars: { type: Number, default: 5 },
    },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Supplier ||
  mongoose.model("Supplier", SupplierSchema);
