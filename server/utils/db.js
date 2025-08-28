import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Test the connection
const db = mongoose.connection;
db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.on('disconnected', () => {
    // console.log('MongoDB disconnected');
});

db.on('error', (error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
});

export default connectDB;