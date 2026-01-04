import db from "../db/connection.js";

class Author {
	static createAuthor(firstName, lastName, birth_year, nationality) {
		const stmt = db.prepare(`
			INSERT INTO authors (firstName, lastName, birth_year, nationality) VALUES (?, ?, ?, ?)
		`);
		const result = stmt.run(firstName, lastName, birth_year, nationality);
		return result.lastInsertRowid;
	}

	static findAll() {
		return db.prepare(`SELECT * FROM authors LIMIT 6`).all();
	}

	static findById(id) {
		return db.prepare(`SELECT * FROM authors WHERE id = ?`).get(id);
	}

	static updateAuthor(firstName, lastName, nationality, id) {
		const stmt = db.prepare(`
			UPDATE authors
			SET firstName = ?, lastName = ?, nationality = ?
			WHERE id = ?
		`);
		const result = stmt.run(firstName, lastName, nationality, id);
		return result.changes; // Nombre de lignes modifiées
	}

	static deleteById(id) {
		return db.prepare(`DELETE FROM authors WHERE id = ?`).run(id);
	}
}

// console.log(Autors.createAuthor("Itler", "Adolf", 1895, "German"));
// console.log(Author.findAll());

export default Author;
