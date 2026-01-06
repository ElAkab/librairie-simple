import db from "../db/connection.js";

const alterLoanTable = `
	-- 0. Nettoyer si la table temporaire existe déjà
	DROP TABLE IF EXISTS loans_new;
	
	-- 1. Créer une nouvelle table avec book_id NOT NULL
	CREATE TABLE loans_new (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		book_id INTEGER NOT NULL,
		borrower_name TEXT,
		borrowed_date DATE,
		return_date DATE,
		FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
	);
	
	-- 2. Copier les données de l'ancienne table (seulement celles avec book_id non NULL)
	INSERT INTO loans_new (id, book_id, borrower_name, borrowed_date, return_date)
	SELECT id, book_id, borrower_name, borrowed_date, return_date FROM loans
	WHERE book_id IS NOT NULL;
	
	-- 3. Supprimer l'ancienne table
	DROP TABLE loans;
	
	-- 4. Renommer la nouvelle table
	ALTER TABLE loans_new RENAME TO loans;
`;

try {
	db.exec(alterLoanTable);
	console.log("Mise à jour de la table 'loans' effectuée avec succès.");
} catch (error) {
	console.error(
		"Erreur lors de la mise à jour de la table 'loans':",
		error.message
	);
	process.exit(1);
}
