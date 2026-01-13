import API_URL from "./config.js";
import Pagination from "./utils/pagination.js";

const authorsField = document.getElementById("authors-field");

// =================================================================
// Gestion de la pagination
// =================================================================
async function fetchAuthors(page = 1) {
	try {
		const response = await fetch(`${API_URL}/api/authors?page=${page}&limit=6`);

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

	authors.forEach((author) => {
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
new Pagination(fetchAuthors, renderAuthors);

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
