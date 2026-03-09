import mongoose from "mongoose";

const IndentSchema = new mongoose.Schema(
  {
    indentNumber: { type: String, required: true, unique: true },
    indentType: { type: String, enum: ["Manual", "Auto"], default: "Manual" },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: String,
      enum: ["Production", "Store", "Projects"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Approval Pending", "Approved", "Rejected", "PO Generated"],
      default: "Approval Pending",
    },
    items: [
      {
        configId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "items.configModel",
        },
        configModel: { type: String, enum: ["ComponentConfig", "SpareConfig"] },
        itemName: { type: String, required: true },
        description: { type: String },
        make: { type: String },
        quantity: { type: Number, required: true },
        suggestedSupplier: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplier",
        },
        suggestedRate: { type: Number },
        leadTime: { type: Number },
        reason: { type: String },
      },
    ],
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Indent || mongoose.model("Indent", IndentSchema);
