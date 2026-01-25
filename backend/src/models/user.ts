import pool from "../db/connection.js";
import type { User as UserType } from "../db/database.js";

class User {
	static async getAll(): Promise<{ users: UserType[] }> {
		const result = await pool.query<UserType>(`SELECT * FROM users`);
		return {
			users: result.rows as UserType[],
		};
	}

	static async getById(id: number): Promise<UserType | null> {
		const result = await pool.query<UserType>(
			`SELECT * FROM users WHERE id = $1`,
			[id],
		);
		return result.rows[0] ?? null;
	}

	static async count(): Promise<{ count: number }> {
		// On attend une promesse qui résout un objet avec une propriété count (number)
		const result = await pool.query<{ count: number }>(
			`SELECT COUNT(*) AS count FROM users`,
		);
		const count = result.rows[0]?.count ?? 0;
		return { count };
	}

	static async updateUsernameById(
		id: number,
		data: { username: string },
	): Promise<{ rowCount: number }> {
		// On attend une promesse qui résout un objet avec une propriété rowCount (number)
		const { username } = data;
		const users = await pool.query(
			`
			UPDATE users 
			SET username = $1
			WHERE id = $2
		`,
			[username, id],
		);
		return { rowCount: users.rowCount ?? 0 };
	}

	static async deleteById(id: number): Promise<{ rowCount: number }> {
		const users = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
		return { rowCount: users.rowCount ?? 0 };
	}

	static async clear(): Promise<{ rowCount: number }> {
		const users = await pool.query(`DELETE FROM users`);
		return { rowCount: users.rowCount ?? 0 };
	}

	// DELETE (id) : Mon ancienne approche
	// static async clear(): Promise<number> {
	// 	const users = await pool.query(`DELETE FROM users`);
	// 	return users.rowCount || 0;
	// }

	// Nouvelle méthode pour vérifier l'existence d'un utilisateur par son nom d'utilisateur
	static async checkExistsByUsername(
		username: string,
	): Promise<{ rowCount: number }> {
		const user = await pool.query(`SELECT * FROM users WHERE username = $1`, [
			username,
		]);
		return { rowCount: user.rowCount ?? 0 };
	}

	// Nouvelle méthode pour mettre à jour la disponibilité d'un utilisateur
	static async updateAvailabilityById(
		id: number,
		data: { is_active: boolean },
	): Promise<{ rowCount: number }> {
		const { is_active } = data;
		const users = await pool.query(
			`
			UPDATE users 
			SET is_active = $1
			WHERE id = $2
		`,
			[is_active, id],
		);
		return { rowCount: users.rowCount ?? 0 };
	}
}

export default User;
