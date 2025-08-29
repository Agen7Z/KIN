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
import noticeRoutes from "./routes/notice.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { protect } from "./middlewares/auth.middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config();

// Temporary fix: Set JWT_SECRET if not loaded from .env
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'temporary_secret_key_for_testing';
    // console.log('⚠️  Using temporary JWT_SECRET - fix your .env file!');
}



if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in environment variables');
    console.error('Please create a .env file with MONGO_URI=mongodb://localhost:27017/kin');
    console.error('Or install MongoDB and set the connection string');
    process.exit(1);
}

// console.log('Environment variables loaded successfully');


const app = express();

// CORS configuration - more permissive for development

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
    'https://kin-mu.vercel.app',
    'https://kinn.sangambakhunchhe.com.np',
    process.env.CLIENT_URL 
  ].filter(Boolean);

// Log allowed origins for debugging
console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Cookie','Accept'],
  exposedHeaders: ['Content-Length','X-Requested-With']
}));

// Pre-flight requests
app.options('*', cors());

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
app.use("/api/notices", noticeRoutes);

// Test endpoint
app.get("/api/test", (req, res) => {
    res.json({ message: "Server is working!" });
});

// Test auth endpoint
app.get("/api/test-auth", (req, res) => {
    const authHeader = req.headers.authorization;
    res.json({ 
        message: "Auth test endpoint", 
        hasAuthHeader: !!authHeader,
        authHeader: authHeader,
        timestamp: new Date().toISOString()
    });
});

// Test protected endpoint
app.get("/api/test-protected", protect, (req, res) => {
    res.json({ 
        message: "Protected endpoint working!", 
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "success", 
        message: "Server is running", 
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 4000
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
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Simple products endpoint test
app.get("/api/products-test", async (req, res) => {
    try {
        res.json({ 
            message: "Simple products endpoint working!",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    // Server started successfully
});

// Initialize Socket.IO
import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(server, {
  cors: {
    origin: (
      [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4000',
        'https://kin-mu.vercel.app',
        'https://kinn.sangambakhunchhe.com.np',
        process.env.CLIENT_URL
      ].filter(Boolean)
    ),
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  // Optionally, authenticate user via token sent in query/headers later
  socket.on('disconnect', () => {
    // client disconnected
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    // console.log('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});