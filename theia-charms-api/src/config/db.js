const mongoose = require('mongoose');
const env = require('./env');

mongoose.set('strictQuery', true);

async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  } catch (e) {
    if (/querySrv|ENOTFOUND|ECONNREFUSED|ETIMEOUT/i.test(e.message)) {
      console.error('\n[db] Cannot reach MongoDB. Try one of these:');
      console.error('  1) Use local MongoDB: MONGODB_URI=mongodb://127.0.0.1:27017/theia_charms');
      console.error('  2) Atlas + DNS problem: add  DNS_SERVERS=8.8.8.8,1.1.1.1  to .env');
      console.error('  3) Atlas: use the non-SRV (mongodb://...) connection string, and allow your IP in Network Access');
      console.error('  See SETUP_GUIDE.txt, section "Common errors".\n');
    }
    throw e;
  }
  console.log(`[db] MongoDB connected (${mongoose.connection.name})`);
}

mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));
mongoose.connection.on('error', (e) => console.error('[db] error', e.message));

module.exports = connectDB;
