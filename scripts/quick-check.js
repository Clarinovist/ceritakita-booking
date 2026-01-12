const Database = require('better-sqlite3');
const path = require('path');

console.log('Checking both databases...\n');

// Check main database
const mainDbPath = path.join(__dirname, '..', 'data', 'bookings.db');
const mainDb = new Database(mainDbPath, { readonly: true });
const mainCount = mainDb.prepare('SELECT COUNT(*) as count FROM bookings').get();
console.log(`Main DB (data/bookings.db): ${mainCount.count} bookings`);
mainDb.close();

// Check backup database
const backupDbPath = path.join(__dirname, '..', 'bookings_backup.db');
const backupDb = new Database(backupDbPath, { readonly: true });
const backupCount = backupDb.prepare('SELECT COUNT(*) as count FROM bookings').get();
console.log(`Backup DB (bookings_backup.db): ${backupCount.count} bookings`);
backupDb.close();

console.log(`\nUsing database with more data: ${mainCount.count >= backupCount.count ? 'main' : 'backup'}`);
