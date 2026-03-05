import mongoose from "mongoose";

const SystemConfigSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true }, // e.g. "COMPONENT_CONFIG"
    categories: { type: [String], default: [] },
    baseUoms: { type: [String], default: [] },
    makes: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.SystemConfig ||
  mongoose.model("SystemConfig", SystemConfigSchema);
