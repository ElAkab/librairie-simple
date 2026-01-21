import pool from "../db/connection.js";

async function checkTables() {
	try {
		const result = await pool.query(`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public'
			ORDER BY table_name
		`);
		
		console.log("📋 Tables existantes :");
		console.table(result.rows);
		
		// Vérifier la structure de la table users si elle existe
		const usersCheck = await pool.query(`
			SELECT column_name, data_type 
			FROM information_schema.columns 
			WHERE table_name = 'users'
			ORDER BY ordinal_position
		`);
		
		if (usersCheck.rows.length > 0) {
			console.log("\n🔍 Structure de la table users :");
			console.table(usersCheck.rows);
		} else {
			console.log("\n❌ La table 'users' n'existe pas");
		}
		
		process.exit(0);
	} catch (error) {
		console.error("❌ Erreur:", error.message);
		process.exit(1);
	}
}

checkTables();
