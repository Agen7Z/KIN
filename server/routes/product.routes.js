import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import {
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkImportProducts,
    deleteAllProducts,
    getTrendingProducts,
    addReview,
    getAllProductsForAdmin
} from '../controllers/product.controller.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/trending/top', getTrendingProducts);
router.get('/:slug', getProductBySlug);

// User review route (protected but not admin-only)
router.post('/:slug/reviews', protect, addReview);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.get('/admin/all', getAllProductsForAdmin);
router.post('/', createProduct);
router.post('/bulk-import', bulkImportProducts);
router.delete('/delete-all', deleteAllProducts);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;


