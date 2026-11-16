const router = require('express').Router();
const p = require('../controllers/productController');
const c = require('../controllers/categoryController');
const b = require('../controllers/bannerController');
const a = require('../controllers/adminController');

router.get('/products', p.getProducts);
router.get('/products/highlights', p.getHighlights); // must be before :identifier
router.get('/products/:identifier', p.getProduct);
router.get('/categories', c.getPublic);
router.get('/banners', b.getPublic);
router.get('/settings/public', a.getSettingsPublic);
module.exports = router;
