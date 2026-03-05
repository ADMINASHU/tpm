import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env.local to avoid dotenv dependency
function getMongoUri() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.startsWith('MONGODB_URI=')) {
                    return line.split('=')[1].trim().replace(/['"]/g, '');
                }
            }
        }
    } catch (e) {
        console.error('Error reading .env.local:', e.message);
    }
    return process.env.MONGODB_URI;
}

async function resetInventory() {
    const MONGODB_URI = getMongoUri();

    if (!MONGODB_URI) {
        console.error('ERROR: MONGODB_URI not found in .env.local or process.env');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB.');

        // 1. Clear Inventory Transactions
        // Note: Collection name might be pluralized by mongoose
        const collections = await mongoose.connection.db.listCollections().toArray();
        const txCollectionName = collections.find(c => c.name.includes('inventorytransaction'))?.name || 'inventorytransactions';

        console.log(`Clearing collection: ${txCollectionName}...`);
        const txResult = await mongoose.connection.db.collection(txCollectionName).deleteMany({});
        console.log(`Cleared ${txResult.deletedCount} inventory transactions.`);

        // 2. Reset Item Stock levels
        const itemCollectionName = collections.find(c => c.name === 'items')?.name || 'items';
        console.log(`Resetting collection: ${itemCollectionName}...`);
        const itemResult = await mongoose.connection.db.collection(itemCollectionName).updateMany(
            {},
            {
                $set: {
                    currentQuantity: 0,
                    openingStock: 0
                },
                $unset: {
                    openingStockDate: ""
                }
            }
        );
        console.log(`Reset stock for ${itemResult.modifiedCount} items.`);

        console.log('\nSUCCESS: Inventory has been reset to zero.');
        process.exit(0);
    } catch (error) {
        console.error('ERROR during reset:', error);
        process.exit(1);
    }
}

resetInventory();
