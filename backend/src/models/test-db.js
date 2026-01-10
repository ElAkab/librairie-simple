import "dotenv/config";
import pool from "../db/connection.js";

async function test() {
	const result = await pool.query("SELECT * FROM authors");
	console.log(result.rows);
	await pool.end();
}

test();
