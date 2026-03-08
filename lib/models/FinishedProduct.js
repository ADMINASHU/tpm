import mongoose from "mongoose";

const FinishedProductSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    productRatings: { type: String }, // e.g. Full system capacity
    dcBus: { type: String }, // e.g. Internal DC bus voltage details
    phase: { type: String }, // e.g. Input/Output phase configuration
    modelAndSeries: { type: String }, // e.g. Catalogue classification
    specsDetails: { type: String }, // e.g. Engineering specifications
    category: {
      type: String,
      enum: ["Product_Config", "Finished_Product"],
      default: "Finished_Product",
    },
    status: {
      type: String,
      enum: ["Buffer", "Available", "Consumed", "Scrapped"],
      default: "Available",
    },
    components: [{ type: String }],
    laborCost: { type: Number, required: true },
    overheadCost: { type: Number, required: true },
    logisticsSurcharge: { type: Number, default: 0 },
    marginPercent: { type: Number, default: 0 },
    transferPrice: { type: Number, required: true },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
    configId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductConfig"
    },
  },
  { timestamps: true },
);

export default mongoose.models.FinishedProduct ||
  mongoose.model("FinishedProduct", FinishedProductSchema);
