const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'bookings.db');

console.log('Checking database connection...');
console.log(`Database path: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found at:', dbPath);
    process.exit(1);
}

try {
    const db = new Database(dbPath, { readonly: true });

    // Check tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('✅ Connected successfully.');
    console.log(`Found ${tables.length} tables:`, tables.map(t => t.name).join(', '));

    // Check bookings
    try {
        const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
        console.log(`\n📊 Total Bookings: ${bookingCount.count}`);

        if (bookingCount.count > 0) {
            const latestBooking = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1').get();
            console.log(`   Latest booking: ${latestBooking.customer_name} (${latestBooking.created_at})`);
        }
    } catch (e) {
        console.log('⚠️ Could not query bookings table:', e.message);
    }

    // Check users
    try {
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
        console.log(`\n👥 Total Users: ${userCount.count}`);

        const users = db.prepare('SELECT username, role, is_active FROM users').all();
        users.forEach(u => {
            console.log(`   - ${u.username} (${u.role}) [${u.is_active ? 'Active' : 'Inactive'}]`);
        });
    } catch (e) {
        console.log('⚠️ Could not query users table:', e.message);
    }

    db.close();

} catch (error) {
    console.error('❌ Error connecting to database:', error.message);
}
