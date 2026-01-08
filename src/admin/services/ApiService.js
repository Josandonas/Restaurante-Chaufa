// Serviço de API
import storage from './StorageService.js';

class ApiService {
    constructor() {
        this.baseURL = '/api';
    }

    async request(endpoint, options = {}) {
        const token = storage.getToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(this.baseURL + endpoint, config);
            
            // Parse JSON response
            const data = await response.json();
            
            // Se não for 2xx, lançar erro
            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    async upload(endpoint, formData) {
        const token = storage.getToken();
        return fetch(this.baseURL + endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
    }
}

export default new ApiService();
