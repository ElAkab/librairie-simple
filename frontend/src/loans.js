const loansContainer = document.getElementById("loans");
const applyFiltersButton = document.getElementById("apply-filters");

// ======== Appliquer les filtres ========
applyFiltersButton.addEventListener("click", async (e) => {
	e.preventDefault();

	// Récupérer les valeurs des filtres
	const bookName = document.getElementById("book-name-input").value.trim();
	const borrowerName = document
		.getElementById("borrower-name-input")
		.value.trim();

	const statusSelect = document.getElementById("loan-status");
	const status = statusSelect.value;

	const dateFrom = document.getElementById("date-from").value;
	const dateTo = document.getElementById("date-to").value;

	console.log("Filtres appliqués:", { bookName, borrowerName, status });

	// Construire les paramètres de requête
	const params = new URLSearchParams(); // Utilisation de URLSearchParams pour gérer les paramètres
	console.log(params.toString());

	if (borrowerName) params.append("borrower_name", borrowerName);
	if (bookName) params.append("book_name", bookName);
	if (status) params.append("status", status);
	if (dateFrom) params.append("date_from", dateFrom);
	if (dateTo) params.append("date_to", dateTo);

	// todo : Récupérer les emprunts filtrés depuis l'API (fait à moitié => trouver un moyen d'adapter le backend ou carrément créer une nouvelle route)
	try {
		const req = await fetch(`/api/loans?${params.toString()}`);
		if (!req.ok) throw new Error("Erreur avec l'API");
		const filteredLoans = await req.json();

		// Vider le conteneur avant d'afficher les résultats filtrés
		loansContainer.innerHTML = "";

		// Afficher les emprunts filtrés
		filteredLoans.forEach((loan) => {
			const cardLoan = document.createElement("div");
			cardLoan.classList.add("loan-card");
			const content = `
				<div class="loan-header">
					<h3>Livre ID: ${loan.book_id}</h3>
				</div>
				<div class="loan-info">
					<p><strong>Emprunteur:</strong> ${loan.borrower_name}</p>
					<p><strong>Date d'emprunt:</strong> ${loan.borrowed_date}</p>
					<p><strong>Date de retour:</strong> ${
						loan.return_date ? loan.return_date : "Non retourné"
					}</p>
				</div>
				<div class="loan-actions">
					<button class="edit-loan-button" data-loan-id="${loan.id}">Modifier</button>
				</div>
			`;
			cardLoan.innerHTML = content;
			loansContainer.appendChild(cardLoan);
		});
	} catch (error) {
		console.error("Echec de récupération des données filtrées ", error);
		loansContainer.innerHTML =
			"<p class='error'>Impossible de récupérer les données des emprunts filtrés.</p>";
	}
});

// ======== Gérer le clic sur une carte d'emprunt ========
const modal = document.getElementById("edit-loan-modal");
const closeModalBtn = document.getElementById("close-modal");
const editLoanForm = document.getElementById("edit-loan-form");

// Fermer la modale
closeModalBtn.addEventListener("click", () => {
	modal.close();
});

// Ouvrir la modale et remplir le formulaire
loansContainer.addEventListener("click", async (e) => {
	// Gérer la suppression d'un emprunt
	if (e.target.classList.contains("delete-loan-button")) {
		const loanCard = e.target.closest(".loan-card");
		if (!loanCard) return;

		const loanId = loanCard.dataset.loanId;

		if (!confirm("Voulez-vous vraiment supprimer cet emprunt ?")) return;

		try {
			const req = await fetch(`/api/loans/${loanId}`, {
				method: "DELETE",
			});
			if (!req.ok) throw new Error("Erreur lors de la suppression");

			console.log("Emprunt supprimé, ID:", loanId);
			loanCard.remove();
		} catch (error) {
			console.error("Erreur:", error);
			alert("Impossible de supprimer l'emprunt");
		}
		return;
	}

	// Gérer l'ouverture de la modale pour édition
	const loanCard = e.target.closest(".loan-card");
	if (!loanCard) return;

	const loanId = loanCard.dataset.loanId;
	console.log("Carte d'emprunt cliquée, ID:", loanId);

	// Récupérer les données de l'emprunt depuis l'API
	try {
		const req = await fetch(`/api/loans/${loanId}`);
		if (!req.ok) throw new Error("Erreur lors de la récupération de l'emprunt");
		const loan = await req.json();

		// "loan" contiendra "{
		//   "id": 3,
		//   "book_id": 3,
		//   "borrower_name": "Napoleon Pig",
		//   "borrowed_date": "2025-02-01",
		//   "return_date": "2025-03-01"
		// }"

		// Remplir le formulaire
		const editLoanStatusInput = document.getElementById("edit-loan-status");
		const borrowerNameInput = document.getElementById("borrower-name");
		const returnDateInput = document.getElementById("return-date");

		editLoanStatusInput.value = loan.loan_status || "active";
		borrowerNameInput.value = loan.borrower_name || "";
		returnDateInput.value = loan.return_date || "";

		// Stocker l'ID de l'emprunt pour la soumission
		editLoanForm.dataset.loanId = loanId;

		modal.showModal();
	} catch (error) {
		console.error("Erreur:", error);
		alert("Impossible de charger les données de l'emprunt");
	}
});

// Soumettre le formulaire de modification
editLoanForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const borrowerName = document.getElementById("borrower-name").value;
	const returnDate = document.getElementById("return-date").value;
	const editLoanStatus = document.getElementById("edit-loan-status").value;

	const loanId = editLoanForm.dataset.loanId;
	const formData = {
		status: editLoanStatus,
		borrower_name: borrowerName,
		return_date: returnDate || null,
	};

	try {
		const req = await fetch(`/api/loans/${loanId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formData),
		});

		if (!req.ok) throw new Error("Erreur lors de la mise à jour");

		const result = await req.json();
		console.log("Emprunt mis à jour:", result);

		//  Fermer la modale et recharger les emprunts
		modal.close();
		loansContainer.innerHTML = "";
		init();
	} catch (error) {
		console.error("Erreur:", error);
		alert("Impossible de mettre à jour l'emprunt");
	}
});

// ======= Fonctions ========

// Récupérer tous les emprunts
async function getLoans() {
	try {
		const req = await fetch("/api/loans");
		if (!req.ok) throw new Error("Erreur avec l'API");
		const result = await req.json();
		return result;
	} catch (error) {
		console.error("Echec de récupération de données ", error);
		loansContainer.innerHTML =
			"<p class='error'>Impossible de récupérer les données des emprunts.</p>";
		return [];
	}
}

// Initialiser l'affichage des emprunts
async function init() {
	try {
		const allLoans = await getLoans();
		allLoans.forEach((loan) => {
			const cardLoan = document.createElement("div");
			cardLoan.classList.add("loan-card");
			cardLoan.setAttribute("data-loan-id", loan.id);
			const content = `
				<div class="loan-header">
					<h3>Livre ID: ${loan.book_id}</h3>
				</div>
				<span class="delete-loan-button">X</span>
				<div class="loan-info">
					<p><strong>Emprunteur:</strong> ${loan.borrower_name}</p>
					<p><strong>Date d'emprunt:</strong> ${loan.borrowed_date}</p>
					<p><strong>Date de retour:</strong> ${
						loan.return_date ? loan.return_date : "Non retourné"
					}</p>
				</div>
			`;
			cardLoan.innerHTML = content;
			loansContainer.appendChild(cardLoan);
		});
	} catch (error) {
		console.error("Erreur d'initialisation", error);
	}
}

// Initialiser l'affichage des emprunts
init();
