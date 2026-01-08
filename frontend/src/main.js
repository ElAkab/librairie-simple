import createCard from "./utils/card.js";

const app = document.getElementById("container");

async function fetchBooks() {
	const response = await fetch("/api/books");
	const books = await response.json();
	return books;
}

async function init() {
	try {
		const allBooks = await fetchBooks();
		console.log(allBooks);

		allBooks.forEach((element) => {
			const title = element.title;
			const year = element.year;
			const author = element.firstName + " " + element.lastName;
			const available = element.available;
			const id = element.id;

			const cardHTML = createCard(title, year, author, available, id);
			app.innerHTML += cardHTML;
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);

		app.innerHTML = "<p>Erreur lors du chargement des livres.</p>";
	}
}

init();
