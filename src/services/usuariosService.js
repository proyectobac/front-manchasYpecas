import axios from 'axios';
import { getToken } from '../Salida/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class UsuariosService {
    // Obtener todos los usuarios
    async getAllUsuarios() {
        try {
            const response = await axios.get(`${API_URL}/api/usuarios/usuario`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }

    // Obtener detalles de un usuario específico
    async getUserDetails(userId) {
        try {
            const response = await axios.get(`${API_URL}/api/usuarios/usuario/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener detalles del usuario:', error);
            throw error;
        }
    }

    // Actualizar un usuario
    async updateUsuario(userId, userData) {
        try {
            const response = await axios.put(`${API_URL}/api/usuarios/usuario/${userId}`, userData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    }

    // Eliminar un usuario
    async deleteUsuario(userId) {
        try {
            const response = await axios.delete(`${API_URL}/api/usuarios/usuario/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }

    // Crear un nuevo usuario
    async createUsuario(userData) {
        try {
            const response = await axios.post(`${API_URL}/api/usuarios`, userData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    }
}

export default new UsuariosService(); 