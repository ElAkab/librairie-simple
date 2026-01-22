import pool from "../db/connection.js";

class User {
	static async getAll() {
		const users = await pool.query(`SELECT * FROM users`);
		return users;
	}

	static async count() {
		const users = await pool.query(`SELECT COUNT(*) FROM users`);
		return users;
	}

	static async getById(id) {
		const users = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
		return users;
	}

	static async updateUsernameById(id, data) {
		const { username } = data;
		const users = await pool.query(
			`
			UPDATE users 
			SET username = $1
			WHERE id = $2
		`,
			[username, id],
		);
		return users;
	}

	static async deleteBy(id) {
		const users = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
		return users;
	}

	static async clear() {
		const users = await pool.query(`DELETE FROM users`);
		return users;
	}
}

export default User;
