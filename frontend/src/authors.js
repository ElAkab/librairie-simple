const authorsField = document.getElementById("authors-field");

async function getAuthors() {
	try {
		const req = await fetch("/api/authors");

		console.log(req);
		if (!req.ok) throw new Error("Erreur avec l'API");

		const result = await req.json();

		console.log(result);
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
                    <h2>${firstName} ${lastName}</h2>
                    <p><strong>Nationalité :</strong> ${nationality}</p>
                    <p><strong>Année de naissance :</strong> ${birth_year}</p>
                </div>
            `;
			authorsField.innerHTML += card;
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des auteurs :", error);

		authorsField.innerHTML = "<p>Erreur lors du chargement des auteurs.</p>";
	}
}

init();
