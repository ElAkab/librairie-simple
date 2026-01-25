import pool from "../db/connection.js";
import type { Author as AuthorType } from "../db/database.js";

class Author {
	static async findAll(
		limit: number = 6,
		offset: number = 0,
		filtered: string = "",
	) {
		const query = `
			SELECT * FROM authors
			${filtered ? "WHERE full_name ILIKE $3 OR nationality ILIKE $4" : ""}
			LIMIT $1 OFFSET $2
		`;

		const params = filtered
			? [limit, offset, `%${filtered}%`, `%${filtered}%`]
			: [limit, offset];

		const result = await pool.query(query, params);
		return result.rows;
	}

	static async count() {
		const result = await pool.query("SELECT COUNT(*) as count FROM authors");
		return parseInt(result.rows[0].count);
	}

	static async findById(id) {
		const result = await pool.query("SELECT * FROM authors WHERE id = $1", [
			id,
		]);
		return result.rows[0] ?? null;
	}

	static async createAuthor(full_name, birth_year, nationality) {
		const result = await pool.query(
			"INSERT INTO authors (full_name, birth_year, nationality) VALUES ($1, $2, $3) RETURNING id",
			[full_name, birth_year, nationality],
		);
		return result.rows[0].id;
	}

	static async updateAuthor(full_name, nationality, id) {
		const result = await pool.query(
			"UPDATE authors SET full_name = $1, nationality = $2 WHERE id = $3",
			[full_name, nationality, id],
		);
		return result.rowCount;
	}

	static async deleteById(id) {
		const result = await pool.query("DELETE FROM authors WHERE id = $1", [id]);
		return result.rowCount;
	}
}

export default Author;
