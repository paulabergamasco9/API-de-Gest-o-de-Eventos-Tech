// API Base URL
const API_BASE = '/eventos';

// Elementos do DOM
const eventForm = document.getElementById('eventForm');
const formMessage = document.getElementById('formMessage');
const queryType = document.getElementById('queryType');
const queryParamsContainer = document.getElementById('queryParamsContainer');
const idInput = document.getElementById('idInput');
const filterInput = document.getElementById('filterInput');
const eventId = document.getElementById('eventId');
const filterText = document.getElementById('filterText');
const queryBtn = document.getElementById('queryBtn');
const queryResults = document.getElementById('queryResults');

// ===== FORMULÁRIO DE CADASTRO =====
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(eventForm);
    const data = {
        nome: formData.get('nome'),
        organizador: formData.get('organizador'),
        data_evento: formData.get('data_evento'),
        capacidade: parseInt(formData.get('capacidade')),
        tipo: formData.get('tipo'),
        descricao: formData.get('descricao') || null
    };

    try {
        showFormMessage('Enviando...', 'loading');

        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao cadastrar evento');
        }

        const evento = await response.json();
        showFormMessage(`Evento "${evento.nome}" cadastrado com sucesso!`, 'success');
        eventForm.reset();
    } catch (error) {
        showFormMessage(`Erro: ${error.message}`, 'error');
    }
});

// ===== CONTROLE DE TIPO DE CONSULTA =====
queryType.addEventListener('change', (e) => {
    const selectedType = e.target.value;

    // Esconder todos os inputs
    idInput.style.display = 'none';
    filterInput.style.display = 'none';

    // Mostrar input apropriado
    if (selectedType === 'getById') {
        idInput.style.display = 'flex';
    } else if (selectedType === 'getByFilter') {
        filterInput.style.display = 'flex';
    }
});

// ===== EXECUÇÃO DE CONSULTAS =====
queryBtn.addEventListener('click', async () => {
    const selectedType = queryType.value;

    try {
        queryResults.innerHTML = '<div class="message loading">Carregando...</div>';

        let url = API_BASE;

        switch (selectedType) {
            case 'getAll':
                url = API_BASE;
                break;
            case 'getById':
                const id = eventId.value.trim();
                if (!id) {
                    queryResults.innerHTML = '<div class="message error">Por favor, digite um ID</div>';
                    return;
                }
                url = `${API_BASE}/${id}`;
                break;
            case 'getByFilter':
                const filtro = filterText.value.trim();
                if (!filtro) {
                    queryResults.innerHTML = '<div class="message error">Por favor, digite um filtro</div>';
                    return;
                }
                url = `${API_BASE}/buscar?filtro=${encodeURIComponent(filtro)}`;
                break;
                        }

        const response = await fetch(url);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro na consulta');
        }

        const data = await response.json();

        // Tratar resposta (pode ser array ou objeto único)
        const eventos = Array.isArray(data) ? data : [data];

        if (eventos.length === 0) {
            queryResults.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-text">Nenhum evento encontrado</div>
                </div>
            `;
            return;
        }

        displayEvents(eventos);
    } catch (error) {
        queryResults.innerHTML = `<div class="message error">Erro: ${error.message}</div>`;
    }
});

// ===== FUNÇÃO PARA EXIBIR EVENTOS =====
function displayEvents(eventos) {
    let html = `<div class="results-title">📋 Resultados (${eventos.length})</div>`;

    eventos.forEach(evento => {
        html += `
            <div class="event-card">
                <div class="event-info">
                    <div class="event-title">${evento.nome}</div>
                    <div class="event-detail">
                        <div class="event-detail-item">
                            <span class="event-detail-label">ID</span>
                            <span class="event-detail-value">${evento.id}</span>
                        </div>
                        <div class="event-detail-item">
                            <span class="event-detail-label">Organizador</span>
                            <span class="event-detail-value">${evento.organizador}</span>
                        </div>
                        <div class="event-detail-item">
                            <span class="event-detail-label">Tipo</span>
                            <span class="event-detail-value">${evento.tipo}</span>
                        </div>
                        <div class="event-detail-item">
                            <span class="event-detail-label">Data</span>
                            <span class="event-detail-value">${formatDate(evento.data_evento)}</span>
                        </div>
                        <div class="event-detail-item">
                            <span class="event-detail-label">Capacidade</span>
                            <span class="event-detail-value">${evento.capacidade} pessoas</span>
                        </div>
                    </div>
                    ${evento.descricao ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-color); font-size: 0.95em; color: var(--text-light);">${evento.descricao}</div>` : ''}
                    <div class="event-actions">
                        <button class="btn-edit" data-event-id="${evento.id}">Editar</button>
                        <button class="btn-delete" data-event-id="${evento.id}">Deletar</button>
                    </div>
                </div>
            </div>
        `;
    });

    queryResults.innerHTML = html;
    attachEventActions();
}

// ===== FUNÇÕES AUXILIARES =====
function attachEventActions() {
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => openEditModal(button.dataset.eventId));
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', () => deleteEvent(button.dataset.eventId));
    });
}

const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editMessage = document.getElementById('editMessage');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editEventId = document.getElementById('editEventId');
const editNome = document.getElementById('editNome');
const editOrganizador = document.getElementById('editOrganizador');
const editDataEvento = document.getElementById('editDataEvento');
const editCapacidade = document.getElementById('editCapacidade');
const editTipo = document.getElementById('editTipo');
const editDescricao = document.getElementById('editDescricao');

function openEditModal(id) {
    fetch(`${API_BASE}/${id}`)
        .then(async response => {
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao carregar evento');
            }
            return response.json();
        })
        .then(evento => {
            editEventId.value = evento.id;
            editNome.value = evento.nome || '';
            editOrganizador.value = evento.organizador || '';
            editDataEvento.value = evento.data_evento ? evento.data_evento.split('T')[0] : '';
            editCapacidade.value = evento.capacidade || '';
            editTipo.value = evento.tipo || '';
            editDescricao.value = evento.descricao || '';
            showEditMessage('', '');
            editModal.classList.add('active');
        })
        .catch(error => {
            queryResults.innerHTML = `<div class="message error">Erro: ${error.message}</div>`;
        });
}

function closeEditModal() {
    editModal.classList.remove('active');
}
function showEditMessage(message, type) {
    editMessage.textContent = message;
    editMessage.className = `message ${type}`;
}

closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (event) => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = editEventId.value;
    const data = {
        nome: editNome.value,
        organizador: editOrganizador.value,
        data_evento: editDataEvento.value,
        capacidade: parseInt(editCapacidade.value, 10),
        tipo: editTipo.value,
        descricao: editDescricao.value || null
    };

    try {
        showEditMessage('Salvando...', 'loading');

        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar evento');
        }

        await response.json();
        showEditMessage('Evento atualizado com sucesso!', 'success');
        setTimeout(() => {
            closeEditModal();
            refreshCurrentQuery();
        }, 700);
    } catch (error) {
        showEditMessage(`Erro: ${error.message}`, 'error');
    }
});

async function deleteEvent(id) {
    if (!confirm('Deseja realmente deletar este evento?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao deletar evento');
        }

        await response.json();
        refreshCurrentQuery();
    } catch (error) {
        queryResults.innerHTML = `<div class="message error">Erro: ${error.message}</div>`;
    }
}

function refreshCurrentQuery() {
    queryBtn.click();
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `message ${type}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Inicializar com input oculto
idInput.style.display = 'none';
filterInput.style.display = 'none';