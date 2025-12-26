// Serviço de Categorias
import storage from './StorageService.js';

class CategoryService {
    constructor() {
        this.baseURL = '/api/categorias';
    }

    async request(endpoint, options = {}) {
        const token = storage.getToken();
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        return fetch(this.baseURL + endpoint, config);
    }

    async getAll() {
        const response = await this.request('/all', { method: 'GET' });
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async getActive() {
        const response = await fetch(this.baseURL, { method: 'GET' });
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

    async create(data) {
        const response = await this.request('', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        return {
            success: response.ok,
            data: response.ok ? await response.json() : null,
            error: !response.ok ? (await response.json()).error : null
        };
    }

    async update(id, data) {
        const response = await this.request(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
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

    async reorder(categorias) {
        const response = await this.request('/reorder', {
            method: 'POST',
            body: JSON.stringify({ categorias })
        });
        return response.ok;
    }
}

export default new CategoryService();
