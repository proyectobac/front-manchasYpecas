import axios from 'axios';
import { getToken } from '../Salida/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class RolesService {
    // Obtener todos los roles
    async getAllRoles() {
        try {
            const response = await axios.get(`${API_URL}/api/roles/rol`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener roles:', error);
            throw error;
        }
    }

    // Obtener un rol específico
    async getRolById(id) {
        try {
            const response = await axios.get(`${API_URL}/api/roles/rol/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener rol:', error);
            throw error;
        }
    }

    // Crear un nuevo rol
    async createRol(rolData) {
        try {
            const response = await axios.post(`${API_URL}/api/roles/rol`, rolData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear rol:', error);
            throw error;
        }
    }

    // Actualizar un rol existente
    async updateRol(id, rolData) {
        try {
            const response = await axios.put(`${API_URL}/api/roles/rol/${id}`, rolData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar rol:', error);
            throw error;
        }
    }

    // Eliminar un rol
    async deleteRol(id) {
        try {
            const response = await axios.delete(`${API_URL}/api/roles/rol/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al eliminar rol:', error);
            throw error;
        }
    }

    // Asignar permisos a un rol
    async updateRolPermisos(id_rol, permisos) {
        try {
            const response = await axios.post(`${API_URL}/api/roles/rol/${id_rol}/permisos`, {
                id_rol: id_rol,
                id_permisos: permisos
            }, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al asignar permisos:', error);
            throw error;
        }
    }

    // Cambiar estado de un rol
    async cambiarEstadoRol(id, estado) {
        try {
            const response = await axios.put(`${API_URL}/api/roles/rol/${id}`, {
                estado: estado
            }, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al cambiar estado del rol:', error);
            throw error;
        }
    }

    // Obtener todos los permisos disponibles
    async getAllPermisos() {
        try {
            const response = await axios.get(`${API_URL}/api/permisos/permisos/`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener permisos:', error);
            throw error;
        }
    }


}

export default new RolesService(); 