const axios = require('axios');

const WOMPI_API_URL = 'https://sandbox.wompi.co/v1';
const PUBLIC_KEY = 'pub_test_X3e7kT0MgwRZBFEK6TqYV2QbcJ3v9ICh';
const PRIVATE_KEY = 'prv_test_TyyIiZlTy6i7TgOB0kPpLGxc6705ROx8';

const WompiService = {
    // Obtener lista de bancos PSE
    obtenerBancosPSE: async () => {
        try {
            const response = await axios.get(`${WOMPI_API_URL}/pse/financial_institutions`, {
                headers: {
                    'Authorization': `Bearer ${PUBLIC_KEY}`
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener bancos PSE:', error);
            throw error;
        }
    },

    // Crear una transacción PSE
    crearTransaccionPSE: async (datosPago) => {
        try {
            const payload = {
                payment_method_type: "PSE",
                payment_method: {
                    type: "PSE",
                    user_type: datosPago.tipoPersona === 'natural' ? 0 : 1,
                    user_legal_id_type: datosPago.tipoDocumento,
                    user_legal_id: datosPago.numeroDocumento,
                    financial_institution_code: datosPago.codigoBanco,
                    payment_description: `Pago ManchasYPecas ${datosPago.referencia}`
                },
                amount_in_cents: Math.round(datosPago.monto * 100),
                currency: "COP",
                reference: datosPago.referencia,
                customer_email: datosPago.email,
                redirect_url: `${process.env.FRONTEND_URL}/resultado-pago/${datosPago.referencia}`,
                customer_data: {
                    phone_number: datosPago.telefono,
                    full_name: datosPago.nombreCompleto
                }
            };

            const response = await axios.post(`${WOMPI_API_URL}/transactions`, payload, {
                headers: {
                    'Authorization': `Bearer ${PRIVATE_KEY}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error al crear transacción PSE:', error);
            throw error;
        }
    },

    // Consultar estado de una transacción
    consultarTransaccion: async (referencia) => {
        try {
            const response = await axios.get(`${WOMPI_API_URL}/transactions/reference/${referencia}`, {
                headers: {
                    'Authorization': `Bearer ${PRIVATE_KEY}`
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error al consultar transacción:', error);
            throw error;
        }
    }
};

module.exports = WompiService; 