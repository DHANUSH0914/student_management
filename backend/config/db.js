import mongoose from 'mongoose';
import User from '../models/User.js';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Call seeding after successful connection
        await seedAdmin();

    } catch (error) {
        console.error(`❌ DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'ADMIN' });

        if (!adminExists) {
            console.log('⚠️ No ADMIN found. Creating default admin...');

            const adminUser = new User({
                username: 'admin',
                password: 'admin123',
                role: 'ADMIN'
            });

            await adminUser.save();

            console.log('✅ Default ADMIN created (admin / admin123)');
        } else {
            console.log('ℹ️ ADMIN already exists');
        }

    } catch (error) {
        console.error(`❌ Seed Error: ${error.message}`);
    }
};

export default connectDB;