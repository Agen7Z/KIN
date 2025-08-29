import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  from: { type: String, enum: ['user', 'admin'], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// TTL index for 12 hours (43200 seconds)
MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 43200 })

const Message = mongoose.model('Message', MessageSchema)
export default Message


