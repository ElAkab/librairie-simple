const authorsField = document.getElementById("authors-field");

async function getAuthors() {
	try {
		const req = await fetch("/api/authors");

		if (!req.ok) throw new Error("Erreur avec l'API");

		const result = await req.json();

		return result;
	} catch (error) {
		console.error("Erreur lors de la récupération des auteurs :", error);
		authorsField.innerHTML = `<h1>Une erreur est survenue :/</h1>`;
		return []; // Retourne un tableau vide en cas d'erreur
	}
}

async function init() {
	try {
		const allAuthors = await getAuthors();
		console.log(allAuthors);

		allAuthors.forEach((element) => {
			const firstName = element.firstName;
			const lastName = element.lastName;
			const nationality = element.nationality;
			const birth_year = element.birth_year;

			const card = `
				<div class="author-card">
				<span id="badge-author-id">${element.id}</span>
					<h2>${firstName} ${lastName}</h2>
					<hr />
					<div class="author-details">
						<div><strong>Nationalité :</strong></div>
						<div>${nationality}</div>
					</div>
					<div class="author-details">
						<div><strong>Naissance :</strong></div>
						<div>${birth_year}</div>
					</div>
				</div>
			`;
			authorsField.innerHTML += card;
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des auteurs :", error);

		authorsField.innerHTML = "<p>Erreur lors du chargement des auteurs.</p>";
	}
}

// =================================================================
// Gestion du formulaire de filtre
// ========================================================================
const modal = document.getElementById("modal");
const form = modal.querySelector("form");

// Intercepter la validation du formulaire
modal.addEventListener("submit", () => {
	const formData = new FormData(form); // Récupère les données du formulaire

	const filters = {
		nationality: formData.getAll("nationality"), // getAll pour récupérer toutes les valeurs sélectionnées
		birthYear: formData.getAll("birth_year"),
	};

	// Log des filtres sélectionnés
	console.log(filters);
});

init();

// todo 1 : ajouter la gestion des filtres dans le formulaire
// todo 2 : ajouter le moyen de supprimer un auteur et tous ses livres associés
// todo 3 : ajouter le moyen de modifier un auteur
