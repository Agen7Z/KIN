import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";

export const createOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress, paymentInfo, shipping = 0 } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return next(new AppError("Order items are required", 400));
        }

        const productIds = items.map((i) => i.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map((p) => [p._id.toString(), p]));

        let subtotal = 0;
        const normalizedItems = items.map((i) => {
            const p = productMap.get(String(i.product));
            if (!p) throw new AppError("Product not found in cart", 400);
            subtotal += p.price * i.quantity;
            return {
                product: p._id,
                name: p.name,
                price: p.price,
                quantity: i.quantity,
                image: p.images?.[0] || "",
            };
        });

        const total = subtotal + Number(shipping || 0);

        const order = await Order.create({
            user: req.user.id,
            items: normalizedItems,
            subtotal,
            shipping,
            total,
            shippingAddress,
            paymentInfo,
        });

        res.status(201).json({ status: "success", data: { order } });
    } catch (error) {
        next(error);
    }
};

export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ status: "success", results: orders.length, data: { orders } });
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate("user", "username email").sort({ createdAt: -1 });
        res.status(200).json({ status: "success", results: orders.length, data: { orders } });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber } = req.body;
        const order = await Order.findByIdAndUpdate(
            id,
            { status, trackingNumber },
            { new: true, runValidators: true }
        );
        if (!order) return next(new AppError("Order not found", 404));
        res.status(200).json({ status: "success", data: { order } });
    } catch (error) {
        next(error);
    }
};


