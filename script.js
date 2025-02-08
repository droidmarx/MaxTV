document.addEventListener("DOMContentLoaded", () => {
	loadClients();
	setupFilters();
	setupTheme();
});

// Elementos do DOM
const form = document.getElementById("clientForm");
const clientTable = document.getElementById("clientTable");
const searchInput = document.getElementById("search");
const API_URL = "https://66d39f5c184dce1713d09736.mockapi.io/Api/v1/clientes";
let clients = [];
let editingIndex = null;
let openDetail = null; // Adicionando o controle de detalhe aberto

// Carrega os clientes da API
async function loadClients() {
	try {
		const response = await fetch(API_URL);
		clients = await response.json();
		clients.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento)); // Ordena pelo vencimento mais próximo
		renderClients(clients);
	} catch (error) {
		console.error("Erro ao carregar os clientes:", error);
	}
}

// Renderiza a tabela com os clientes filtrados e ordenados
function renderClients(filteredClients) {
	clientTable.innerHTML = "";

	filteredClients.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));

	filteredClients.forEach((client, index) => {
		const now = new Date();
		const dueDate = new Date(client.vencimento);
		const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
		let highlightClass = "";
		let nameClass = "";
		let iconClass = "";

		// Verifica se o vencimento é 1 dia
		if (diffDays <= 1) {
			highlightClass = "expiring"; // Para o fundo de vencimento próximo
			nameClass = "highlight-name"; // Nome em vermelho
			iconClass = "highlight-icon"; // Ícone em vermelho
		} else if (diffDays <= 3) {
			highlightClass = "expiring"; // Para os vencimentos próximos
		}

		const formattedDate = formatDate(client.vencimento);

		const dueMessage = `Olá ${client.cliente}, tudo bem?\n\n🚨 Evite bloqueio automático!\n📅 Seu plano vence em ${formattedDate}.\n💳 Faça o Pix no valor de R$${client.valor} para 11915370708.\n\nNos envie o comprovante e continue assistindo sem interrupções.`;

		clientTable.innerHTML += `
        <tr>
            <td class="${nameClass}">${client.cliente}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="${iconClass}" onclick="toggleDetails(${index})">ℹ️</button>
            </td>
        </tr>
        <tr id="details-${index}" class="hidden ${highlightClass}">
            <td colspan="3">
                <div class="details">
                    <p><strong>Tela:</strong> ${client.tela}</p>
                    <p><strong>Desconto:</strong> ${client.desconto}%</p>
                    <p><strong>Valor:</strong> R$ ${client.valor}</p>
                    <p><strong>WhatsApp:</strong> ${client.whats}</p>
                    <p><strong>Painel:</strong> ${client.painel}</p>
                    <p><strong>MAC:</strong> ${client.mac}</p>
                    <p><strong>Observações:</strong> ${client.observacoes}</p>
                    <div class="actions">
                        <button onclick="openModal(${index})">📝 Editar</button>
                        <button onclick="deleteClient(${index})">🗑️ Excluir</button>
                        <a href="https://wa.me/55${client.whats}" target="_blank">📲 WhatsApp</a>
                        <a href="#" onclick="renewClient(${index})">🔄 Renovar</a>
                        ${diffDays <= 3 ? `<a href="https://wa.me/55${client.whats}?text=${encodeURIComponent(dueMessage)}" target="_blank" class="due-alert">
                            ⚠️ VENCIMENTO </a>` : ""}
                    </div>
                </div>
            </td>
        </tr>`;
	});
}

// Alterna a visibilidade dos detalhes (apenas um aberto por vez)
function toggleDetails(index) {
	const detailsRow = document.getElementById(`details-${index}`);

	// Fecha o detalhe anterior, se houver
	if (openDetail !== null && openDetail !== index) {
		document.getElementById(`details-${openDetail}`).classList.add("hidden");
	}

	// Alterna a visibilidade do novo detalhe
	detailsRow.classList.toggle("hidden");

	// Atualiza o detalhe aberto
	openDetail = detailsRow.classList.contains("hidden") ? null : index;
}

// Formata a data para DD/MM/AAAA
function formatDate(dateStr) {
	const date = new Date(dateStr);
	return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
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

// Abre o modal de edição ou criação
function openModal(index = null) {
	editingIndex = index;
	if (index !== null) {
		const client = clients[index];
		Object.keys(client).forEach(key => {
			const input = document.getElementById(key);
			if (input) input.value = client[key];
		});
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
form.addEventListener("submit", async function(e) {
	e.preventDefault();
	await saveClient();
	closeModal();
});

async function saveClient() {
	const client = Object.fromEntries(new FormData(form));
	client.desconto = parseFloat(client.desconto) || 0;
	client.valor = (parseFloat(client.valor) * (1 - client.desconto / 100)).toFixed(2);

	try {
		const method = editingIndex !== null ? 'PUT' : 'POST';
		const url = editingIndex !== null ? `${API_URL}/${clients[editingIndex].id}` : API_URL;

		await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(client)
		});

		loadClients();
	} catch (error) {
		console.error('Erro ao salvar o cliente:', error);
	}
}

// Deleta um cliente
async function deleteClient(index) {
	if (confirm("Tem certeza que deseja excluir? A exclusão será permanente!")) {
		try {
			await fetch(`${API_URL}/${clients[index].id}`, { method: 'DELETE' });
			loadClients();
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


// Configuração do tema
function setupTheme() {
	const themeToggle = document.getElementById("theme-toggle");
	const savedTheme = localStorage.getItem("theme");

	if (savedTheme) document.body.classList.add(savedTheme);

	themeToggle.addEventListener("click", () => {
		document.body.classList.toggle("light-theme");
		localStorage.setItem("theme", document.body.classList.contains("light-theme") ? "light" : "dark");
	});
}

// Verificação de login
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
if (!loggedInUser) {
	alert("Você precisa estar logado.");
	window.location.href = "index.html";
}

// Função de logout
function handleLogout() {
	sessionStorage.removeItem("loggedInUser");
	window.location.href = "./index.html";
}