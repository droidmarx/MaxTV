document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("login-form");
	const errorMsg = document.querySelector(".error-message");
	const successAudio = document.getElementById("success-audio");
	const errorAudio = document.getElementById("error-audio");
	
	const users = [
		{ username: "Gui", password: "Marx", nome: "Guilherme Marques" },
		{ username: "Tayna", password: "060623", nome: "Tayna Ortiz" }
	];
	
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		
		const username = document.getElementById("username").value.trim();
		const password = document.getElementById("password").value.trim();
		
		const authenticatedUser = users.find(user => user.username === username && user.password === password);
		
	if (authenticatedUser) {
    successAudio.play();

    let container = document.querySelector(".container");
    
    // Adiciona a animação de escala e blur
    container.style.transition = "transform 1.2s ease-in-out, filter 1.2s ease-in-out";
    container.style.transform = "scale(10)";
    container.style.filter = "blur(20px)"; // Adiciona o efeito de desfoque
    
    setTimeout(() => {
        window.location.href = "maxtv.html";
    }, 1200);
    
    let token = Math.random().toString(16).substr(2) + Math.random().toString(16).substr(2);
    localStorage.setItem("token", token);
    
    sessionStorage.setItem("loggedInUser", JSON.stringify(authenticatedUser));
} else {
			errorMsg.style.opacity = "1";
			errorAudio.play();
			setTimeout(() => {
				errorMsg.style.opacity = "0";
			}, 2000);
		}
		
		form.reset();
	});
});

document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eye-icon");
    const togglePassword = document.querySelector(".toggle-password");

    // Oculta o ícone no início
    togglePassword.style.display = "none";

    // Mostra o ícone apenas quando houver algo digitado
    passwordInput.addEventListener("input", () => {
        if (passwordInput.value.length > 0) {
            togglePassword.style.display = "block";
        } else {
            togglePassword.style.display = "none";
        }
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