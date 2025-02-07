document.addEventListener("DOMContentLoaded", () => {
    loadClients();
    setupFilters();
});

const form = document.getElementById("clientForm");
const clientTable = document.getElementById("clientTable");
const searchInput = document.getElementById("search");
const API_URL = "https://66d39f5c184dce1713d09736.mockapi.io/Api/v1/clientes";
let clients = [];
let editingIndex = null;

// Carrega os clientes da API
async function loadClients() {
    try {
        const response = await fetch(API_URL);
        clients = await response.json();
        renderClients(clients);
    } catch (error) {
        console.error("Erro ao carregar os clientes:", error);
    }
}



// Renderiza a tabela com os clientes filtrados
function renderClients(filteredClients) {
    clientTable.innerHTML = "";
    filteredClients.forEach((client, index) => {
        const now = new Date();
        const dueDate = new Date(client.vencimento);
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        const highlightClass = diffDays <= 3 ? "expiring" : "";

        const formattedDate = formatDate(client.vencimento);


        // Mensagem de aviso de vencimento
        const dueMessage = `Olá ${client.cliente}, tudo bem ?\n\n🚨\n Evite bloqueio automático! \n\n 📅\nSeu plano vence em ${formattedDate}. \n\n 💳\n Faça o Pix no valor de R$${client.valor}  para \n11915370708 \n\n Nos envie o comprovante, e continue assistindo sem interrupções.`;

        clientTable.innerHTML += `<tr class="${highlightClass}">
            <td>${client.cliente}</td>
            <td>${formattedDate}</td>
            <td>${client.tela}</td>
            <td>${client.desconto}%</td>
            <td>R$ ${client.valor}</td>
            <td>${client.whats}</td>
            <td>${client.painel}</td>
            <td>${client.mac}</td>
            <td>${client.observacoes}</td>
      <td>
    <div class="actions">
        <button onclick="openModal(${index})">📝 Editar</button>
        <button onclick="deleteClient(${index})">🗑️ Excluir</button>
        <a href="https://wa.me/55${client.whats}" target="_blank">📲 WhatsApp</a>
        <a href="#" onclick="renewClient(${index})">🔄 Renovar</a>
        ${diffDays <= 3 ? `<a href="https://wa.me/55${client.whats}?text=${encodeURIComponent(dueMessage)}" target="_blank" style="color:red;">
            ⚠️ VENCIMENTO </a>` : ""}
    </div>
</td>
        </tr>`;
    });
}



// Formatação de data
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Configuração da busca
function setupFilters() {
    searchInput.addEventListener("input", applyFilters);
}

// Aplica o filtro de busca
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredClients = clients.filter(client =>
        client.cliente.toLowerCase().includes(searchTerm) ||
        client.whats.toLowerCase().includes(searchTerm) ||
        client.painel.toLowerCase().includes(searchTerm)
    );
    renderClients(filteredClients);
}

// Ordena os clientes
function sortClients(criteria) {
    if (criteria === "nameAsc") {
        clients.sort((a, b) => a.cliente.localeCompare(b.cliente));
    } else if (criteria === "nameDesc") {
        clients.sort((a, b) => b.cliente.localeCompare(a.cliente));
    } else if (criteria === "dateAsc") {
        clients.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));
    } else if (criteria === "dateDesc") {
        clients.sort((a, b) => new Date(b.vencimento) - new Date(a.vencimento));
    }
    renderClients(clients);
}

// Abre o modal de edição ou criação
function openModal(index = null) {
    editingIndex = index;
    if (index !== null) {
        const client = clients[index];
        document.getElementById("cliente").value = client.cliente;
        document.getElementById("vencimento").value = client.vencimento;
        document.getElementById("tela").value = client.tela;
        document.getElementById("desconto").value = client.desconto;
        document.getElementById("valor").value = client.valor;
        document.getElementById("whats").value = client.whats;
        document.getElementById("painel").value = client.painel;
        document.getElementById("mac").value = client.mac;
        document.getElementById("observacoes").value = client.observacoes;
    } else {
        form.reset();
    }
    document.getElementById("modal").style.display = "flex";
}

// Fecha o modal
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Salva ou atualiza o cliente
form.addEventListener("submit", async function (e) {
    e.preventDefault();
    await saveClient();
    closeModal();
});

async function saveClient() {
    const client = {
        cliente: document.getElementById("cliente").value,
        vencimento: document.getElementById("vencimento").value,
        tela: document.getElementById("tela").value,
        desconto: parseFloat(document.getElementById("desconto").value) || 0,
        valor: (parseFloat(document.getElementById("valor").value) * (1 - (document.getElementById("desconto").value / 100))).toFixed(2),
        whats: document.getElementById("whats").value,
        painel: document.getElementById("painel").value,
        mac: document.getElementById("mac").value,
        observacoes: document.getElementById("observacoes").value
    };

    try {
        if (editingIndex !== null) {
            const clientId = clients[editingIndex].id;
            await fetch(`${API_URL}/${clientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(client)
            });
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(client)
            });
        }
        loadClients();
    } catch (error) {
        console.error('Erro ao salvar o cliente:', error);
    }
}

// Deleta um cliente
async function deleteClient(index) {
	const confirmDelete = confirm("Tem certeza que deseja excluir? A exclusão será permanente!");
	if (confirmDelete) {
		const clientId = clients[index].id;
		try {
			await fetch(`${API_URL}/${clientId}`, { method: 'DELETE' });
			loadClients(); // Atualiza a lista de clientes após a exclusão
		} catch (error) {
			console.error("Erro ao excluir o cliente:", error);
		}
	}
}

// Função de Renovação corrigida
async function renewClient(index) {
    const client = clients[index];

    let daysToAdd = prompt("Quantos dias deseja adicionar à renovação?", "30");
    daysToAdd = parseInt(daysToAdd);
    if (isNaN(daysToAdd) || daysToAdd <= 0) {
        alert("Por favor, insira um número válido de dias.");
        return;
    }

    let currentDate = new Date(client.vencimento);
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    client.vencimento = currentDate.toISOString().split("T")[0];

    try {
        await fetch(`${API_URL}/${client.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client)
        });

        loadClients();

        const formattedDate = formatDate(client.vencimento);
        
        // Mensagem com quebras de linha corretas
        const renewalMessage = `Olá ${client.cliente}!\n\n✅ Seu plano foi renovado com sucesso!\n\n📅 *Próximo vencimento: ${formattedDate}.*`;

        // Codifica a mensagem para ser enviada corretamente no WhatsApp
        const whatsappURL = `https://wa.me/55${client.whats}?text=${encodeURIComponent(renewalMessage)}`;

        window.open(whatsappURL, "_blank");
    } catch (error) {
        console.error("Erro ao renovar o cliente:", error);
        alert("Ocorreu um erro ao renovar o cliente. Tente novamente.");
    }
}

const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// Função para alternar entre os temas
function toggleTheme() {
    if (body.classList.contains("light-theme")) {
        body.classList.remove("light-theme");
        themeToggle.textContent = "🌙"; // Ícone de lua
        localStorage.setItem("theme", "dark");
    } else {
        body.classList.add("light-theme");
        themeToggle.textContent = "☀️"; // Ícone de sol
        localStorage.setItem("theme", "light");
    }
}

// Aplicar tema salvo no localStorage
if (localStorage.getItem("theme") === "light") {
    body.classList.add("light-theme");
    themeToggle.textContent = "☀️";
}

// Evento de clique no botão
themeToggle.addEventListener("click", toggleTheme);

const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));


// Verificar Login
  if (loggedInUser) {
   
          document.body.classList.add("blur-effect");

  } else {
   alert("Voce precisa estar logado.");
   window.location.href = "index.html";
  }
  
  function handleLogout() { 
     window.location.href = "./index.html";
   } 