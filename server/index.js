import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";
import seedAdmin from "./utils/seedAdmin.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config();

// Temporary fix: Set JWT_SECRET if not loaded from .env
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'temporary_secret_key_for_testing';
    console.log('⚠️  Using temporary JWT_SECRET - fix your .env file!');
}

// Debug: Log all environment variables
console.log('=== Environment Variables Debug ===');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET (will use default 3000)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('==================================');

// Check required environment variables

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in environment variables');
    process.exit(1);
}

console.log('Environment variables loaded successfully');


const app = express();

// CORS configuration - more permissive for development
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

connectDB().then(seedAdmin);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Test endpoint
app.get("/api/test", (req, res) => {
    res.json({ message: "Server is working!" });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "success", 
        message: "Server is running", 
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 3000
    });
});

// Test products endpoint
app.get("/api/test-products", async (req, res) => {
    try {
        const Product = (await import("./models/product.model.js")).default;
        const products = await Product.find({});
        res.json({ 
            message: "Products test", 
            count: products.length, 
            products: products.map(p => ({ id: p._id, name: p.name, gender: p.gender, isActive: p.isActive }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});