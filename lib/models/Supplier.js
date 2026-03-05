import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactEmail: { type: String, required: true },
    gstNumber: { type: String },
    paymentTermsDays: { type: Number, default: 30 },
    agreedProducts: [
      {
        itemName: { type: String, required: true },
        supplierItemName: { type: String },
        make: { type: String },
        agreedRate: { type: Number, required: true },
        minimumLotSize: { type: Number, default: 1 },
        hsnCode: { type: String },
        leadTime: { type: Number, default: 7 },
        isPreferred: { type: Boolean, default: false },
      },
    ],
    priceHistory: [
      {
        itemName: { type: String, required: true },
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
