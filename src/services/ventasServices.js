// services/ventasServices.js
import axios from 'axios';

// URL de tu API de backend
const API_VENTAS_URL = `${process.env.REACT_APP_API_URL}/api/ventas`;

// Configuración de Wompi
const WOMPI_API_BASE_URL = process.env.REACT_APP_WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
const WOMPI_PUBLIC_KEY = process.env.REACT_APP_WOMPI_PUBLIC_KEY;
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Validar configuración al inicio
if (!WOMPI_PUBLIC_KEY) {
    console.error('ADVERTENCIA: WOMPI_PUBLIC_KEY no está configurada');
}

const VentasService = {
    /**
     * Obtiene la lista de bancos PSE desde Wompi.
     * Esto es seguro hacerlo desde el frontend usando la clave pública.
     */

    obtenerBancosPSE: async () => {
        try {
            // Primero intentamos obtener los bancos desde nuestro backend
            const token = localStorage.getItem('token');
            try {
                const backendResponse = await axios.get(`${API_BASE_URL}/api/pagos/bancos-pse`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (backendResponse.data && backendResponse.data.bancos) {
                    return {
                        success: true,
                        bancos: backendResponse.data.bancos
                    };
                }
            } catch (backendError) {
                console.log('Fallback a Wompi directo:', backendError);
            }

            // Si falla el backend, intentamos directamente con Wompi
            if (!WOMPI_PUBLIC_KEY) {
                throw new Error("Configuración de pasarela de pago incompleta.");
            }

            const response = await axios.get(`${WOMPI_API_BASE_URL}/pse/financial_institutions`, {
                headers: {
                    'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
                }
            });

            if (!response.data || !response.data.data) {
                throw new Error('Respuesta inválida del servicio de bancos');
            }

            return {
                success: true,
                bancos: response.data.data.map(banco => ({
                    financial_institution_code: banco.financial_institution_code,
                    financial_institution_name: banco.financial_institution_name
                }))
            };
        } catch (error) {
            console.error('Error al obtener la lista de bancos PSE:', error);
            throw new Error(error.response?.data?.error?.message ||
                error.response?.data?.message ||
                error.message ||
                'Error al obtener la lista de bancos.');
        }
    },

    /**
     * Consulta el estado de un pago en TU BACKEND usando la referencia interna.
     * @param {string} referencia - La referencia interna del pago.
     * @returns {Promise<object>} - La respuesta del backend con los detalles del pago.
     */
    consultarEstadoPagoPorReferencia: async (referencia) => {
        const token = localStorage.getItem('token');
        try {
            // Asegúrate que la URL es la correcta, según tu API es /api/pagos/estado/:referencia
            // o /api/pagos/resultado-pago/:referencia. Usa la que implementa la lógica
            // de devolver el objeto 'pago' completo.
            // Voy a asumir que '/api/pagos/estado/:referencia' es la que devuelve el JSON que me mostraste.
            const response = await axios.get(`${API_BASE_URL}/api/pagos/estado/${referencia}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            console.log('Respuesta del backend (VentasService):', response.data);

            // Simplemente devuelve la data del backend.
            // El backend ya debería estar enviando { success: true, pago: { ... } }
            // o { success: false, error: "mensaje" }
            return response.data;

        } catch (error) {
            console.error('Error en VentasService.consultarEstadoPagoPorReferencia:', error.response?.data || error.message || error);
            // Devuelve un objeto de error consistente si la llamada axios falla
            return {
                success: false,
                error: error.response?.data?.error || 'Error de red o al conectar con el servidor.',
                // Puedes añadir el estado original si el servidor lo envió antes del error de red
                estado: error.response?.data?.pago?.estado || error.response?.data?.estado || 'ERROR_SERVICIO'
            };
        }
    },

    // Helper para obtener mensajes según el estado
    obtenerMensajeEstado: (estado) => {
        const mensajes = {
            'PENDIENTE': 'El pago está siendo procesado. Por favor espere...',
            'APROBADO': '¡Pago exitoso! Su compra ha sido procesada.',
            'RECHAZADO': 'El pago fue rechazado por la entidad bancaria.',
            'ERROR': 'Ocurrió un error durante el procesamiento del pago.',
            'ANULADO': 'El pago fue anulado.',
        };
        return mensajes[estado] || 'Estado desconocido';
    },

    // Asegúrate de tener este método (o uno similar) si `PaymentStatusPage` lo usa
    // o si tu backend se encarga de limpiar el carrito post-pago
    // clearCart: async () => { /* Lógica para limpiar el carrito, quizás una llamada al backend o local */ },

    // ... (tus otros métodos: getVentaById, updateEstadoVenta)

    // CORRECCIÓN IMPORTANTE en iniciarPagoPSEConBackend
    iniciarPagoPSEConBackend: async (datosParaPago) => {
        try {
            const token = localStorage.getItem('token');
            const paymentDataWithRedirect = {
                ...datosParaPago,
                redirect_url: `${process.env.REACT_APP_WOMPI_REDIRECT_URL}/resultado-pago/${datosParaPago.reference}`
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/pagos/pse/iniciar`,
                paymentDataWithRedirect,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.redirect_url) {
                window.location.href = response.data.redirect_url;
            }

            return response.data;
        } catch (error) {
            console.error('Error al iniciar pago PSE:', error);
            throw error;
        }
    },
    /**
     * Crea una venta en tu base de datos (para pagos simulados o después de confirmación de Wompi).
     */
    createVenta: async (orderData) => {
        try {
            const response = await axios.post(`${API_VENTAS_URL}/ventas`, orderData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear la venta en el backend:', error.response?.data || error.message);
            throw new Error(error.response?.data?.msg || `Error al crear la venta: ${error.message}`);
        }
    },

    // Otros métodos como getVentaById, updateEstadoVenta permanecen igual si los necesitas.
    getVentaById: async (id) => {
        try {
            const response = await axios.get(`${API_VENTAS_URL}/ventas/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener la venta:', error);
            throw new Error(`Error al obtener la venta: ${error.message}`);
        }
    },

    updateEstadoVenta: async (id, estado) => {
        try {
            const response = await axios.put(`${API_VENTAS_URL}/ventas/${id}/estado`, { estado });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el estado de la venta:', error);
            throw new Error(`Error al actualizar el estado de la venta: ${error.message}`);
        }
    },

    getAllVentas: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_VENTAS_URL}/ventas`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener las ventas:', error);
            throw new Error(error.response?.data?.msg || 'Error al obtener las ventas');
        }
    }
};

export default VentasService;