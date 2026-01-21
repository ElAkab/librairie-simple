const API_URL =
	window.location.hostname === "localhost"
		? "http://localhost:3000"
		: "https://librairie-simple-production-6ca3.up.railway.app";

export default API_URL;
