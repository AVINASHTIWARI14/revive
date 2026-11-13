import initSqlJs from "sql.js";
import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.DATABASE_PATH || "./data/revive.sqlite";
const absoluteDbPath = path.resolve(dbPath);
fs.mkdirSync(path.dirname(absoluteDbPath), { recursive: true });

const SQL = await initSqlJs();
const db = fs.existsSync(absoluteDbPath)
  ? new SQL.Database(new Uint8Array(fs.readFileSync(absoluteDbPath)))
  : new SQL.Database();

db.run(`
  CREATE TABLE IF NOT EXISTS feed_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Research',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    value REAL,
    unit TEXT NOT NULL DEFAULT '',
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export function all(sql) {
  const result = db.exec(sql);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row => Object.fromEntries(columns.map((column, index) => [column, row[index]])));
}

export function persistDatabase() {
  fs.writeFileSync(absoluteDbPath, Buffer.from(db.export()));
}

persistDatabase();
export default db;
