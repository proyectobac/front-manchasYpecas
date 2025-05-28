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
        const token = localStorage.getItem('token'); // Asumiendo que guardas el token así
        try {
            // El endpoint puede ser genérico o específico de PSE, ajusta según tu backend
            // Ejemplo: /api/pagos/estado/:referencia o /api/pagos/pse/estado/:referencia
            const response = await axios.get(`${API_BASE_URL}/api/pagos/estado/${referencia}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }) // Enviar token si existe, algunos endpoints pueden no requerirlo
                }
            });
            return response.data; // { success: true, pago: { ... } }
        } catch (error) {
            console.error('Error al consultar estado del pago:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.error ||
                                 error.response?.data?.msg ||
                                 error.response?.data?.message ||
                                 'Error al obtener el estado del pago.';
            // Devuelve un objeto de error consistente para que el componente lo maneje
            return { success: false, error: errorMessage, pago: null };
        }
    },
    
    // Asegúrate de tener este método (o uno similar) si `PaymentStatusPage` lo usa
    // o si tu backend se encarga de limpiar el carrito post-pago
    // clearCart: async () => { /* Lógica para limpiar el carrito, quizás una llamada al backend o local */ },

    // ... (tus otros métodos: getVentaById, updateEstadoVenta)

    // CORRECCIÓN IMPORTANTE en iniciarPagoPSEConBackend
    iniciarPagoPSEConBackend: async (datosParaPago) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("Debes iniciar sesión para realizar un pago.");
        }

        try {
            console.log('Iniciando pago PSE con datos:', datosParaPago);
            
            const response = await axios.post(`${API_BASE_URL}/api/pagos/pse/iniciar`, 
                datosParaPago,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Respuesta del backend:', response.data);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Error al iniciar el pago PSE');
            }

            return response.data;
        } catch (error) {
            console.error('Error detallado:', error.response || error);
            
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.message ||
                               error.message ||
                               'Error al procesar el pago PSE.';
                               
            throw new Error(errorMessage);
        }
    },
    /**
     * Crea una venta en tu base de datos (para pagos simulados o después de confirmación de Wompi).
     */
    createVenta: async (orderData) => {
        try {
            const response = await axios.post(`${API_VENTAS_URL}/ventas`, orderData, { // Asegúrate que la URL sea /ventas
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
    }
};

export default VentasService;