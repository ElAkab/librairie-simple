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
			this.currentPage = response.pagination.page; // Mettre à jour la page actuelle
			this.totalPages = response.pagination.totalPages; // Mettre à jour le total des pages

			this.renderFunction(response.data); // Rendre les données reçues
			this.updateButtons(); // Mettre à jour l'état des boutons
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
}

export default Pagination;