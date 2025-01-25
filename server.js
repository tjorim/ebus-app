/**
 * eBUS Monitor Server
 * Fetches and stores data from eBUS daemon
 */

// Dependencies
const express = require('express');
const Database = require('better-sqlite3');

// Configuration
const CONFIG = {
    port: process.env.PORT || 3000,
    ebus: {
        host: process.env.EBUSD_HOST || '192.168.0.92',
        port: process.env.EBUSD_PORT || 8889
    },
    updateInterval: 60000, // 1 minute
    historyLimit: 100      // Number of historical records to retrieve
};

// Database initialization
const db = new Database('ebus-data.db', { verbose: console.log });

// Create database schema
db.exec(`
    CREATE TABLE IF NOT EXISTS ebus_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE,                -- Unique eBUS path (e.g., 370.messages.ActualRoomTempDesiredHc1)
        name TEXT,                       -- Human-readable name
        passive BOOLEAN,                 -- Whether the key is passive
        write BOOLEAN                    -- Whether the key is writable
    );

    CREATE TABLE IF NOT EXISTS ebus_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_id INTEGER,                  -- Foreign key to 'ebus_keys' table
        value TEXT,                      -- Value as JSON
        lastup INTEGER,                  -- Last update time from eBUS
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, -- When the value was stored
        FOREIGN KEY(key_id) REFERENCES ebus_keys(id)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_ebus_values_unique 
    ON ebus_values (key_id, value);     -- Prevent duplicate values for the same key

    CREATE INDEX IF NOT EXISTS idx_ebus_values_key_time 
    ON ebus_values (key_id, timestamp); -- Optimize queries by key and time
`);

// Prepare statements for efficient operations
const insertKey = db.prepare(`
    INSERT OR IGNORE INTO ebus_keys (path, name, passive, write) 
    VALUES (?, ?, ?, ?)
`);

const insertValue = db.prepare(`
    INSERT OR IGNORE INTO ebus_values (key_id, value, lastup) 
    SELECT k.id, ?, ?
    FROM ebus_keys k
    WHERE k.path = ?
`);

// Express initialization
const app = express();
app.use(express.static('public')); // Serve static files from 'public'

// Flatten nested objects into dot notation
function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(acc, flattenObject(obj[key], fullKey));
        } else {
            acc[fullKey] = obj[key];
        }
        return acc;
    }, {});
}

// API endpoints
app.get('/api/data', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT k.path, v.value, v.timestamp 
            FROM ebus_values v
            JOIN ebus_keys k ON k.id = v.key_id
            WHERE v.timestamp = (
                SELECT MAX(timestamp) FROM ebus_values
            )
        `).all();

        const data = rows.reduce((acc, row) => {
            acc[row.path] = {
                value: JSON.parse(row.value),
                timestamp: row.timestamp
            };
            return acc;
        }, {});

        console.log('API /api/data response:', data);
        res.json(data);
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/data/history', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT k.path, v.value, v.timestamp 
            FROM ebus_values v
            JOIN ebus_keys k ON k.id = v.key_id
            ORDER BY v.timestamp DESC 
            LIMIT ?
        `).all(CONFIG.historyLimit);

        console.log('API /api/data/history response:', rows);
        res.json(rows);
    } catch (error) {
        console.error('History Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Log database content for debugging
const logDatabaseContent = () => {
    const keys = db.prepare('SELECT * FROM ebus_keys').all();
    const values = db.prepare('SELECT * FROM ebus_values').all();
    console.log('Keys:', keys);
    console.log('Values:', values);
};

logDatabaseContent();

// Background data collection
const updateData = async () => {
    try {
        const response = await fetch(`http://${CONFIG.ebus.host}:${CONFIG.ebus.port}/data`);
        if (!response.ok) throw new Error(`eBUS daemon returned ${response.status}`);
        const data = await response.json();
        console.log('Fetched data:', data); // Log fetched data
        const flatData = flattenObject(data);
        console.log('Flattened data:', flatData); // Log flattened data

        // Use a transaction for atomic inserts
        const insertData = db.transaction(() => {
            for (const [path, value] of Object.entries(flatData)) {
                if (typeof value === 'object' && value !== null) {
                    insertKey.run(path, value.name || null, value.passive || false, value.write || false);
                    if ('value' in value) {
                        insertValue.run(
                            JSON.stringify(value.value),
                            value.lastup || null,
                            path
                        );
                    }
                }
            }
        });

        insertData(); // Commit the transaction
        console.log('Data inserted:', flatData); // Log inserted data
    } catch (error) {
        console.error('Data Update Error:', error.message);
    }
};

// Start periodic updates
setInterval(updateData, CONFIG.updateInterval);

// Start server
const startServer = async () => {
    try {
        await updateData(); // Fetch initial data
        app.listen(CONFIG.port, () => {
            console.log(`eBUS Monitor running on http://localhost:${CONFIG.port}`);
        });
    } catch (error) {
        console.error('Startup Error:', error.message);
        process.exit(1);
    }
};

startServer();