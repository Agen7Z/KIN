import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import Notice from '../models/notice.model.js';

const router = express.Router();

// Get latest active notices (last 24h due to TTL)
router.get('/', async (req, res, next) => {
  try {
    const notices = await Notice.find({}).sort({ createdAt: -1 }).limit(50);
    res.json({ status: 'success', data: { notices } });
  } catch (err) { next(err); }
});

// Admin: create a notice and broadcast via io
router.post('/', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const { title, message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ status: 'fail', message: 'message is required' });
    }
    const notice = await Notice.create({ title, message, createdBy: req.user?._id });

    // Broadcast using attached io
    const io = req.app.get('io');
    if (io) {
      io.emit('notice:new', { _id: notice._id, title: notice.title, message: notice.message, createdAt: notice.createdAt });
    }

    res.status(201).json({ status: 'success', data: notice });
  } catch (err) { next(err); }
});

export default router;


