import pool from "../db/connection.js";

class User {
	static async getAll() {
		const users = await pool.query(`SELECT * FROM users`);
		return users;
	}
}

export default User;
