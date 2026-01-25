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

if (span && isLoggedIn) {
	span.textContent = username
		? `Ta gueule ${username} !`
		: "Donc faudrait la fermer un moment..";
}

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
		...(filter && { searched: filter }),
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
		.getElementsByClassName("borrower-name")
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

			// Retirer la carte de l'interface
			loanCard.remove();

			console.log("Emprunt supprimé, ID:", loanId);
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
		const returnDateInput = document.getElementById("return-date");
		returnDateInput.value = loan.return_date
			? loan.return_date.split("T")[0]
			: "";

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

	const dateInput = document.getElementById("return-date").value;

	const returnDateISO = dateInput
		? new Date(`${dateInput}T00:00:00.000Z`).toISOString()
		: null;

	const formData = {
		status: document.getElementById("edit-loan-status").value,
		borrower_name: document.getElementById("borrower-name").value,
		return_date: returnDateISO,
	};

	console.log("Données envoyées :", formData); // 👈 DEBUG UTILE

	try {
		const req = await fetch(`${API_URL}/api/loans/${loanId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formData),
		});

		if (!req.ok) throw new Error("Erreur lors de la mise à jour");

		const result = await req.json();

		window.location.reload();

		modal.close();
	} catch (error) {
		console.error("Erreur:", error);
		alert("Impossible de mettre à jour l'emprunt");
	}
});

// ======== Initialisation ========
paginationInstance = new Pagination(fetchLoans, renderLoans);
