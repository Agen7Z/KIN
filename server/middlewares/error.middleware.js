import AppError from "../utils/appError.js";

export const notFound = (req, res, next) => {
    next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (process.env.NODE_ENV === "production") {
        // Optionally hide internal errors in production
        if (!err.isOperational) {
            message = "Something went wrong";
        }
    }

    res.status(statusCode).json({
        status: `${statusCode}`.startsWith("4") ? "fail" : "error",
        message,
    });
};


