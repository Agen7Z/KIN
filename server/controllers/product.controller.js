import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";

export const createProduct = async (req, res, next) => {
    try {
        console.log('Creating product with body:', req.body);
        console.log('User from middleware:', req.user);
        
        const { name, slug, description, price, images, category, gender, brand, countInStock } = req.body;
        if (!name || !slug || price === undefined) {
            return next(new AppError("name, slug and price are required", 400));
        }
        const exists = await Product.findOne({ slug });
        if (exists) {
            return next(new AppError("Product with this slug already exists", 409));
        }
        const product = await Product.create({ name, slug, description, price, images, category, gender, brand, countInStock });
        console.log('Product created successfully:', product);
        res.status(201).json({ status: "success", data: { product } });
    } catch (error) {
        console.error('Error creating product:', error);
        next(error);
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const { q, category, gender, minPrice, maxPrice } = req.query;
        console.log('Product query params:', { q, category, gender, minPrice, maxPrice });
        
        const filter = { isActive: true };
        if (q) filter.name = { $regex: q, $options: "i" };
        if (category) filter.category = category;
        if (gender && gender !== 'all') {
            if (gender === 'unisex') {
                filter.gender = 'unisex';
            } else {
                // For men/women, show products specifically for that gender OR unisex
                filter.$or = [
                    { gender: gender },
                    { gender: 'unisex' }
                ];
            }
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        console.log('Final filter:', JSON.stringify(filter, null, 2));
        
        const products = await Product.find(filter).sort({ createdAt: -1 });
        console.log(`Found ${products.length} products`);
        
        res.status(200).json({ status: "success", results: products.length, data: { products } });
    } catch (error) {
        console.error('Error in getProducts:', error);
        next(error);
    }
};

export const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({ slug, isActive: true });
        if (!product) return next(new AppError("Product not found", 404));
        res.status(200).json({ status: "success", data: { product } });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (updates.slug) {
            const exists = await Product.findOne({ slug: updates.slug, _id: { $ne: id } });
            if (exists) return next(new AppError("Slug already in use", 409));
        }
        const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!product) return next(new AppError("Product not found", 404));
        res.status(200).json({ status: "success", data: { product } });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) return next(new AppError("Product not found", 404));
        res.status(200).json({ status: "success", message: "Product deleted" });
    } catch (error) {
        next(error);
    }
};


