import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const ComprobantesService = {
    // Generar comprobante de pago
    generarComprobante: async (datosCompra) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/comprobantes`, datosCompra);
            return response.data;
        } catch (error) {
            console.error('Error al generar el comprobante:', error);
            throw error;
        }
    },

    // Obtener comprobante por ID
    obtenerComprobante: async (idComprobante) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/comprobantes/${idComprobante}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener el comprobante:', error);
            throw error;
        }
    },

    // Enviar comprobante por correo
    enviarComprobantePorCorreo: async (idComprobante, correo) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/comprobantes/${idComprobante}/enviar`, { correo });
            return response.data;
        } catch (error) {
            console.error('Error al enviar el comprobante por correo:', error);
            throw error;
        }
    }
};

export default ComprobantesService; 