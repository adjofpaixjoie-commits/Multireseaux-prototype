const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "db", "usage.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    success INTEGER NOT NULL,
    cost REAL NOT NULL,
    filename TEXT,
    caption TEXT,
    error TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

function logPublication({ platform, success, cost, filename, caption, error }) {
  const stmt = db.prepare(`
    INSERT INTO usage_log (platform, success, cost, filename, caption, error)
    VALUES (@platform, @success, @cost, @filename, @caption, @error)
  `);
  stmt.run({
    platform,
    success: success ? 1 : 0,
    cost,
    filename: filename || null,
    caption: caption || null,
    error: error || null,
  });
}

function getMonthlyTotal() {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(cost), 0) AS total
       FROM usage_log
       WHERE success = 1 AND created_at >= date('now', 'start of month')`
    )
    .get();
  return row.total;
}

function getRecentLogs(limit = 20) {
  return db
    .prepare(`SELECT * FROM usage_log ORDER BY id DESC LIMIT ?`)
    .all(limit);
}

module.exports = { logPublication, getMonthlyTotal, getRecentLogs };
