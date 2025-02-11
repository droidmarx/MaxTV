const form = document.querySelector("form");

const users = [
	{ username: "Gui", password: "Marx", nome: "Guilherme Marques"},
  { username: "Tayna", password: "060623", nome: "Tayna Ortiz"},
];

form.addEventListener("submit", (e) => {
	e.preventDefault();
	
	const username = form.username.value.trim();
	const password = form.password.value.trim();
	
	let authenticatedUser = users.find(user => user.username === username && user.password === password);
	
	if (authenticatedUser) {
		var audio = document.querySelector("audio");
		audio.play();
		document.body.classList.add("blur");
		
		setTimeout(() => {
			window.location.href = "maxtv.html";
		}, 1300);
		
		let token = Math.random().toString(16).substr(2) + Math.random().toString(16).substr(2);
		localStorage.setItem("token", token);
		
		// **Armazena os dados do usuário na sessão**
		sessionStorage.setItem("loggedInUser", JSON.stringify(authenticatedUser));
		
		console.log("Usuário salvo na sessão:", authenticatedUser); // Debug
		
	} else if (username === "" || password === "") {
		alert("Por favor, insira um nome de usuário e senha");
	} else {
		let p = document.querySelector("p");
		p.style.opacity = "1";
		
		let troll = document.querySelector(".troll");
		var wou = document.getElementById("wou");
		wou.play();
		
		troll.classList.add("scale");
		setTimeout(() => {
			troll.classList.remove("scale");
		}, 1400);
		
		form.reset();
	}
});