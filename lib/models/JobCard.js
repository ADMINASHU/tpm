import mongoose from "mongoose";

const JobCardSchema = new mongoose.Schema(
  {
    jobCardNumber: { type: String, required: true, unique: true },
    bomId: { type: mongoose.Schema.Types.ObjectId, ref: "BOM" },
    productSerialNumber: { type: String }, // For Genealogy Linkage
    status: {
      type: String,
      enum: ["Pending", "In_Progress", "Paused", "Completed"],
      default: "Pending",
    },
    tasks: [
      {
        taskName: { type: String, required: true }, // e.g., Mounting, Wiring, Testing
        status: {
          type: String,
          enum: ["Pending", "In_Progress", "Completed"],
          default: "Pending",
        },
        sessions: [
          {
            operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            operatorRate: { type: Number, default: 0 }, // Frozen rate at time of session
            startTime: { type: Date },
            endTime: { type: Date },
            durationMinutes: { type: Number, default: 0 },
            parallelFactor: { type: Number, default: 1 }, // 1 / N concurrent jobs
            allocatedCost: { type: Number, default: 0 },
          },
        ],
      },
    ],
    totalLabourCost: { type: Number, default: 0 },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.JobCard ||
  mongoose.model("JobCard", JobCardSchema);
