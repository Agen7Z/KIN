import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// TTL index: auto-delete 1 day after creation
noticeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;


