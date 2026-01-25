import createCard from "../utils/card.js";
import API_URL from "./config.js";
import Pagination from "../utils/pagination.js";
import { isAuth } from "../utils/authInit.js";

const isUserAuth = await isAuth();

const authField = document.querySelector(".auth-field");
const userMenu = document.querySelector(".user-menu");
const span = document.querySelector(".main-container span");

const isLoggedIn = !!(isUserAuth && isUserAuth.user); // Vérifie si l'utilisateur est authentifié
const username =
	isUserAuth && isUserAuth.user ? isUserAuth.user.username : undefined;

authField.style.display = isLoggedIn ? "none" : "flex";
userMenu.style.display = isLoggedIn ? "inline-block" : "none";

if (span && isLoggedIn) {
	span.textContent = username
		? `Ta gueule ${username} !`
		: "Donc faudrait la fermer un moment..";
}

const app = document.getElementById("container");
const searchInput = document.querySelector("input[type='search']");
const searchButton = document.querySelector(".search-bar button");
const resetSearch = document.querySelector(".reset-search");

// ==============================
// Gestion du menu utilisateur
// ==============================
document.getElementById("user-menu-button").addEventListener("click", () => {
	const menu = document.getElementById("user-menu-options");
	if (!menu) return;
	menu.style.display = menu.style.display === "block" ? "none" : "block";

	const handleClickOutside = (event) => {
		if (
			!menu.contains(event.target) &&
			event.target.id !== "user-menu-button"
		) {
			menu.style.display = "none";
			document.removeEventListener("click", handleClickOutside);
		}
	};

	if (menu.style.display === "block") {
		document.addEventListener("click", handleClickOutside);

		const logoutButton = document.getElementById("logout-button");
		logoutButton.addEventListener("click", async () => {
			// Supprimer le token d'authentification (si utilisé)
			// localStorage.removeItem("authToken");

			const confirmLogout = confirm(
				"Êtes-vous sûr de vouloir vous déconnecter ?",
			);
			if (confirmLogout) {
				// Récupérer l'ID utilisateur depuis le localStorage ou le contexte utilisateur
				const userId = localStorage.getItem("userId");
				if (!userId) {
					alert("Impossible de trouver l'ID utilisateur pour la déconnexion.");
					return;
				}

				// Appeler l'API de déconnexion
				const res = await fetch(`${API_URL}/api/auth/logout/${userId}`, {
					method: "POST",
					credentials: "include", // Inclure les cookies pour l'authentification
				});

				if (!res.ok) {
					alert("Erreur lors de la déconnexion.");
					return;
				}

				const data = await res.json();

				alert(data.message);
				console.log(data.message);

				// Nettoyer le localStorage
				localStorage.removeItem("userId");
				localStorage.removeItem("username");
				localStorage.removeItem("role");

				// Rediriger vers la page de login
				window.location.href = "/";
			}
		});
	}
});

searchButton.addEventListener("click", () => getSearchResults());

async function getSearchResults() {
	try {
		if (resetSearch) resetSearch.style.display = "flex";

		const query = searchInput.value.trim();
		searchInput.value = "";

		const response = await fetchBooks(1, query);
		renderBooks(response.data);
	} catch (error) {
		console.error("Erreur lors de la recherche :", error);
		alert("Erreur lors de la recherche des livres");
	}
}

// Réinitialiser la recherche
resetSearch.addEventListener("click", async () => {
	try {
		resetSearch.style.display = "none";

		const response = await fetchBooks(1);
		renderBooks(response.data);
	} catch (error) {
		console.error(
			"Erreur lors de la réinitialisation de la recherche :",
			error,
		);
		alert("Erreur lors de la réinitialisation de la recherche des livres");
	}
});

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
						updatedYear,
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
async function fetchBooks(page = 1, filter = "") {
	try {
		const params = new URLSearchParams({
			page,
			limit: 6,
			...(filter && { searched: filter }),
		});

		const response = await fetch(`${API_URL}/api/books?${params.toString()}`);

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);
		throw error;
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
