import pool from "../db/connection.js";

class User {
	static async getAll() {
		const users = await pool.query(`SELECT * FROM users`);
		return users;
	}

	static async getById(id) {
		const users = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
		return users;
	}

	static async count() {
		const users = await pool.query(`SELECT COUNT(*) FROM users`);
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

	static async deleteById(id) {
		const users = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
		return users;
	}

	static async clear() {
		const users = await pool.query(`DELETE FROM users`);
		return users;
	}

	static async checkExistsByUsername(username) {
		const user = pool.query(`SELECT * FROM users WHERE username = $1`, [
			username,
		]);
		return user;
	}

	// Nouvelle méthode pour mettre à jour la disponibilité d'un utilisateur
	static async updateAvailabilityById(id, data) {
		const { is_active } = data;
		const users = await pool.query(
			`
			UPDATE users 
			SET is_active = $1
			WHERE id = $2
		`,
			[is_active, id],
		);
		return users;
	}
}

export default User;
