import mongoose from "mongoose";

const BOMSchema = new mongoose.Schema(
  {
    bomNumber: { type: String, required: true, unique: true },
    targetProduct: { type: String, required: true }, // The Final Product or Spare Part PCB name
    targetType: {
      type: String,
      enum: ["Spare_Part", "Finished_Product"],
      required: true,
    },
    components: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        itemName: { type: String, required: true },
        requiredQuantity: { type: Number, required: true },
        trackingStrategy: {
          type: String,
          enum: ["Hex", "Bulk"],
          required: true,
        },
        legend: { type: String }, // e.g., C2, C4, R1, U2, T4
        make: { type: String }, // e.g., BC COMPONENTS
        category: { type: String }, // e.g., RESISTORS, CAPACITORS
      },
    ],
    version: { type: String, default: "1.0" },
    isActive: { type: Boolean, default: true },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true },
);

BOMSchema.index(
  { targetProduct: 1, version: 1, factoryId: 1 },
  { unique: true },
);

export default mongoose.models.BOM || mongoose.model("BOM", BOMSchema);
