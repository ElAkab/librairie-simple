const API_URL =
	window.location.hostname === "localhost"
		? "http://localhost:3000"
		: "https://ton-backend.railway.app";

export default API_URL;
