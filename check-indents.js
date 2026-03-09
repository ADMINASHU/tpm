const mongoose = require("mongoose");

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/tpm");

  const Indent =
    mongoose.models.Indent ||
    mongoose.model("Indent", new mongoose.Schema({}, { strict: false }));

  const pending = await Indent.find({ status: "Approval Pending" }).lean();
  console.log("Pending Indents:", JSON.stringify(pending, null, 2));

  mongoose.connection.close();
}

check().catch(console.error);
