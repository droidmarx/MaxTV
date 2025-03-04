document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("login-form");
	const errorMsg = document.querySelector(".error-message");
	const successAudio = document.getElementById("success-audio");
	const errorAudio = document.getElementById("error-audio");
	
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		
		const username = document.getElementById("username").value.trim();
		const password = document.getElementById("password").value.trim();
		
		try {
			// Faz a requisição para buscar usuários cadastrados no mockAPI.io
			const response = await fetch("https://66d39f5c184dce1713d09736.mockapi.io/Api/v1/paineis");
			const users = await response.json();
			
			// Verifica se o usuário e senha correspondem a algum registro
			const authenticatedUser = users.find(user => user.username === username && user.password === password);
			
			if (authenticatedUser) {
				successAudio.play();
				
				let container = document.querySelector(".container");
				container.style.transition = "transform 1.2s ease-in-out, filter 1.2s ease-in-out";
				container.style.transform = "scale(10)";
				container.style.filter = "blur(20px)";
				
				setTimeout(() => {
					window.location.href = "maxtv.html";
				}, 1200);
				
				// Gera um token aleatório e armazena no localStorage
				let token = Math.random().toString(16).substr(2) + Math.random().toString(16).substr(2);
				localStorage.setItem("token", token);
				
				// Salva os dados do usuário autenticado na sessionStorage
				sessionStorage.setItem("loggedInUser", JSON.stringify(authenticatedUser));
			} else {
				errorMsg.style.opacity = "1";
				errorAudio.play();
				setTimeout(() => {
					errorMsg.style.opacity = "0";
				}, 2000);
			}
		} catch (error) {
			console.error("Erro ao buscar usuários:", error);
			errorMsg.textContent = "Erro ao conectar ao servidor.";
			errorMsg.style.opacity = "1";
			errorAudio.play();
		}
		
		form.reset();
	});
	
	// --- Exibição da senha com ícone de olho ---
	const passwordInput = document.getElementById("password");
	const eyeIcon = document.getElementById("eye-icon");
	const togglePassword = document.querySelector(".toggle-password");
	
	// Oculta o ícone no início
	togglePassword.style.display = "none";
	
	// Mostra o ícone apenas quando houver algo digitado
	passwordInput.addEventListener("input", () => {
		togglePassword.style.display = passwordInput.value.length > 0 ? "block" : "none";
	});
	
	// Alterna a visibilidade da senha ao clicar no ícone
	eyeIcon.addEventListener("click", () => {
		if (passwordInput.type === "password") {
			passwordInput.type = "text";
			eyeIcon.src = "https://img.icons8.com/?size=128&id=3seXONfwoB83&format=png";
		} else {
			passwordInput.type = "password";
			eyeIcon.src = "https://img.icons8.com/?size=128&id=0R7F3PxtxHVm&format=png";
		}
	});
});