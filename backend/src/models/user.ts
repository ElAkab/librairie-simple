import pool from "../db/connection.js";
import type { User as UserType } from "../db/database.js";

class User {
  static async getAll() {
    const users = await pool.query(`SELECT * FROM users`);
    return users;
  }

  static async getById(id: number): Promise<UserType | null> {
    const result = await pool.query<UserType>(
      `SELECT * FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  static async count() {
    const users = await pool.query(`SELECT COUNT(*) FROM users`);
    return users;
  }

  static async updateUsernameById(id: number, data: { username: string }) {
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

  static async deleteById(id: number) {
    const users = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    return users;
  }

  static async clear() {
    const users = await pool.query(`DELETE FROM users`);
    return users;
  }

  static async checkExistsByUsername(username: string) {
    const user = pool.query(`SELECT * FROM users WHERE username = $1`, [
      username,
    ]);
    return user;
  }

  // Nouvelle méthode pour mettre à jour la disponibilité d'un utilisateur
  static async updateAvailabilityById(
    id: number,
    data: { is_active: boolean },
  ) {
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
