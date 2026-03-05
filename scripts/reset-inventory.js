const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
function getMongoUri() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/MONGODB_URI=(.*)/);
        if (match && match[1]) {
            return match[1].trim().replace(/['"]/g, '');
        }
    }
    return process.env.MONGODB_URI;
}

async function reset() {
    const uri = getMongoUri();
    if (!uri) {
        console.error("No MONGODB_URI found");
        process.exit(1);
    }

    console.log("Connecting to DB...");
    try {
        await mongoose.connect(uri);
        console.log("Connected.");

        // Clear entries
        const txCount = await mongoose.connection.db.collection('inventorytransactions').deleteMany({});
        console.log(`Deleted ${txCount.deletedCount} transactions.`);

        const itemCount = await mongoose.connection.db.collection('items').updateMany({}, {
            $set: { currentQuantity: 0, openingStock: 0 },
            $unset: { openingStockDate: "" }
        });
        console.log(`Reset ${itemCount.modifiedCount} items.`);

        console.log("DONE");
    } catch (err) {
        console.error("FAILED:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

reset();
