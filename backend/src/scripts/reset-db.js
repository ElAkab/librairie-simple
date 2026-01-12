import pool from "../db/connection.js";

async function resetDatabase() {
	const client = await pool.connect();
	
	try {
		// Supprimer toutes les données (CASCADE pour respecter les contraintes FK)
		await client.query("DELETE FROM loans");
		await client.query("DELETE FROM books");
		await client.query("DELETE FROM authors");

		// Réinitialiser les séquences auto-increment (équivalent de sqlite_sequence)
		await client.query("ALTER SEQUENCE books_id_seq RESTART WITH 1");
		await client.query("ALTER SEQUENCE authors_id_seq RESTART WITH 1");
		await client.query("ALTER SEQUENCE loans_id_seq RESTART WITH 1");

		console.log("🗑️  Database cleared");

		// Afficher les tables vides
		const books = await client.query("SELECT * FROM books");
		const authors = await client.query("SELECT * FROM authors");
		const loans = await client.query("SELECT * FROM loans");

		console.table({
			books: books.rows,
			authors: authors.rows,
			loans: loans.rows,
		});

		// Repeupler
		// await seedDatabase();
	} catch (error) {
		console.error("❌ Error resetting database:", error);
		throw error;
	} finally {
		client.release();
	}
}

resetDatabase()
	.then(() => {
		console.log("✅ Reset complete");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Reset failed:", error);
		process.exit(1);
	});
