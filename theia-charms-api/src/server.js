const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const db = require('./db');
const bootstrap = require('./db/bootstrap');
const { publicLimiter, adminLimiter } = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.set('trust proxy', 1); // behind Render/Vercel proxy: correct client IPs for rate limiting
// photos are loaded from other origins (the websites), so allow cross-origin embedding
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, cb) => (!origin || env.corsOrigins.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json({ limit: '1mb' }));
if (!env.isProd) app.use(morgan('dev'));

app.use('/uploads', express.static(env.uploadDir, { maxAge: '7d', index: false, dotfiles: 'ignore' }));
app.get('/api/health', (_req, res) => {
  const ok = db.ping();
  res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', adminLimiter, require('./routes/adminRoutes'));
app.use('/api', publicLimiter, require('./routes/publicRoutes'));

app.use(notFound);
app.use(errorHandler);

(async () => {
  db.connect();
  await bootstrap();
  const server = app.listen(env.port, () => console.log(`[api] listening on :${env.port} (${env.nodeEnv})`));
  const shutdown = () => server.close(() => { db.close(); process.exit(0); });
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
})().catch((e) => { console.error('[api] failed to start:', e.message); process.exit(1); });
