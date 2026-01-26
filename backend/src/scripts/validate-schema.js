import pool from "../db/connection";

console.log("🔍 Validation du schéma de la base de données PostgreSQL...\n");

// Skip validation en local si pas de DATABASE_URL
if (!process.env.DATABASE_URL) {
	console.log("⏭️  Skip validation (environnement local sans PostgreSQL)");
	console.log("✅ Ce script sera exécuté automatiquement sur Railway\n");
	process.exit(0);
}

async function validateSchema() {
	let client;
	try {
		// Se connecter à la base de données
		client = await pool.connect();

		// Vérifier que les tables existent
		const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('authors', 'books', 'loans')
        `);

		// Si le nombre de tables trouvées n'est pas 3, lever une erreur
		if (result.rows.length !== 3) {
			throw new Error(`Attendu 3 tables, trouvé ${result.rows.length}`);
		}

		// Sinon, afficher les tables trouvées
		console.log(
			"✅ Tables présentes:",
			result.rows.map((t) => t.table_name).join(", "),
		);

		// Vérifier les contraintes FOREIGN KEY
		const fkResult = await client.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY'
        `);

		// Afficher le nombre de contraintes FOREIGN KEY
		console.log(
			`✅ ${fkResult.rows[0].count} contraintes FOREIGN KEY trouvées`,
		);
		console.log("\n✨ Schéma valide !");

		// Terminer avec succès
		process.exit(0); // exit(0) indique le succès
	} catch (error) {
		console.error("❌ Erreur de validation:", error.message);
		// Terminer avec échec
		process.exit(1); // exit(1) indique une erreur
	} finally {
		// Enfin, libérer le client et fermer la connexion
		if (client) client.release(); // release() libère le client au pool
		await pool.end(); // end() ferme toutes les connexions du pool
	}
}

validateSchema();
