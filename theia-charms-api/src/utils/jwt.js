const jwt = require('jsonwebtoken');
const env = require('../config/env');
exports.sign = (user) => jwt.sign({ userId: user._id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
exports.verify = (token) => jwt.verify(token, env.jwtSecret);
