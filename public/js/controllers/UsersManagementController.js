class UsersManagementController {
    constructor() {
        this.users = [];
        this.editingUser = null;
        this.currentUserRole = null;
    }

    async init() {
        await this.loadCurrentUserRole();
        await this.loadUsers();
    }

    async loadCurrentUserRole() {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const user = await response.json();
            this.currentUserRole = user.role;
        } catch (error) {
            console.error('Erro ao carregar role do usuário:', error);
        }
    }

    async loadUsers() {
        loading.show();
        try {
            this.users = await userService.getAll();
            this.renderUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            loading.hide();
        }
    }

    renderUsers() {
        this.renderTable();
        this.renderCards();
    }

    renderTable() {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.users.forEach(user => {
            const row = document.createElement('tr');
            const statusClass = user.ativo ? 'status-active' : 'status-inactive';
            const statusText = user.ativo ? 'Ativo' : 'Inativo';
            
            let roleBadge = '';
            if (user.role === 'admin') {
                roleBadge = '<span class="role-badge role-admin">👑 Admin</span>';
            } else if (user.role === 'gerente') {
                roleBadge = '<span class="role-badge role-gerente">⭐ Gerente</span>';
            } else {
                roleBadge = '<span class="role-badge role-editor">✏️ Editor</span>';
            }

            const createdDate = new Date(user.criado_em).toLocaleDateString('pt-BR');

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${roleBadge}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${createdDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-edit" onclick="window.usersManagementController.editUser(${user.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="action-btn action-btn-delete" onclick="window.app.openDeleteModal('user', ${user.id}, '${user.nome.replace(/'/g, "\\'")}')" title="Deletar">
                            🗑️
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    renderCards() {
        const cardsContainer = document.getElementById('usersCards');
        if (!cardsContainer) return;

        cardsContainer.innerHTML = '';

        this.users.forEach(user => {
            const statusClass = user.ativo ? 'status-active' : 'status-inactive';
            const statusText = user.ativo ? 'Ativo' : 'Inativo';
            
            let roleText = '';
            let roleIcon = '';
            if (user.role === 'admin') {
                roleText = 'Admin';
                roleIcon = '👑';
            } else if (user.role === 'gerente') {
                roleText = 'Gerente';
                roleIcon = '⭐';
            } else {
                roleText = 'Editor';
                roleIcon = '✏️';
            }

            const createdDate = new Date(user.criado_em).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="user-card-header">
                    <div class="user-card-info">
                        <div class="user-card-name">${user.nome}</div>
                        <div class="user-card-email">${user.email}</div>
                    </div>
                    <div class="user-card-id">#${user.id}</div>
                </div>
                <div class="user-card-body">
                    <div class="user-card-field">
                        <div class="user-card-label">Role</div>
                        <div class="user-card-value">${roleIcon} ${roleText}</div>
                    </div>
                    <div class="user-card-field">
                        <div class="user-card-label">Status</div>
                        <div class="user-card-value">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    <div class="user-card-field">
                        <div class="user-card-label">Criado em</div>
                        <div class="user-card-value">${createdDate}</div>
                    </div>
                </div>
                <div class="user-card-actions">
                    <button class="action-btn action-btn-edit" onclick="window.usersManagementController.editUser(${user.id})">
                        ✏️ Editar
                    </button>
                    <button class="action-btn action-btn-delete" onclick="window.app.openDeleteModal('user', ${user.id}, '${user.nome.replace(/'/g, "\\'")}')">
                        🗑️ Deletar
                    </button>
                </div>
            `;

            cardsContainer.appendChild(card);
        });
    }

    openAddUserModal() {
        this.editingUser = null;
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        const title = document.getElementById('userModalTitle');

        if (title) title.textContent = 'Adicionar Usuário';
        if (form) form.reset();

        const userId = document.getElementById('userId');
        const userAtivo = document.getElementById('userAtivo');
        if (userId) userId.value = '';
        if (userAtivo) userAtivo.checked = true;

        const senhaField = document.getElementById('senhaField');
        if (senhaField) senhaField.style.display = 'block';

        // Ajustar opções de role baseado no usuário atual
        this.updateRoleOptions();

        if (modal) modal.classList.add('active');
    }

    updateRoleOptions() {
        const roleSelect = document.getElementById('userRole');
        if (!roleSelect) return;

        // Se for gerente, remover opção admin
        if (this.currentUserRole === 'gerente') {
            const options = roleSelect.querySelectorAll('option');
            options.forEach(option => {
                if (option.value === 'admin') {
                    option.style.display = 'none';
                    option.disabled = true;
                }
            });
        }
    }

    async editUser(id) {
        try {
            const user = await userService.getById(id);
            if (!user) {
                toast.error('Usuário não encontrado');
                return;
            }

            this.editingUser = user;
            const modal = document.getElementById('userModal');
            const form = document.getElementById('userForm');
            const title = document.getElementById('userModalTitle');

            if (title) title.textContent = 'Editar Usuário';

            document.getElementById('userId').value = user.id;
            document.getElementById('userNome').value = user.nome;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userAtivo').checked = user.ativo;

            const senhaField = document.getElementById('senhaField');
            if (senhaField) senhaField.style.display = 'none';

            // Ajustar opções de role baseado no usuário atual
            this.updateRoleOptions();

            if (modal) modal.classList.add('active');
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            toast.error('Erro ao carregar dados do usuário');
            toast.error('Erro ao carregar usuário');
        }
    }

    closeUserModal() {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
        this.editingUser = null;
    }

    async handleUserSubmit(formData) {
        loading.show();
        try {
            const userId = formData.get('userId');
            const userData = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                role: formData.get('role'),
                ativo: formData.get('ativo') === '1'
            };

            if (!userId) {
                userData.senha = formData.get('senha');
            } else if (formData.get('senha')) {
                userData.senha = formData.get('senha');
            }

            const result = userId 
                ? await userService.update(userId, userData)
                : await userService.create(userData);

            if (result.success) {
                toast.success(userId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
                this.closeUserModal();
                await this.loadUsers();
            } else {
                toast.error(result.error || 'Erro ao salvar usuário');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error('Erro ao salvar usuário');
        } finally {
            loading.hide();
        }
    }

    async deleteUser(id) {
        loading.show();
        try {
            const result = await userService.delete(id);
            if (result.success) {
                toast.success('Usuário deletado com sucesso!');
                await this.loadUsers();
            } else {
                toast.error(result.error || 'Erro ao deletar usuário');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Erro ao deletar usuário');
        } finally {
            loading.hide();
        }
    }
}

const usersManagementController = new UsersManagementController();
window.usersManagementController = usersManagementController;
