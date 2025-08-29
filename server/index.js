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
import jwt from 'jsonwebtoken';
import Message from './models/message.model.js';
import User from './models/user.model.js';
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

// In-memory chat store and presence (resets on server restart)
const userIdToSocketIds = new Map(); // userId -> Set(socketId)
const adminSocketIds = new Set();
const conversations = new Map(); // userId -> [{ from: 'user'|'admin', text, ts }]

const addUserSocket = (userId, socketId) => {
  if (!userIdToSocketIds.has(userId)) userIdToSocketIds.set(userId, new Set());
  userIdToSocketIds.get(userId).add(socketId);
};
const removeUserSocket = (userId, socketId) => {
  const set = userIdToSocketIds.get(userId);
  if (set) {
    set.delete(socketId);
    if (set.size === 0) userIdToSocketIds.delete(userId);
  }
};
const pushMessage = (userId, message) => {
  if (!conversations.has(userId)) conversations.set(userId, []);
  conversations.get(userId).push(message);
};

io.on('connection', (socket) => {
  // Lightweight auth using JWT provided via handshake auth
  let authedUser = null;
  try {
    const token = socket.handshake?.auth?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      authedUser = { id: decoded.id, role: decoded.role };
      console.log('Socket auth decoded:', { id: decoded.id, role: decoded.role, hasRole: !!decoded.role });
    }
  } catch (error) {
    console.error('Socket auth error:', error.message);
  }

  if (authedUser?.id) {
    socket.data.userId = authedUser.id;
    socket.data.role = authedUser.role || 'user';
    socket.join(`user:${authedUser.id}`);
    addUserSocket(authedUser.id, socket.id);
    if (socket.data.role === 'admin') {
      adminSocketIds.add(socket.id);
      console.log('Admin connected:', { userId: authedUser.id, socketId: socket.id, adminSocketIds: Array.from(adminSocketIds) });
    } else {
      console.log('User connected:', { userId: authedUser.id, role: socket.data.role, socketId: socket.id });
    }
  }

  // User/Admin requests conversation. Admin can specify { userId }. Supports pagination: { limit=20, beforeTs }
  socket.on('chat:get_thread', async (payloadOrCb, maybeCb) => {
    const payload = typeof payloadOrCb === 'function' ? {} : (payloadOrCb || {})
    const cb = typeof payloadOrCb === 'function' ? payloadOrCb : maybeCb
    let userId = socket.data.userId
    if (socket.data.role === 'admin' && payload?.userId) userId = String(payload.userId)
    if (!userId) { if (typeof cb === 'function') cb([]); return }
    try {
      const limit = Math.min(Math.max(Number(payload?.limit) || 20, 1), 100)
      const beforeTs = payload?.beforeTs ? new Date(Number(payload.beforeTs)) : null
      const criteria = beforeTs ? { userId, createdAt: { $lt: beforeTs } } : { userId }
      const docs = await Message.find(criteria).sort({ createdAt: -1 }).limit(limit).lean()
      const thread = docs.reverse().map(d => ({ from: d.from, text: d.text, ts: new Date(d.createdAt).getTime() }))
      if (!thread.length && conversations.has(userId)) {
        const mem = conversations.get(userId) || []
        if (typeof cb === 'function') cb(mem)
      } else {
        if (typeof cb === 'function') cb(thread)
      }
    } catch {
      const mem = conversations.get(userId) || []
      if (typeof cb === 'function') cb(mem)
    }
  });

  // Admin requests recent conversations list with user info, sorted by latest message
  socket.on('chat:get_recent', async (cb) => {
    if (socket.data.role !== 'admin') return;
    try {
      const agg = await Message.aggregate([
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$userId', lastText: { $first: '$text' }, lastFrom: { $first: '$from' }, ts: { $first: '$createdAt' } } },
        { $sort: { ts: -1 } },
        { $limit: 200 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { userId: '$_id', lastText: 1, lastFrom: 1, ts: 1, username: '$user.username', email: '$user.email' } }
      ])
      const list = agg.map(r => ({
        userId: String(r.userId),
        lastText: r.lastText || '',
        lastFrom: r.lastFrom || 'user',
        ts: r.ts instanceof Date ? r.ts.getTime() : Date.now(),
        username: r.username || '',
        email: r.email || ''
      }))
      if (typeof cb === 'function') cb(list)
    } catch {
      const list = Array.from(conversations.entries()).map(([userId, msgs]) => {
        const last = msgs[msgs.length - 1];
        return { userId, lastText: last?.text || '', lastFrom: last?.from || 'user', ts: last?.ts || Date.now() };
      }).sort((a, b) => b.ts - a.ts);
      if (typeof cb === 'function') cb(list);
    }
  });

  // User sends message to admin(s)
  socket.on('chat:user_message', async (payload) => {
    if (!socket.data.userId || !payload?.text) return;
    const msg = { from: 'user', text: String(payload.text).slice(0, 1000), ts: Date.now() };
    pushMessage(socket.data.userId, msg);
    try { 
      const savedMsg = await Message.create({ userId: socket.data.userId, from: 'user', text: msg.text });
      console.log('User message saved:', { userId: socket.data.userId, text: msg.text, msgId: savedMsg._id });
    } catch (error) {
      console.error('Failed to save user message:', error);
    }
    // notify all admins
    console.log('Broadcasting user message to admins. Admin socket IDs:', Array.from(adminSocketIds));
    adminSocketIds.forEach((sid) => {
      io.to(sid).emit('chat:message', { userId: socket.data.userId, ...msg });
      io.to(sid).emit('chat:notification', { userId: socket.data.userId, text: msg.text });
    });
  });

  // Admin sends message to a specific user
  socket.on('chat:admin_message', async (payload) => {
    if (socket.data.role !== 'admin' || !payload?.toUserId || !payload?.text) return;
    const toUserId = String(payload.toUserId);
    const msg = { from: 'admin', text: String(payload.text).slice(0, 1000), ts: Date.now() };
    pushMessage(toUserId, msg);
    
    console.log('Admin sending message:', { toUserId, text: msg.text, adminSocketIds: Array.from(adminSocketIds) });
    
    try { 
      const savedMsg = await Message.create({ userId: toUserId, from: 'admin', text: msg.text });
      console.log('Admin message saved to DB:', { toUserId, text: msg.text, msgId: savedMsg._id });
    } catch (error) {
      console.error('Failed to save admin message to DB:', error);
    }
    
    // Send to the specific user
    io.to(`user:${toUserId}`).emit('chat:message', { userId: toUserId, ...msg });
    io.to(`user:${toUserId}`).emit('chat:notification', { text: msg.text });
    
    // Echo back to ALL admins (including sender) to update their UI
    adminSocketIds.forEach((sid) => {
      console.log('Echoing admin message to admin socket:', sid);
      io.to(sid).emit('chat:message', { userId: toUserId, ...msg });
    });
  });

  // Typing indicators
  socket.on('chat:typing', (payload) => {
    const isTyping = !!payload?.isTyping
    if (socket.data.role === 'admin') {
      // Admin typing to specific user
      const toUserId = String(payload?.toUserId || '')
      if (!toUserId) return
      io.to(`user:${toUserId}`).emit('chat:typing', { from: 'admin', isTyping })
    } else {
      // User typing, broadcast to admins
      adminSocketIds.forEach((sid) => io.to(sid).emit('chat:typing', { from: 'user', userId: socket.data.userId, isTyping }))
    }
  })

  socket.on('disconnect', () => {
    if (socket.data?.role === 'admin') {
      adminSocketIds.delete(socket.id);
    }
    if (socket.data?.userId) {
      removeUserSocket(socket.data.userId, socket.id);
    }
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    // console.log('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});