import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";
import Order from "../models/order.model.js";

export const createProduct = async (req, res, next) => {
    try {
        // console.log('Creating product with body:', req.body);
        // console.log('User from middleware:', req.user);
        
        if (req.user.role !== 'admin') {
            return next(new AppError('Only admins can create products', 403));
        }
        
        const product = await Product.create(req.body);
        
        // console.log('Product created successfully:', product);
        
        res.status(201).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

export const bulkImportProducts = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new AppError('Only admins can bulk import products', 403));
        }
        
        const { products } = req.body;
        
        if (!Array.isArray(products) || products.length === 0) {
            return next(new AppError('Products array is required and must not be empty', 400));
        }
        
        console.log(`Bulk importing ${products.length} products...`);
        
        // Add default values and validation
        const productsToCreate = products.map(product => ({
            ...product,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        
        const createdProducts = await Product.insertMany(productsToCreate, { 
            ordered: false // Continue even if some fail
        });
        
        console.log(`Successfully imported ${createdProducts.length} products`);
        
        res.status(201).json({
            status: 'success',
            message: `Successfully imported ${createdProducts.length} products`,
            data: { 
                count: createdProducts.length,
                products: createdProducts 
            }
        });
    } catch (error) {
        console.error('Bulk import error:', error);
        next(error);
    }
};

export const deleteAllProducts = async (req, res, next) => {
    try {
        const result = await Product.deleteMany({});
        
        res.status(200).json({
            status: 'success',
            message: `Successfully deleted ${result.deletedCount} products`,
            data: {
                deletedCount: result.deletedCount
            }
        });
    } catch (error) {
        console.error('Delete all products error:', error);
        next(error);
    }
};

export const getAllProductsForAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new AppError('Only admins can access all products', 403));
        }
        
        const products = await Product.find({}).sort({ createdAt: -1 });
        
        res.status(200).json({ 
            status: "success", 
            results: products.length, 
            data: { products } 
        });
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const { q, category, gender, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
        
        // console.log('Product query params:', { q, category, gender, minPrice, maxPrice });
        
        const filter = { isActive: true };
        if (q) filter.name = { $regex: q, $options: "i" };
        if (category && category !== 'all') filter.category = category;
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
        
        // console.log('Final filter:', JSON.stringify(filter, null, 2));
        
        const sortOptions = {};
        if (sort) {
            const [field, direction] = sort.split(':');
            sortOptions[field] = direction === 'desc' ? -1 : 1;
        } else {
            sortOptions.createdAt = -1;
        }

        // Get total count for pagination
        const total = await Product.countDocuments(filter);
        
        const products = await Product.find(filter)
            .sort(sortOptions)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        

        
        res.status(200).json({ 
            status: "success", 
            results: products.length, 
            total: total,
            data: { products } 
        });
    } catch (error) {
        next(error);
    }
};

export const getTrendingProducts = async (req, res, next) => {
    try {
        // Aggregate top 10 most sold products by quantity from orders
        const pipeline = [
            { $unwind: "$items" },
            { $group: { _id: "$items.product", sold: { $sum: "$items.quantity" } } },
            { $sort: { sold: -1 } },
            { $limit: 10 },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $replaceRoot: { newRoot: { $mergeObjects: [ "$product", { sold: "$sold" } ] } } },
            { $match: { isActive: true } }
        ];
        const products = await Order.aggregate(pipeline);
        res.status(200).json({ status: "success", results: products.length, data: { products } });
    } catch (error) {
        next(error);
    }
};

export const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        console.log('Fetching product by slug:', slug);
        
        const product = await Product.findOne({ slug, isActive: true })
            .populate({ 
                path: 'reviews.user', 
                select: 'username email',
                options: { lean: true }
            });
            
        if (!product) {
            return next(new AppError("Product not found", 404));
        }
        
        console.log('Product found:', { 
            name: product.name, 
            reviewsCount: product.reviews?.length || 0 
        });
        
        res.status(200).json({ 
            status: "success", 
            data: { product } 
        });
    } catch (error) {
        console.error('Error fetching product by slug:', error);
        next(error);
    }
};

export const addReview = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { rating, comment } = req.body;
        
        console.log('Review submission:', { slug, rating, comment, userId: req.user?.id });
        
        if (!rating) {
            return next(new AppError("Rating is required", 400));
        }
        
        if (rating < 1 || rating > 5) {
            return next(new AppError("Rating must be between 1 and 5", 400));
        }
        
        const product = await Product.findOne({ slug, isActive: true });
        if (!product) {
            return next(new AppError("Product not found", 404));
        }
        
        // Check if user has already reviewed this product
        const alreadyReviewed = product.reviews.find((r) => String(r.user) === String(req.user.id));
        if (alreadyReviewed) {
            return next(new AppError("You have already reviewed this product", 400));
        }
        
        // Add the review
        const newReview = {
            user: req.user.id,
            rating: Number(rating),
            comment: comment || '',
            createdAt: new Date()
        };
        
        product.reviews.push(newReview);
        await product.save();
        
        console.log('Review added successfully:', newReview);
        
        res.status(201).json({ 
            status: "success", 
            message: "Review added successfully",
            data: { 
                review: newReview,
                totalReviews: product.reviews.length 
            } 
        });
    } catch (error) {
        console.error('Error adding review:', error);
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


