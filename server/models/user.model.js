import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    googleId: {
        type: String,
        required: false,
        unique: false,
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;