import mongoose from "mongoose";

const QCRecordSchema = new mongoose.Schema(
  {
    hexCode: { type: String }, // For Serialized items
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }, // For Bulk items
    status: {
      type: String,
      enum: ["Accepted", "RTV_Rejected"],
      required: true,
    },
    quantityTested: { type: Number, required: true },
    quantityAccepted: { type: Number, required: true },
    quantityRejected: { type: Number, required: true, default: 0 },
    auditorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    auditTimestamp: { type: Date, default: Date.now },

    // RTV specific tracking
    isRTV: { type: Boolean, default: false },
    poNumber: { type: String },
    supplierInvoiceNumber: { type: String },
    originalIndentNumber: { type: String },
    replacementRequested: { type: Boolean, default: false },
    replacementSentAt: { type: Date },

    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.QCRecord ||
  mongoose.model("QCRecord", QCRecordSchema);
