const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");

usernameInput.addEventListener("focus", () => {
  usernameInput.removeAttribute("placeholder");
});

usernameInput.addEventListener("blur", () => {
  if (!usernameInput.value) {
    usernameInput.setAttribute("placeholder", "Usuário");
  }
});

passwordInput.addEventListener("focus", () => {
  passwordInput.removeAttribute("placeholder");
});

passwordInput.addEventListener("blur", () => {
  if (!passwordInput.value) {
    passwordInput.setAttribute("placeholder", "Senha");
  }
});

usernameInput.addEventListener("focus", () => {
  usernameInput.classList.add("blinking");
});

usernameInput.addEventListener("blur", () => {
  usernameInput.classList.remove("blinking");
});

passwordInput.addEventListener("focus", () => {
  passwordInput.classList.add("blinking");
});

passwordInput.addEventListener("blur", () => {
  passwordInput.classList.remove("blinking");
});

const h2Element = document.querySelector("span");

usernameInput.addEventListener("focus", () => {
  h2Element.style.color = "#0077cc";
});

usernameInput.addEventListener("blur", () => {
  h2Element.style.color = "";
});

passwordInput.addEventListener("focus", () => {
  h2Element.style.color = "#0077cc";
});

passwordInput.addEventListener("blur", () => {
  h2Element.style.color = "";
});

const form = document.querySelector("form");
const loginBtn = document.querySelector("#login-btn");

const users = [
  { username: "Gui", password: "Marx", nome: "Guilherme Marques"},
  { username: "Tayna", password: "060623", nome: "Tayná" },

  // adicionar mais usuários
];



// Função para criar uma chave única com base no nome de usuário
function getStorageKey(username, key) {
  return `${username}_${key}`;
}


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = form.username.value.trim();
  const password = form.password.value.trim();

  let authenticated = false;
  let loggedInUser = null;

  for (let user of users) {
    if (user.username === username && user.password === password) {
      authenticated = true;
      loggedInUser = user;
      break;
    }
  }

  if (authenticated) {
    document.body.classList.add("blur");
    setTimeout(function() {
      window.location.href = "maxtv.html";
    }, 500);

    sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
  } else if (username === "" || password === "") {
    alert("Por favor, insira um nome de usuário e senha");
  } else {
    alert("Usuário ou senha incorretos");
    form.reset();
  }
});