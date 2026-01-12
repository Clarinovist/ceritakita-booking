
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'data', 'bookings.db');

console.log('=== REVENUE & OUTSTANDING REPORT ===\n');
console.log(`Database: ${DB_PATH}`);

if (!fs.existsSync(DB_PATH)) {
    console.error('Database file not found!');
    process.exit(1);
}

const db = new Database(DB_PATH);

// Get all non-cancelled bookings
const bookings = db.prepare(`
  SELECT * FROM bookings 
  WHERE status != 'Cancelled'
  ORDER BY created_at ASC
`).all();

let totalRevenue = 0;
let totalOutstanding = 0;
let totalNegativeOutstanding = 0;

console.log(`\nFound ${bookings.length} active/completed bookings.\n`);
console.log('Customer | Total Price | Paid | Outstanding | Issues');
console.log('-'.repeat(80));

bookings.forEach(booking => {
    // Get payments
    const payments = db.prepare('SELECT * FROM payments WHERE booking_id = ?').all(booking.id);
    const paid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Calculate outstanding
    // FIX: Treat negative outstanding as zero for reporting purposes (overpayment)
    const rawOutstanding = booking.total_price - paid;
    const outstanding = Math.max(0, rawOutstanding);

    // Track totals
    totalRevenue += paid;
    totalOutstanding += outstanding;

    let issue = '';
    if (rawOutstanding < 0) {
        issue = `⚠️ Overpaid by ${Math.abs(rawOutstanding).toLocaleString()}`;
        totalNegativeOutstanding += rawOutstanding;
    } else if (booking.status === 'Completed' && outstanding > 0) {
        issue = `❌ Unpaid but Completed`;
    }

    if (outstanding > 0 || issue) {
        console.log(
            `${booking.customer_name.padEnd(20)} | ` +
            `Rp ${booking.total_price.toLocaleString().padStart(10)} | ` +
            `Rp ${paid.toLocaleString().padStart(10)} | ` +
            `Rp ${outstanding.toLocaleString().padStart(10)} | ` +
            `${issue}`
        );
    }
});

console.log('-'.repeat(80));
console.log('\nSUMMARY:');
console.log(`Total Revenue Received: Rp ${totalRevenue.toLocaleString()}`);
console.log(`Total Outstanding (Receivable): Rp ${totalOutstanding.toLocaleString()}`);
console.log(`Total Overpayment (Negative balance): Rp ${Math.abs(totalNegativeOutstanding).toLocaleString()}`);

db.close();
