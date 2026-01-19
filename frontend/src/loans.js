import API_URL from "./config.js";
import Pagination from "./utils/pagination.js";

const loansContainer = document.getElementById("loans");
const applyFiltersButton = document.getElementById("apply-filters");
const searchInput = document.querySelector("input[type='search']");
const searchButton = document.querySelector(".search-bar button");
const resetSearch = document.querySelector(".reset-search");

searchButton.addEventListener("click", () => getSearchResults());

async function getSearchResults() {
	try {
		if (resetSearch) resetSearch.style.display = "flex";

		const query = searchInput.value.trim();
		searchInput.value = "";

		const response = await fetchLoans(1, query);
		renderLoans(response.data); // ✅ Extraire .data
	} catch (error) {
		console.error("Erreur lors de la recherche :", error);
		alert("Erreur lors de la recherche des emprunts");
	}
}

resetSearch.addEventListener("click", async () => {
	try {
		resetSearch.style.display = "none";

		const response = await fetchLoans(1);
		renderLoans(response.data);

		if (paginationInstance) {
			paginationInstance.resetToFirstPage();
		}
	} catch (error) {
		console.error("Erreur lors de la réinitialisation :", error);
		alert("Erreur lors de la réinitialisation de la recherche");
	}
});

// ======== Instance de pagination ========
let currentFilters = {}; // Stocker les filtres actifs

// ======== Fonctions de récupération et rendu ========
async function fetchLoans(page = 1, filter = "") {
	const params = new URLSearchParams({
		page,
		limit: 6,
		...(filter && { filtered: filter }),
	});

	const response = await fetch(`${API_URL}/api/loans?${params.toString()}`);
	if (!response.ok) throw new Error("Erreur avec l'API");
	return await response.json();
}
// ...existing code...

// ======== Initialisation ========
let paginationInstance = new Pagination(fetchLoans, renderLoans);

function renderLoans(loans) {
	loansContainer.innerHTML = "";

	if (loans.length === 0) {
		loansContainer.innerHTML = "<p class='error'>Aucun emprunt trouvé.</p>";
		return;
	}

	loans.forEach((loan) => {
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
				<p><strong>Statut:</strong> ${
					loan.loan_status === "active" ? "En cours" : "Retourné"
				}</p>
			</div>
		`;
		cardLoan.innerHTML = content;
		loansContainer.appendChild(cardLoan);
	});
}

// ======== Appliquer les filtres ========
applyFiltersButton.addEventListener("click", async (e) => {
	e.preventDefault();

	const bookName = document.getElementById("book-name-input").value.trim();
	const borrowerName = document
		.getElementById("borrower-name-input")
		.value.trim();

	// ✅ Corriger le sélecteur - utiliser querySelector pour les radio buttons
	const status =
		document.querySelector('input[name="status"]:checked')?.value || "";

	const dateFrom = document.getElementById("date-from").value;
	const dateTo = document.getElementById("date-to").value;

	// Mettre à jour les filtres actifs
	currentFilters = {};
	if (borrowerName) currentFilters.borrower_name = borrowerName;
	if (bookName) currentFilters.book_name = bookName;
	if (status) currentFilters.status = status;
	if (dateFrom) currentFilters.date_from = dateFrom;
	if (dateTo) currentFilters.date_to = dateTo;

	console.log("Filtres appliqués:", currentFilters);

	// Réinitialiser la pagination avec les nouveaux filtres
	if (paginationInstance) {
		paginationInstance.destroy();
	}
	const newPagination = new Pagination(fetchLoans, renderLoans);
});

// ======== Modale d'édition ========
const modal = document.getElementById("edit-loan-modal");
const closeModalBtn = document.getElementById("close-modal");
const editLoanForm = document.getElementById("edit-loan-form");

closeModalBtn.addEventListener("click", () => {
	modal.close();
});

// ======== Gérer les actions sur les cartes ========
loansContainer.addEventListener("click", async (e) => {
	const loanCard = e.target.closest(".loan-card");
	if (!loanCard) return;

	const loanId = loanCard.dataset.loanId;

	// Suppression
	if (e.target.classList.contains("delete-loan-button")) {
		if (!confirm("Voulez-vous vraiment supprimer cet emprunt ?")) return;

		try {
			const req = await fetch(`${API_URL}/api/loans/${loanId}`, {
				method: "DELETE",
			});
			if (!req.ok) throw new Error("Erreur lors de la suppression");

			console.log("Emprunt supprimé, ID:", loanId);

			// Recharger la page actuelle de pagination
			if (paginationInstance) {
				paginationInstance.refresh();
			}
		} catch (error) {
			console.error("Erreur:", error);
			alert("Impossible de supprimer l'emprunt");
		}
		return;
	}

	// Édition (clic sur la carte)
	try {
		const req = await fetch(`${API_URL}/api/loans/${loanId}`);
		if (!req.ok) throw new Error("Erreur lors de la récupération de l'emprunt");
		const loan = await req.json();

		document.getElementById("edit-loan-status").value =
			loan.loan_status || "active";
		document.getElementById("borrower-name").value = loan.borrower_name || "";
		document.getElementById("return-date").value = loan.return_date || "";

		editLoanForm.dataset.loanId = loanId;
		modal.showModal();
	} catch (error) {
		console.error("Erreur:", error);
		alert("Impossible de charger les données de l'emprunt");
	}
});

// ======== Soumettre le formulaire d'édition ========
editLoanForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const loanId = editLoanForm.dataset.loanId;
	const formData = {
		status: document.getElementById("edit-loan-status").value,
		borrower_name: document.getElementById("borrower-name").value,
		return_date: document.getElementById("return-date").value || null,
	};

	try {
		const req = await fetch(`${API_URL}/api/loans/${loanId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formData),
		});

		if (!req.ok) throw new Error("Erreur lors de la mise à jour");

		const result = await req.json();
		console.log("Emprunt mis à jour:", result);

		modal.close();

		// Recharger la page actuelle de pagination
		if (paginationInstance) {
			paginationInstance.refresh();
		}
	} catch (error) {
		console.error("Erreur:", error);
		alert("Impossible de mettre à jour l'emprunt");
	}
});

// ======== Initialisation ========
paginationInstance = new Pagination(fetchLoans, renderLoans);
