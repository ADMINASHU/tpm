import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true },
    itemName: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
    },
    trackingType: {
      type: String,
      enum: ["Bulk", "Serialized"],
      required: true,
    },
    hsnCode: { type: String },
    make: { type: String },
    value: { type: String }, // e.g., 10K, 1/4W
    ratings: { type: String }, // e.g., KVA
    volt: { type: String },
    amp: { type: String },
    mountingTechnology: { type: String }, // e.g. SMD, THT, BGA
    baseUom: { type: String },
    technicalSpecs: { type: mongoose.Schema.Types.Mixed, default: {} },
    minStockLevel: { type: Number, default: 0 },
    maxStockLevel: { type: Number, default: 0 },
    currentQuantity: { type: Number, default: 0 },
    averageUnitCost: { type: Number, default: 0 },
    openingStock: { type: Number, default: 0 },
    openingStockDate: { type: Date },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
    },
  },
  { timestamps: true },
);

ItemSchema.index({ itemCode: 1 }, { unique: true });

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
