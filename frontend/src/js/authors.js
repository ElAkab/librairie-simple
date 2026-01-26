import API_URL from "./config.js";
import Pagination from "../utils/pagination.js";
import { isAuth } from "../utils/authInit.js";

const isUserAuth = await isAuth();

const authField = document.querySelector(".auth-field");
const userMenu = document.querySelector(".user-menu");
const span = document.querySelector(".main-container span");

const isLoggedIn = !!(isUserAuth && isUserAuth.user);
const username =
	isUserAuth && isUserAuth.user ? isUserAuth.user.username : undefined;

authField.style.display = isLoggedIn ? "none" : "flex";
userMenu.style.display = isLoggedIn ? "inline-block" : "none";

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

const authorsField = document.getElementById("authors-field");
const searchInput = document.querySelector("input[type='search']");
const searchButton = document.querySelector(".search-bar button");
const resetSearch = document.querySelector(".reset-search");

// ==============================================
// Gestion de la recherche
// ==============================================
searchButton.addEventListener("click", () => getSearchResults());

async function getSearchResults() {
	try {
		if (resetSearch) resetSearch.style.display = "flex";

		const searchValue = searchInput.value.trim();
		searchInput.value = "";

		const response = await fetchAuthors(1, searchValue);
		renderAuthors(response.data);
	} catch (error) {
		console.error("Erreur lors de la recherche :", error);
		alert("Erreur lors de la recherche des auteurs");
	}
}

resetSearch.addEventListener("click", async () => {
	try {
		resetSearch.style.display = "none";

		const response = await fetchAuthors(1);
		renderAuthors(response.data);

		pagination.resetToFirstPage();
	} catch (error) {
		console.error(
			"Erreur lors de la réinitialisation de la recherche :",
			error,
		);
		alert("Erreur lors de la réinitialisation de la recherche des auteurs");
	}
});

async function fetchAuthors(page = 1, filter = "") {
	try {
		const params = new URLSearchParams({
			page,
			limit: 6,
			...(filter && { searched: filter }),
		});

		const response = await fetch(`${API_URL}/api/authors?${params.toString()}`);

		if (!response.ok) throw new Error("Erreur avec l'API");

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la récupération des auteurs :", error);
		authorsField.innerHTML = `<h1>Une erreur est survenue :/</h1>`;
		return { data: [], total: 0, page: 1, limit: 6 };
	}
}

function renderAuthors(authors) {
	authorsField.innerHTML = "";
	const authorsArray = authors.data || authors; // Supporter les deux formats

	authorsArray.forEach((author) => {
		const card = `
			<div class="author-card">
				<span id="badge-author-id">${author.id}</span>
				<h2>${author.full_name}</h2>
				<hr />
				<div class="author-details">
					<div><strong>Nationalité :</strong></div>
					<div>${author.nationality}</div>
				</div>
				<div class="author-details">
					<div><strong>Naissance :</strong></div>
					<div>${author.birth_year}</div>
				</div>
			</div>
		`;
		authorsField.innerHTML += card;
	});
}

// Initialiser la pagination
const pagination = new Pagination(fetchAuthors, renderAuthors);

// =================================================================
// Gestion du formulaire de filtre
// =================================================================
const modal = document.getElementById("modal");
const form = modal?.querySelector("form");

if (modal && form) {
	modal.addEventListener("submit", (e) => {
		e.preventDefault();
		const formData = new FormData(form);

		const filters = {
			nationality: formData.getAll("nationality"),
			birthYear: formData.getAll("birth_year"),
		};

		console.log(filters);
		// TODO: Appliquer les filtres à la pagination
	});
}

// todo 1 : ajouter la gestion des filtres dans le formulaire
// todo 2 : ajouter le moyen de supprimer un auteur et tous ses livres associés
// todo 3 : ajouter le moyen de modifier un auteur
