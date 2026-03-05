import mongoose from "mongoose";

const HexRegistrySchema = new mongoose.Schema(
  {
    hexCode: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    specs: { type: Map, of: String },
    purchasePrice: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Inwarded",
        "QC_Passed",
        "RTV_Rejected",
        "Consumed",
        "In_Transit",
        "Available",
      ],
      default: "Inwarded",
    },
    revision: { type: String },
    addOnPartNumber: { type: String },
    dcBus: { type: String },
    phase: { type: String },
    modelSeries: { type: String },
    make: { type: String },
    parentSerialNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinishedProduct",
    },
    sequenceFormat: { type: String }, // Format string like [Factory Code][Year][Month]
    sequenceNumber: { type: Number }, // The actual sequence number
    sequenceMonth: { type: String }, // "YYYY-MM" to track resets
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  },
  { timestamps: true },
);

HexRegistrySchema.index({ hexCode: 1, factoryId: 1 }, { unique: true });

export default mongoose.models.HexRegistry ||
  mongoose.model("HexRegistry", HexRegistrySchema);
