import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";

export const protect = async (req, res, next) => {
    try {
        console.log('Auth headers:', req.headers.authorization);
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next(new AppError("Not authorized, token missing", 401));
        }

        console.log('Token extracted:', token ? 'Yes' : 'No');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', decoded);
        
        const user = await User.findById(decoded.id).select("_id role");
        if (!user) {
            return next(new AppError("The user belonging to this token no longer exists", 401));
        }

        req.user = { id: user._id.toString(), role: user.role };
        console.log('User set in req:', req.user);
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(error);
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }
        next();
    };
};


