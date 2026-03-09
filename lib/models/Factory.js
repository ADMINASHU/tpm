import mongoose from "mongoose";

const FactorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      maxlength: 5,
    },
    gstNumber: { type: String },
    billingAddress: { type: String },
    location: { type: String, required: true },
    stores: [
      {
        name: { type: String, required: true },
        address: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.Factory ||
  mongoose.model("Factory", FactorySchema);
