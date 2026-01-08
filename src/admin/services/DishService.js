// Serviço de Pratos
import storage from './StorageService.js';

class DishService {
    constructor() {
        this.baseURL = '/api/pratos';
    }

    async request(endpoint, options = {}) {
        const token = storage.getToken();
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const config = {
            ...options,
            credentials: 'include',
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        return fetch(this.baseURL + endpoint, config);
    }

    async getAll() {
        const response = await this.request('', { method: 'GET' });
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async getById(id) {
        const response = await this.request(`/${id}`, { method: 'GET' });
        if (response.ok) {
            return await response.json();
        }
        return null;
    }

    async create(formData) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        return {
            success: response.ok,
            data: response.ok ? await response.json() : null,
            error: !response.ok ? (await response.json()).error : null
        };
    }

    async update(id, formData) {
        const response = await fetch(this.baseURL + `/${id}`, {
            method: 'PUT',
            credentials: 'include',
            body: formData
        });
        
        return {
            success: response.ok,
            data: response.ok ? await response.json() : null,
            error: !response.ok ? (await response.json()).error : null
        };
    }

    async delete(id) {
        const response = await this.request(`/${id}`, { method: 'DELETE' });
        return response.ok;
    }
}

export default new DishService();
