import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB successfully");
        
        // Test the connection
        const db = mongoose.connection;
        db.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });
        
        db.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;