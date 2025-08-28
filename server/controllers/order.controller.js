import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";
import sendEmail, { sendEmailViaEmailJS } from "../utils/email.js";

// Add Khalti payment verification
const verifyKhaltiPayment = async (token, amountPaisa) => {
    try {
        const response = await fetch('https://khalti.com/api/v2/payment/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`
            },
            body: JSON.stringify({ token, amount: amountPaisa })
        });
        
        if (!response.ok) {
            throw new Error('Payment verification failed');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        throw new Error('Payment verification failed');
    }
};

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

        // Optional verification gate via env flag
        const shouldVerify = paymentInfo?.provider === 'khalti'
          && !!paymentInfo?.reference
          && process.env.KHALTI_VERIFY !== 'false'
          && !!process.env.KHALTI_SECRET_KEY;

        if (shouldVerify) {
            try {
                const amountPaisa = Math.round(Number(total) * 100);
                const verification = await verifyKhaltiPayment(paymentInfo.reference, amountPaisa);
                if (!verification?.idx) {
                    return next(new AppError("Invalid payment verification", 400));
                }
                if (Number(verification?.amount) !== amountPaisa) {
                    return next(new AppError("Payment amount mismatch", 400));
                }
                paymentInfo.verification = {
                    idx: verification.idx,
                    amount: verification.amount,
                    mobile: verification?.user?.mobile || '',
                    product_identity: verification?.product_identity || '',
                    product_name: verification?.product_name || ''
                };
            } catch (error) {
                return next(new AppError("Payment verification failed", 400));
            }
        } else if (paymentInfo?.provider === 'khalti') {
            // Mark as unverified (dev/mock) so admins can distinguish
            paymentInfo.verification = { mocked: true, note: 'Verification skipped (KHALTI_VERIFY=false or secret missing)' };
        }

        const order = await Order.create({
            user: req.user.id,
            items: normalizedItems,
            subtotal,
            shipping,
            total,
            shippingAddress,
            paymentInfo,
        });

        // Send confirmation email only after payment success
        try {
            const userEmail = req.user?.email;
            const isPaid = order.paymentInfo?.provider === 'khalti' && (
              order.paymentInfo?.verification?.idx || order.paymentInfo?.verification?.mocked
            );
            if (userEmail && isPaid) {
                const firstItem = normalizedItems?.[0];
                const totalUnits = normalizedItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
                await sendEmailViaEmailJS(process.env.EMAILJS_ORDER_TEMPLATE_ID || '', {
                    to_email: userEmail,
                    order_id: String(order._id).slice(-6),
                    name: firstItem?.name || 'Order Items',
                    units: totalUnits,
                    order_total: Number(order.total || 0).toFixed(2),
                    orders: normalizedItems.map(i => ({
                        name: i.name,
                        units: Number(i.quantity || 0),
                        price: Number(i.price || 0).toFixed(2)
                    })),
                    cost: {
                        shipping: Number(shipping || 0).toFixed(2),
                        total: Number(order.total || 0).toFixed(2)
                    }
                });
            }
        } catch (e) {
            // Non-blocking: log and continue
            console.error('Order email failed:', e.message);
        }

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
        const orders = await Order.find().populate("user", "email").sort({ createdAt: -1 });
        res.status(200).json({ status: "success", results: orders.length, data: { orders } });
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return next(new AppError("Order not found", 404));
        if (String(order.user) !== String(req.user.id) && req.user.role !== 'admin') {
            return next(new AppError("Not authorized to view this order", 403));
        }
        res.status(200).json({ status: "success", data: { order } });
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


