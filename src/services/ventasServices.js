import axios from 'axios';

const apiUrl = `${process.env.REACT_APP_API_URL}/api/ventas/ventas`;
const WOMPI_API = 'https://sandbox.wompi.co/v1';
const WOMPI_PUBLIC_KEY = 'pub_test_X7LuHVsGCb4g36YCS9hYhd3hCHxuhRUJ';

const VentasService = {
    obtenerBancosPSE: async () => {
        try {
            const response = await axios.get(`${WOMPI_API}/pse/financial_institutions`, {
                headers: {
                    'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener la lista de bancos:', error);
            throw new Error(`Error al obtener la lista de bancos: ${error.message}`);
        }
    },

    createVenta: async (orderData) => {
        try {
            const response = await axios.post(apiUrl, orderData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear la venta:', error.response?.data || error.message);
            throw new Error(error.response?.data?.msg || `Error al crear la venta: ${error.message}`);
        }
    },

    getVentaById: async (id) => {
        try {
            const response = await axios.get(`${apiUrl}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener la venta:', error);
            throw new Error(`Error al obtener la venta: ${error.message}`);
        }
    },

    updateEstadoVenta: async (id, estado) => {
        try {
            const response = await axios.put(`${apiUrl}/${id}/estado`, { estado });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el estado de la venta:', error);
            throw new Error(`Error al actualizar el estado de la venta: ${error.message}`);
        }
    }
};

export default VentasService; 