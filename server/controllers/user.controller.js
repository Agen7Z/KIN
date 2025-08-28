import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";

const signToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

export const registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return next(new AppError("username, email and password are required", 400));
        }

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return next(new AppError("User with provided email or username already exists", 409));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ username, email, password: hashedPassword });

        const token = signToken(user._id);

        res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return next(new AppError("email and password are required", 400));
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return next(new AppError("Invalid credentials", 401));
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return next(new AppError("Invalid credentials", 401));
        }
        
        const token = signToken(user._id);
        
        res.status(200).json({
            status: "success",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return next(new AppError("User not found", 404));
        }
        res.status(200).json({ status: "success", data: { user } });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ status: "success", results: users.length, data: { users } });
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select("-password");
        if (!user) return next(new AppError("User not found", 404));
        res.status(200).json({ status: "success", data: { user } });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return next(new AppError("User not found", 404));
        res.status(200).json({ status: "success", message: "User deleted" });
    } catch (error) {
        next(error);
    }
};


