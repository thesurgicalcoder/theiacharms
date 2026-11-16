const router = require('express').Router();
const { authenticate, requireOwner, requireAdminOrAbove, requireManagerOrAbove } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const p = require('../controllers/productController');
const c = require('../controllers/categoryController');
const b = require('../controllers/bannerController');
const u = require('../controllers/authController');
const a = require('../controllers/adminController');
const imp = require('../controllers/importController');
const { importLimiter } = require('../middlewares/rateLimiter');

router.use(authenticate); // every admin route needs a valid token (any role = read access)

router.get('/dashboard', a.dashboard);

// products
router.get('/products', p.getProducts);
router.get('/products/:identifier', p.getProduct);
router.post('/products', requireAdminOrAbove, p.createProduct);
router.put('/products/:id', requireAdminOrAbove, p.updateProduct);
router.patch('/products/:id/status', requireManagerOrAbove, p.updateStatus);
router.delete('/products/:id', requireAdminOrAbove, p.deleteProduct);
router.post('/products/:id/duplicate', requireAdminOrAbove, p.duplicateProduct);
router.post('/upload', requireManagerOrAbove, upload.array('images', 5), a.upload);

// AI import from PDF / photos (owner, admin, manager)
router.get('/import/status', requireManagerOrAbove, imp.status);
router.post('/import/analyze', requireManagerOrAbove, importLimiter, upload.array('pages', 5), imp.analyze);
router.post('/import/confirm', requireManagerOrAbove, imp.confirm);

// categories & banners
router.get('/categories', c.getAll);
router.post('/categories', requireAdminOrAbove, c.create);
router.put('/categories/:id', requireAdminOrAbove, c.update);
router.delete('/categories/:id', requireAdminOrAbove, c.remove);
router.get('/banners', b.getAll);
router.post('/banners', requireAdminOrAbove, b.create);
router.put('/banners/:id', requireAdminOrAbove, b.update);
router.delete('/banners/:id', requireAdminOrAbove, b.remove);

// logs & export
router.get('/logs', requireAdminOrAbove, a.logs);
router.get('/export', requireAdminOrAbove, a.exportProducts);

// owner only
router.get('/users', requireOwner, u.listUsers);
router.post('/users', requireOwner, u.createUser);
router.patch('/users/:id', requireOwner, u.updateUser);
router.delete('/users/:id', requireOwner, u.deleteUser);
router.put('/settings', requireOwner, a.updateSettings);

module.exports = router;
