const { Pool } = require("pg");

function createPool() {
  if (process.env.USE_PG_MEM === "1") {
    const { newDb } = require("pg-mem");
    const db = newDb();
    const { Pool: MemPool } = db.adapters.createPg();
    return new MemPool();
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
}

const pool = createPool();

if (typeof pool.on === "function") {
  pool.on("error", (err) => {
    console.error("Unexpected PG client error", err);
  });
}

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
