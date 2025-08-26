import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: "" },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: { type: [orderItemSchema], required: true },
        subtotal: { type: Number, required: true, min: 0 },
        shipping: { type: Number, required: true, min: 0, default: 0 },
        total: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
            index: true,
        },
        trackingNumber: { type: String, default: "" },
        shippingAddress: {
            fullName: String,
            address1: String,
            address2: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },
        paymentInfo: {
            provider: { type: String, default: "cod" },
            reference: { type: String, default: "" },
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;


