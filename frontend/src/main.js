import createCard from "./utils/card.js";
import API_URL from "./config.js";

const app = document.getElementById("container");

app.addEventListener("click", (event) => {
	const card = event.target.closest(".card");
	if (card) {
		const bookId = card.dataset.id; // Récupérer l'ID du livre
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

		// Activer le <dialog> de modification ici
		const dialog = document.getElementById("book-dialog");
		const closeButton = document.getElementById("close-dialog");
		const saveButton = document.getElementById("save-book");

		// Ouvrir le dialog
		dialog.showModal();

		// Fermeture si le bouton de fermeture est cliqué
		closeButton.onclick = () => {
			dialog.close();
		};

		// Pré-remplir les champs du formulaire dans le dialog avec les données du livre
		document.getElementById("book-title").value = payload.title;
		document.getElementById("book-author").textContent = payload.author;
		document.getElementById("book-year").value = payload.year;

		// Gérer la sauvegarde des modifications
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
				// Mettre à jour l'affichage de la carte avec les nouvelles données
				card.querySelector(".book-title").textContent = updatedTitle;
				card.querySelector(".author").textContent = updatedAuthor;
				card.querySelector(".year").textContent = updatedYear;

				// Optionnel : afficher un message de succès à l'utilisateur
				alert("Livre mis à jour avec succès !");
			} catch (error) {
				console.error("Erreur lors de la mise à jour du livre :", error);
			}

			// Fermer le dialog après la sauvegarde
			dialog.close();
		};
	}
});

async function fetchBooks() {
	const response = await fetch(`${API_URL}/api/books`);
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
			const author = element.full_name;
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

init();

// todo : ajouter le moyen de filtrer les livres par auteur ou disponibilité
// * 3 : ajouter le moyen de modifier un livre après avoir cliqué dessus (html encore)
// todo : ajouter le moyen de rechercher un livre

// todo : ajouter le moyen de supprimer un livre
