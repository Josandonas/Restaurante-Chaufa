class UserService {
    constructor() {
        this.baseUrl = '/api/usuarios';
    }

    async getAll() {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await fetch(this.baseUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Erro ao buscar usuários');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await fetch(`${this.baseUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Erro ao buscar usuário');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async create(userData) {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { success: false, error: data.error || 'Erro ao criar usuário' };
            }
            
            return { success: true, ...data };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: 'Erro ao criar usuário' };
        }
    }

    async update(id, userData) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { success: false, error: data.error || 'Erro ao atualizar usuário' };
            }
            
            return { success: true, ...data };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: 'Erro ao atualizar usuário' };
        }
    }

    async delete(id) {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const data = await response.json();
                return { success: false, error: data.error || 'Erro ao deletar usuário' };
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: 'Erro ao deletar usuário' };
        }
    }
}

const userService = new UserService();
