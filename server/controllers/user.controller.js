import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { sendEmailViaEmailJS } from "../utils/email.js";

const signToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

export const registerUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError("email and password are required", 400));
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return next(new AppError("User with provided email already exists", 409));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a unique username based on email local-part
        const generateUsername = async (emailAddr) => {
            const base = (emailAddr.split('@')[0] || 'user').replace(/[^a-zA-Z0-9._-]/g, '') || 'user'
            let candidate = base
            let counter = 1
            // Ensure uniqueness
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const exists = await User.findOne({ username: candidate }).select('_id').lean()
                if (!exists) break
                candidate = `${base}${counter}`
                counter += 1
            }
            return candidate
        }

        const username = await generateUsername(email)

        const user = await User.create({ email, username, password: hashedPassword, provider: 'local' });

        // Fire-and-forget welcome email (same template as subscribe if desired)
        try {
            const { sendEmailViaEmailJS } = await import('../utils/email.js');
            await sendEmailViaEmailJS(process.env.EMAILJS_WELCOME_TEMPLATE_ID || '', {
                to_email: user.email,
                user_email: user.email,
            });
        } catch (e) {
            // non-blocking
        }

        const token = signToken(user._id);

        res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        // Handle duplicate key error (e.g., unique email/username)
        if (error && (error.code === 11000 || error.name === 'MongoServerError')) {
            const dupField = Object.keys(error.keyPattern || {})[0] || 'email'
            return next(new AppError(`User with this ${dupField} already exists`, 409));
        }
        // Log details for debugging
        console.error('registerUser error:', {
            name: error?.name,
            code: error?.code,
            message: error?.message,
            stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
        });
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

export const googleAuth = async (req, res, next) => {
    try {
        const { sub, email } = req.body; // sub is Google user ID from verified token
        if (!sub || !email) {
            console.error('Missing sub or email in Google auth request');
            return next(new AppError('Invalid Google token', 400));
        }

        console.log('Looking for existing user with email:', email);
        let user = await User.findOne({ email });
        let isNewUser = false;
        
        if (!user) {
            console.log('Creating new Google user');
            console.log('User data to create:', { email, provider: 'google', googleId: sub });
            
            try {
                // Check if MongoDB is connected
                if (mongoose.connection.readyState !== 1) {
                    console.error('MongoDB not connected. Ready state:', mongoose.connection.readyState);
                    return next(new AppError('Database connection error', 500));
                }
                
                // Generate a unique username for Google users
                const generateUsername = async (email) => {
                    const baseUsername = email.split('@')[0];
                    let username = baseUsername;
                    let counter = 1;
                    
                    while (true) {
                        const existingUser = await User.findOne({ username });
                        if (!existingUser) break;
                        username = `${baseUsername}${counter}`;
                        counter++;
                    }
                    return username;
                };
                
                const username = await generateUsername(email);
                console.log('Generated username for Google user:', username);
                
                user = await User.create({ 
                    email, 
                    username,
                    provider: 'google', 
                    googleId: sub, 
                    password: undefined // Don't set password for Google users
                });
                isNewUser = true;
                console.log('New Google user created successfully:', user._id);
            } catch (createError) {
                console.error('Error creating Google user - Full error:', createError);
                console.error('Error name:', createError.name);
                console.error('Error message:', createError.message);
                console.error('Error code:', createError.code);
                if (createError.errors) {
                    console.error('Validation errors:', createError.errors);
                }
                return next(new AppError(`Failed to create user account: ${createError.message}`, 500));
            }
        } else {
            console.log('Existing user found:', user._id);
            // Update googleId if it's not set
            if (!user.googleId) {
                user.googleId = sub;
                await user.save();
            }
        }

        const token = signToken(user._id);
        // Fire-and-forget welcome email for first-time Google sign-in
        if (isNewUser) {
            try {
                const { sendEmailViaEmailJS } = await import('../utils/email.js');
                await sendEmailViaEmailJS(process.env.EMAILJS_WELCOME_TEMPLATE_ID || '', {
                    to_email: user.email,
                    user_email: user.email,
                });
            } catch (e) {
                // non-blocking
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Google auth error:', error);
        next(error);
    }
}

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

export const subscribeEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return next(new AppError('email is required', 400));
        const templateId = process.env.EMAILJS_TEMPLATE_ID || '';
        const serviceId = process.env.EMAILJS_SERVICE_ID || '';
        const publicKey = process.env.EMAILJS_PUBLIC_KEY || '';

        if (!templateId || !serviceId || !publicKey) {
            // Not configured on server - respond success so client fallback can proceed without console errors
            return res.status(200).json({ status: 'success', message: 'Subscription accepted (server email not configured)' });
        }

        try {
            await sendEmailViaEmailJS(templateId, { to_email: email });
            return res.status(200).json({ status: 'success', message: 'Subscribed' });
        } catch (e) {
            // Best-effort: do not 500; client may send via fallback
            return res.status(200).json({ status: 'success', message: 'Subscription accepted (email send failed server-side)' });
        }
    } catch (error) {
        next(error);
    }
};


