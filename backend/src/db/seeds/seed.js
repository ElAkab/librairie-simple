// src/db/seeds/seed.js
// Fichier de seed pour initialiser la base de données avec des données d'exemple

import Author from "../../models/author.js";
import Book from "../../models/book.js";
import Loan from "../../models/loan.js";

// Fonction pour peupler la base de données avec des données d'exemple
export function seedDatabase() {
	console.log("🌱 Seeding database...");

	// Créer des auteurs : Les constantes contiennent les IDs des auteurs créés
	const author1 = Author.createAuthor("Itler", "Adolf", 1896, "German");
	const author2 = Author.createAuthor("Orwell", "George", 1903, "British");
	const author3 = Author.createAuthor("Austen", "Jane", 1775, "British");
	const author4 = Author.createAuthor("Hemingway", "Ernest", 1899, "American");
	const author5 = Author.createAuthor("Tolkien", "J.R.R.", 1892, "British");
	const author6 = Author.createAuthor("Camus", "Albert", 1913, "French");
	const author7 = Author.createAuthor("Dumas", "Alexandre", 1802, "French");

	// Créer des livres : Les constantes contiennent les IDs des livres créés
	const book1 = Book.createBook("The Hobbit", author5, 1937);
	const book2 = Book.createBook("1984", author2, 1949);
	const book3 = Book.createBook("Animal Farm", author2, 1945);
	const book4 = Book.createBook("Pride and Prejudice", author3, 1813);
	const book5 = Book.createBook("The Old Man and the Sea", author4, 1952);
	const book6 = Book.createBook("The Lord of the Rings", author5, 1954);
	const book7 = Book.createBook("The Stranger", author6, 1942);
	const book8 = Book.createBook("The Count of Monte Cristo", author7, 1844);
	const book9 = Book.createBook("The company said the same", author1, 1945);

	// Créer les emprunts : 1 id du livre, 2 nom de l'emprunteur, 3 date d'emprunt, 4 date de retour (null si pas encore retourné)
	Loan.createLoan(book1, "Itler Adolf", "2025-06-23", null); // ! Toujours emprunté
	Loan.createLoan(book2, "Winston Smith", "2025-01-15", "2025-02-15"); // ? Retourné
	Loan.createLoan(book3, "Napoleon Pig", "2025-02-01", "2025-03-01"); // ? Retourné
	Loan.createLoan(book4, "Elizabeth Bennet", "2025-01-20", "2025-02-20"); // ? Retourné
	Loan.createLoan(book5, "Santiago Fisher", "2025-02-10", null); // ! Toujours emprunté
	Loan.createLoan(book6, "Frodo Baggins", "2025-01-25", "2025-02-25"); // ? Retourné
	Loan.createLoan(book7, "Meursault Reader", "2025-02-05", "2025-03-05"); // ? Retourné
	Loan.createLoan(book8, "Edmond Dantes", "2025-01-30", null); // ! Toujours emprunté
	Loan.createLoan(book9, "Corporate Reader", "2025-02-15", null); // ! Toujours emprunté
}
