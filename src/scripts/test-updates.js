import Author from "../models/author.js";
import Book from "../models/book.js";

// Test: Modifier un livre
console.log("=== Test: Modification d'un livre ===");
const changes = Book.updateBook(1, {
	title: "The Hobbit: An Unexpected Journey",
	year: 1937,
});
console.log(`Livres modifiés : ${changes}`);

// Test: Modifier un auteur
// console.log("\n=== Test: Modification d'un auteur ===");
// const authorChanges = Author.updateAuthor(2, "Adam", "El Kabir", "Morocco");
// console.log(`Auteurs modifiés : ${authorChanges}`);
