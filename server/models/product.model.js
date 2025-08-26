import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        images: [{ type: String }],
        category: { type: String, default: "general" },
        gender: { 
            type: String, 
            enum: ["men", "women", "unisex"], 
            default: "unisex" 
        },
        brand: { type: String, default: "" },
        countInStock: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;


