import axios from 'axios';
import { getToken } from '../Salida/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class UsuariosService {
    async getUserDetails(userId) {
        try {
            const response = await axios.get(`${API_URL}/api/usuarios/usuario/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
                            console.log(response)
   console.log(response.data)
            return response.data;
        } catch (error) {
            console.error('Error al obtener detalles del usuario:', error);
            throw error;
        }
    }
}

export default new UsuariosService(); 