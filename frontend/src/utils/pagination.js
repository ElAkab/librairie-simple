class Pagination {
	// Le constructeur prend en paramètres une fonction de récupération des données et une fonction de rendu
	constructor(fetchFunction, renderFunction) {
		this.currentPage = 1; // Page actuelle
		this.totalPages = 1; // Total des pages
		this.fetchFunction = fetchFunction; // Fonction pour récupérer les données
		this.renderFunction = renderFunction; // Fonction pour rendre les données

		// Sélection des boutons de navigation
		this.leftBtn = document.getElementById("gauche");
		this.rightBtn = document.getElementById("droite");

		// Initialisation des événements des boutons
		this.init();
	}

	// Charger une page spécifique
	init() {
		this.leftBtn.addEventListener("click", () => this.goToPreviousPage());
		this.rightBtn.addEventListener("click", () => this.goToNextPage());

		this.loadPage(this.currentPage);
	}

	async loadPage(page) {
		try {
			const response = await this.fetchFunction(page);

			// Gérer les deux formats de réponse (ancien: array, nouveau: {data, pagination})
			let data, pagination;

			if (Array.isArray(response)) {
				// Format ancien (backend non mis à jour)
				console.warn(
					"⚠️ API retourne l'ancien format (array). Mise à jour backend recommandée.",
				);
				data = response;
				pagination = {
					page: this.currentPage,
					totalPages: 1, // Impossible de paginer sans ces infos
					total: response.length,
					limit: response.length,
				};
			} else {
				// Format nouveau (avec pagination)
				data = response.data;
				pagination = response.pagination;
			}

			this.currentPage = pagination.page;
			this.totalPages = pagination.totalPages;

			this.renderFunction(data);
			this.updateButtons();
		} catch (error) {
			console.error("Erreur lors du chargement de la page :", error);
		}
	}

	goToPreviousPage() {
		if (this.currentPage > 1) {
			this.loadPage(this.currentPage - 1);
		}
	}

	goToNextPage() {
		if (this.currentPage < this.totalPages) {
			this.loadPage(this.currentPage + 1);
		}
	}

	updateButtons() {
		// Désactiver le bouton gauche si on est à la première page
		this.leftBtn.disabled = this.currentPage === 1;
		// Désactiver le bouton droit si on est à la dernière page
		this.rightBtn.disabled = this.currentPage === this.totalPages;
	}

	resetToFirstPage() {
		this.currentPage = 1;
		this.loadPage(1);

		this.loadPage(1);
	}
}

export default Pagination;
