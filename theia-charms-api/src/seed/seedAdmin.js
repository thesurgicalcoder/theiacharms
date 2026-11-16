// Creates the owner account from .env (also happens automatically on server start).
const db = require('../db');
const bootstrap = require('../db/bootstrap');
db.connect();
bootstrap().catch((e) => { console.error(e.message); process.exitCode = 1; }).finally(() => db.close());
