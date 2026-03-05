import mongoose from "mongoose";

const DispatchSchema = new mongoose.Schema(
  {
    dispatchNumber: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    destination: { type: String, required: true },
    vehicleDetails: { type: String },
    driverName: { type: String },
    authorizingAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippedItems: [
      {
        serialNumber: { type: String }, // For Finished Products
        itemCode: { type: String }, // For spare parts
        quantity: { type: Number, default: 1 },
      },
    ],
    logisticsCost: {
      fuel: { type: Number, default: 0 },
      toll: { type: Number, default: 0 },
      driverAllowance: { type: Number, default: 0 },
      totalTripCost: { type: Number, default: 0 },
    },
    logisticsSurchargePerUnit: { type: Number, default: 0 },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Dispatch ||
  mongoose.model("Dispatch", DispatchSchema);
