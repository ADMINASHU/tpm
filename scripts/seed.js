/**
 * Seed Script — Run with: node scripts/seed.js
 * Creates: 2 Factories + 1 Admin User per factory
 */

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://aasoftlabs_db_user:1tylaqtNvapgdyqq@cluster0.dfgibhf.mongodb.net/tpm?retryWrites=true&w=majority";

// ---- Inline Schemas (no module imports needed for seed) ----
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  factoryId: mongoose.Schema.Types.ObjectId,
  storeId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const FactorySchema = new mongoose.Schema({
  name: String,
  code: String,  // "BLR" or "PWN"
  location: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Factory = mongoose.models.Factory || mongoose.model("Factory", FactorySchema);

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!\n");

    // Clean up
    await User.deleteMany({});
    await Factory.deleteMany({});
    console.log("🗑️  Cleared old seed data.");

    // Create Factories
    const blr = await Factory.create({ name: "Bengaluru Plant", code: "BLR", location: "Bengaluru, Karnataka" });
    const pwn = await Factory.create({ name: "Parwanoo Plant", code: "PWN", location: "Parwanoo, Himachal Pradesh" });
    console.log("🏭 Created Factories:", blr.name, "&", pwn.name);

    // Hash passwords using native crypto (no bcrypt needed for seed)
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("Admin@1234", 12);

    // Create Admin Users
    const adminBLR = await User.create({
      name: "Admin Bengaluru",
      email: "admin@blr.techser.com",
      password: hashedPassword,
      role: "Admin",
      factoryId: blr._id,
    });

    const adminPWN = await User.create({
      name: "Admin Parwanoo",
      email: "admin@pwn.techser.com",
      password: hashedPassword,
      role: "Admin",
      factoryId: pwn._id,
    });

    console.log("\n✅ Seed complete! Login credentials:\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏭 Factory: Bengaluru");
    console.log("   Email   : admin@blr.techser.com");
    console.log("   Password: Admin@1234");
    console.log("   Role    : Admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏭 Factory: Parwanoo");
    console.log("   Email   : admin@pwn.techser.com");
    console.log("   Password: Admin@1234");
    console.log("   Role    : Admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

seed();
