
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(process.cwd(), 'data', 'bookings.db');

// Initialize predefined addons
const predefinedAddons = [
    {
        name: "Tambah Orang",
        price: 40000,
        applicable_categories: JSON.stringify(["Pas Foto", "Self Photo", "Birthday", "Family"]),
        is_active: 1
    },
    {
        name: "Upgrade ke Prewedding Silver",
        price: 280000,  // Selisih Bronze -> Silver
        applicable_categories: JSON.stringify(["Prewedding Bronze"]),
        is_active: 1
    },
    {
        name: "Downgrade ke Prewedding Bronze",
        price: -280000,
        applicable_categories: JSON.stringify(["Prewedding Silver"]),
        is_active: 1
    },
    {
        name: "Tambah Jam Foto",
        price: 200000,
        applicable_categories: JSON.stringify(["Wedding", "Prewedding Bronze", "Prewedding Silver", "Prewedding Gold"]),
        is_active: 1
    },
    {
        name: "Percepat Editing (Rush Order)",
        price: 150000,
        applicable_categories: null,
        is_active: 1
    },
    {
        name: "Penyesuaian Lainnya",
        price: 0,
        applicable_categories: null,
        is_active: 1
    }
];

console.log(`Connecting to database at ${DB_PATH}...`);

try {
    const db = new Database(DB_PATH);

    // Create addons table if not exists (just in case, though app should have created it)
    db.exec(`
    CREATE TABLE IF NOT EXISTS addons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      applicable_categories TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

    const insertStmt = db.prepare(`
    INSERT INTO addons (id, name, price, applicable_categories, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

    const checkStmt = db.prepare('SELECT id FROM addons WHERE name = ?');

    let addedCount = 0;
    let skippedCount = 0;

    db.transaction(() => {
        for (const addon of predefinedAddons) {
            // Check if exists
            const existing = checkStmt.get(addon.name);
            if (existing) {
                console.log(`Skipping '${addon.name}' (already exists)`);
                skippedCount++;
                continue;
            }

            insertStmt.run(
                crypto.randomUUID(),
                addon.name,
                addon.price,
                addon.applicable_categories,
                addon.is_active
            );
            console.log(`Added '${addon.name}'`);
            addedCount++;
        }
    })();

    console.log(`\nDone! Added: ${addedCount}, Skipped: ${skippedCount}`);
    db.close();

} catch (error) {
    console.error('Error seeding addons:', error);
    process.exit(1);
}
