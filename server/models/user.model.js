import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: false,
        unique: true,
        sparse: true, // Allows multiple null values
    },
    password: {
        type: String,
        required: function() {
            return this.provider === 'local';
        },
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