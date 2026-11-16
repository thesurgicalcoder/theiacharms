const router = require('express').Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rateLimiter');

router.post('/login', loginLimiter, auth.login);
router.get('/me', authenticate, auth.me);
router.post('/forgot-password', loginLimiter, auth.forgotPassword);
router.post('/reset-password', loginLimiter, auth.resetPassword);
module.exports = router;
