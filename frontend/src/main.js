import createCard from "./utils/card.js";
import API_URL from "./config.js";
import Pagination from "./utils/pagination.js";

const app = document.getElementById("container");

// ==============================
// Gestion du Dialog de modification
// ==============================
function attachEditListeners() {
	const cards = document.querySelectorAll(".card");

	cards.forEach((card) => {
		card.addEventListener("click", (event) => {
			const bookId = card.dataset.id;
			const bookTitle = card.querySelector(".book-title").textContent;
			const bookAuthor = card.querySelector(".author").textContent;
			const bookYear = card.querySelector(".year").textContent;

			const payload = {
				id: bookId,
				title: bookTitle,
				author: bookAuthor,
				year: bookYear,
			};

			console.log(payload);

			const dialog = document.getElementById("book-dialog");
			const closeButton = document.getElementById("close-dialog");
			const saveButton = document.getElementById("save-book");

			dialog.showModal();

			closeButton.onclick = () => {
				dialog.close();
			};

			document.getElementById("book-title").value = payload.title;
			document.getElementById("book-author").textContent = payload.author;
			document.getElementById("book-year").value = payload.year;

			saveButton.onclick = async (e) => {
				e.preventDefault();

				const updatedTitle = document.getElementById("book-title").value;
				const updatedAuthor = document.getElementById("book-author").value;
				const updatedYear = document.getElementById("book-year").value;

				try {
					const sendBook = await updateBook(
						payload.id,
						updatedTitle,
						updatedAuthor,
						updatedYear
					);
					console.log("Livre mis à jour :", sendBook);

					// Rafraîchir l'affichage avec la pagination actuelle
					const currentPage =
						parseInt(new URLSearchParams(window.location.search).get("page")) ||
						1; // Détails : parseInt pour convertir en nombre - URLSearchParams pour lire les paramètres d'URL - window.location.search pour obtenir la chaîne de requête complète et get("page") pour obtenir la valeur du paramètre "page".
					const booksData = await fetchBooks(currentPage);
					renderBooks(booksData.data);

					alert("Livre mis à jour avec succès !");
				} catch (error) {
					console.error("Erreur lors de la mise à jour du livre :", error);
				}

				dialog.close();
			};
		});
	});
}

// ==============================
// Fonctions API
// ==============================
async function fetchBooks(page = 1) {
	const response = await fetch(`${API_URL}/api/books?page=${page}&limit=6`);
	return await response.json();
}

async function updateBook(id, title, author, year) {
	try {
		const req = await fetch(`${API_URL}/api/books/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title, author, year }),
		});

		if (!req.ok) {
			alert("Erreur API");
			throw new Error("Erreur API");
		}

		const result = await req.json();
		return result;
	} catch (error) {
		console.error("Erreur serveur :", error);
		alert("Erreur lors de la mise à jour du livre");
		throw error;
	}
}

// ==============================
// Render des livres
// ==============================
function renderBooks(books) {
	app.innerHTML = "";

	books.forEach((element) => {
		const title = element.title;
		const year = element.year;
		const author = element.full_name;
		const available = element.available;
		const id = element.id;

		const cardHTML = createCard(title, year, author, available, id);
		app.innerHTML += cardHTML;
	});

	// Ré-attacher les event listeners après le render
	attachEditListeners();
}

// ==============================
// Initialisation
// ==============================
new Pagination(fetchBooks, renderBooks);

// todo : ajouter le moyen de filtrer les livres par auteur ou disponibilité
// todo : ajouter le moyen de rechercher un livre
// todo : ajouter le moyen de supprimer un livre
