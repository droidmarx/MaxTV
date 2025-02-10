document.addEventListener("DOMContentLoaded", () => {
	loadClients();
	setupFilters();
	setupTheme()
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



//RENDER CLIENTES

async function fetchPaineis() {
	try {
		const response = await fetch("https://66d39f5c184dce1713d09736.mockapi.io/Api/v1/paineis"); // URL correta da MockAPI
		return await response.json();
	} catch (error) {
		console.error("Erro ao buscar painéis:", error);
		return [];
	}
}

async function renderClients(filteredClients) {
    const paineis = await fetchPaineis(); // Busca os painéis da MockAPI
    clientTable.innerHTML = "";

    filteredClients.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));

    filteredClients.forEach((client, index) => {
        const now = new Date();
        const dueDate = new Date(client.vencimento);
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        let highlightClass = diffDays <= 1 ? "expiring" : diffDays <= 3 ? "expiring" : "";
        let nameClass = diffDays <= 1 ? "highlight-name" : "";
        let iconClass = diffDays <= 1 ? "highlight-icon" : "";

        const formattedDate = formatDate(client.vencimento);
      const dueMessage = `Olá ${client.cliente}, tudo bem? 😊\n\n🚨 Para evitar qualquer interrupção no seu acesso, lembramos que seu plano vence em ${formattedDate} às 23:59.\n\n📅 Faça o pagamento de R$${client.valor} via Pix para o número 11915370708.\n\n💳 Após o pagamento, envie o comprovante e continue aproveitando sem preocupações!\n\nAgradecemos pela confiança! 💙`;

        // 🔍 Busca o painel pelo ID armazenado no cliente
        const painelEncontrado = paineis.find(p => p.id === client.painel);

        clientTable.innerHTML += `
            <tr>
                <td class="${nameClass}">${client.cliente}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="${iconClass}" data-aos="zoom-in" onclick="toggleDetails(${index})">ℹ️</button>
                </td>
            </tr>
            <tr id="details-${index}" class="hidden ${highlightClass}">
                <td colspan="3">
                    <div class="details">
                        <p><strong>Tela:</strong> ${client.tela}</p>
                        <p><strong>Desconto:</strong> ${client.desconto}%</p>
                        <p><strong>Valor:</strong> R$ ${client.valor}</p>
                        <p><strong>WhatsApp:</strong> ${client.whats}</p>
                        <p><strong>Painel:</strong> 
                            ${painelEncontrado ? `<a href="${painelEncontrado.link}" target="_blank">${painelEncontrado.nome}</a>` : "Painel não encontrado"}
                        </p>
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
	const date = new Date(dateStr + "T00:00:00"); // Garante que a data seja local
	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "America/Sao_Paulo"
	}).format(date);
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



// Salva ou atualiza o cliente
form.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    // Previne a execução múltipla
    if (isSaving) return;  // Se já estiver salvando, não permita nova execução
    
    isSaving = true; // Indica que o processo de salvamento começou


    isSaving = false; // Permite novos salvamentos após a operação

    closeModal(); // Fecha o modal após salvar
});

let isSaving = false;  // Variável de controle para impedir salvar múltiplas vezes

async function saveClient() {
    // Captura os dados do formulário
    const client = {
        cliente: document.getElementById("cliente").value,
        tela: document.getElementById("tela").value,
        desconto: parseFloat(document.getElementById("desconto").value) || 0,
        valor: parseFloat(document.getElementById("valor").value) || 0,
        whats: document.getElementById("whats").value,
        painel: document.getElementById("painel").value,
        mac: document.getElementById("mac").value,
        observacoes: document.getElementById("observacoes").value,
        vencimento: document.getElementById("vencimento").value,
    };

    // Calcula o valor com desconto
    client.valor = (client.valor * (1 - client.desconto / 100)).toFixed(2);

    // Verifica se o valor está correto
    if (isNaN(client.valor) || client.valor <= 0) {
        alert("Por favor, insira um valor válido.");
        return;
    }

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!client.cliente || !client.whats || !client.painel || !client.vencimento) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    try {
        const method = editingIndex !== null ? 'PUT' : 'POST';
        const url = editingIndex !== null ? `${API_URL}/${clients[editingIndex].id}` : API_URL;

        // Envia os dados para a API
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client)
        });

        // Atualiza a lista de clientes após salvar
        loadClients();
    } catch (error) {
        console.error('Erro ao salvar o cliente:', error);
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


        // Função para abrir e fechar o menu lateral
        function toggleMenu() {
            document.getElementById("settings-menu").classList.toggle("open");
        }

        // Evento para abrir o menu ao clicar na engrenagem
        document.getElementById("settings-toggle").addEventListener("click", toggleMenu);

        // Funções de exemplo para os botões do menu
        function acao1() {
            
document.addEventListener("DOMContentLoaded", function() {
	const themeToggle = document.getElementById("theme-toggle");
	const body = document.body;

	// Aplicar tema salvo no localStorage ao carregar a página
	function applySavedTheme() {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "light") {
			body.classList.add("light-theme");
			themeToggle.textContent = "☀️ Light Mode";
		} else {
			body.classList.remove("light-theme");
			themeToggle.textContent = "🌙 Dark Mode";
		}
	}

	// Função para alternar entre os temas
	function toggleTheme() {
		if (body.classList.contains("light-theme")) {
			body.classList.remove("light-theme");
			themeToggle.textContent = "🌙 Dark Mode";
			localStorage.setItem("theme", "dark");
		} else {
			body.classList.add("light-theme");
			themeToggle.textContent = "☀️ Light Mode";
			localStorage.setItem("theme", "light");
		}
	}

	// Aplicar tema salvo ao carregar a página
	applySavedTheme();

	// Evento de clique no botão
	themeToggle.addEventListener("click", toggleTheme);
});
            
        }

        function acao2() {
            alert("Ação 2 executada!");
        }

        function acao3() {
            alert("Ação 3 executada!");
        }


  
//MODIFICAR PAINEL CRUD          
          
          const apiURL = "https://66d39f5c184dce1713d09736.mockapi.io/Api/v1/paineis"; // Substitua pelo seu MockAPI

// Abre o modal
function openPanelManager() {
    document.getElementById('panelManagerModal').style.display = 'flex';
    fetchPanels();
}

// Fecha o modal
function closePanelManager() {
    document.getElementById('panelManagerModal').style.display = 'none';
}

// Fetch (R - READ) - Carrega os painéis na lista e no select
async function fetchPanels() {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        updatePanelList(data);
        updatePanelSelect(data);
    } catch (error) {
        console.error("Erro ao buscar painéis:", error);
    }
}

// Atualiza a lista de painéis no modal
function updatePanelList(paineis) {
    const panelList = document.getElementById('panelList');
    panelList.innerHTML = "";

    paineis.forEach(panel => {
        const li = document.createElement('li');
        li.classList.add("panel-item");
        li.innerHTML = `
            <span>${panel.nome} - <a href="${panel.link}" target="_blank">${panel.link}</a></span>
            <button onclick="editPanel('${panel.id}', '${panel.nome}', '${panel.link}')">✏️</button>
            <button onclick="deletePanel('${panel.id}')">🗑️</button>
        `;
        panelList.appendChild(li);
    });
}

// Atualiza o select de painéis no formulário de clientes
function updatePanelSelect(paineis) {
    const panelSelect = document.getElementById('painel');
    panelSelect.innerHTML = `<option value="">Selecione um painel</option>`;
    
    paineis.forEach(panel => {
        const option = document.createElement('option');
        option.value = panel.id;
        option.textContent = panel.nome;
        panelSelect.appendChild(option);
    });
}

// Create/Update (C/U - CREATE & UPDATE)
document.getElementById('panelForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('panelId').value;
    const nome = document.getElementById('panelName').value;
    const link = document.getElementById('panelLink').value;

    const panelData = { nome, link };

    try {
        if (id) {
            // Atualizar painel (U - UPDATE)
            await fetch(`${apiURL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(panelData),
            });
        } else {
            // Criar painel (C - CREATE)
            await fetch(apiURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(panelData),
            });
        }

        document.getElementById('panelForm').reset();
        fetchPanels();
    } catch (error) {
        console.error("Erro ao salvar painel:", error);
    }
});

// Editar um painel
function editPanel(id, nome, link) {
    document.getElementById('panelId').value = id;
    document.getElementById('panelName').value = nome;
    document.getElementById('panelLink').value = link;
}

// Delete (D - DELETE) - Excluir um painel
async function deletePanel(id) {
    if (confirm("Tem certeza que deseja excluir este painel?")) {
        try {
            await fetch(`${apiURL}/${id}`, {
                method: "DELETE",
            });
            fetchPanels();
        } catch (error) {
            console.error("Erro ao excluir painel:", error);
        }
    }
}

// Inicializa a lista de painéis ao carregar a página
document.addEventListener("DOMContentLoaded", fetchPanels);


// Verificar Login

const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

if (loggedInUser) {

	document.body.classList.add("blur-effect");

} else {
	alert("Voce precisa estar logado.");
	window.location.href = "index.html";
}

function handleLogout() {
	window.location.href = "./index.html";
}

   const welcomeMessage = document.querySelector("#welcome-message");
   welcomeMessage.textContent = `Bem-vindo, ${loggedInUser.nome} !`;
          document.body.classList.add("blur-effect");