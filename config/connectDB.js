import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "api",
  password: "Prasanna@1999",
  port: "5432",
});

export default pool;
