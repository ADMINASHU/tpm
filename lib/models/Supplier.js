import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    supplierCode: { type: String, required: true, unique: true },
    contactEmail: { type: String, required: true },
    gstNumber: { type: String },
    address: { type: String },
    contactPerson: { type: String },
    phone: { type: String },
    jurisdiction: { type: String },
    priceBasis: { type: String },
    packingInstructions: { type: String },
    inspectionTerms: { type: String },
    paymentTerms: { type: String },
    paymentTermsDays: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ["Approved", "Blocked"],
      default: "Approved"
    },
    agreedProducts: [
      {
        configId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "agreedProducts.configModel",
          required: true,
        },
        configModel: {
          type: String,
          enum: ["ComponentConfig", "SpareConfig"],
          required: true,
          default: "ComponentConfig"
        },
        supplierItemName: { type: String }, // Alias name vendor uses
        make: { type: String },
        hsnCode: { type: String },
        currency: { type: String, default: "INR" },
        agreedRate: { type: Number, required: true },
        minimumLotSize: { type: Number, default: 1 },
        isPreferred: { type: Boolean, default: false }, // Primary vendor for Auto-Indent
      },
    ],
    priceHistory: [
      {
        configId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "priceHistory.configModel",
          required: true,
        },
        configModel: {
          type: String,
          enum: ["ComponentConfig", "SpareConfig"],
          required: true,
          default: "ComponentConfig"
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
