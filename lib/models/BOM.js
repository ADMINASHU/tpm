import mongoose from "mongoose";

const BOMSchema = new mongoose.Schema(
  {
    bomNumber: { type: String, required: true },
    targetProduct: { type: String, required: true }, // Name
    targetConfigId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetConfigModel: { type: String, enum: ["SpareConfig", "ProductConfig"], required: true },
    targetType: {
      type: String,
      enum: ["Spare_Part", "Finished_Product"],
      required: true,
    },
    components: [
      {
        configId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: 'components.configModel'
        },
        configModel: {
          type: String,
          required: true,
          enum: ["ComponentConfig", "SpareConfig"]
        },
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

// Allow multiple versions for the same BOM number
BOMSchema.index(
  { bomNumber: 1, version: 1, factoryId: 1 },
  { unique: true },
);

// Also allow multiple BOMs for the same product with different versions
BOMSchema.index(
  { targetProduct: 1, version: 1, factoryId: 1 },
  { unique: true },
);

export default mongoose.models.BOM || mongoose.model("BOM", BOMSchema);
