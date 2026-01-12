const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'bookings.db');
const db = new Database(dbPath);

const username = 'admin';
const password = 'admin123';
const saltRounds = 12;
const passwordHash = bcrypt.hashSync(password, saltRounds);

const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?');
const info = stmt.run(passwordHash, username);

if (info.changes > 0) {
    console.log(`Password for user '${username}' reset to '${password}'`);
} else {
    console.log(`User '${username}' not found.`);
}
