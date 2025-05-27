// services/comprasService.js (o .ts)

import axios from 'axios';

// Asegúrate que la ruta base en tu .env sea correcta y que la ruta '/api/compras' coincida con tu backend
const apiUrl = `${process.env.REACT_APP_API_URL}/api/compras/compras`;

const getToken = () => {
  // Obtener el token del localStorage (o de donde lo almacenes)
  return localStorage.getItem('token');
};

const ComprasService = {
  /**
   * Crea una nueva compra con sus detalles.
   * @param {object} compraData - Datos de la compra, incluyendo id_proveedor y array de detalles.
   * Ejemplo: { id_proveedor: 1, numero_referencia: 'F-123', detalles: [{ id_producto: 3, cantidad: 10, precio_costo_unitario: 5000, margen_aplicado: 15 }] }
   * @returns {Promise<object>} La respuesta del backend, usualmente { ok: true, msg: '...', compra: {...} }.
   */
  createCompra: async (compraData) => {
    try {
      const response = await axios.post(apiUrl, compraData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      // Devuelve directamente la data que incluye { ok, msg, compra }
      return response.data;
    } catch (error) {
      console.error('Error al crear la compra:', error.response?.data || error.message);
      // Lanza un error con el mensaje del backend si está disponible, o un mensaje genérico
      throw new Error(error.response?.data?.msg || `Error al crear la compra: ${error.message}`);
    }
  },

  /**
   * Obtiene todas las compras registradas, incluyendo detalles básicos anidados.
   * @returns {Promise<object>} La respuesta del backend, usualmente { ok: true, total: N, compras: [...] }.
   */
  getAllCompras: async () => {
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
       // Devuelve directamente la data que incluye { ok, total, compras }
      return response.data;
    } catch (error) {
      console.error('Error al obtener las compras:', error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || `Error al obtener las compras: ${error.message}`);
    }
  },

  /**
   * Obtiene una compra específica por su ID, incluyendo detalles completos anidados.
   * @param {number|string} id - El ID de la compra a obtener.
   * @returns {Promise<object>} La respuesta del backend, usualmente { ok: true, compra: {...} }.
   */
  getCompraById: async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
       // Devuelve directamente la data que incluye { ok, compra }
      return response.data;
    } catch (error) {
      console.error('Error al obtener la compra por ID:', error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || `Error al obtener la compra por ID: ${error.message}`);
    }
  },

  /**
   * (Opcional) Actualiza el estado de una compra específica.
   * @param {number|string} id - El ID de la compra a actualizar.
   * @param {string} nuevoEstado - El nuevo estado ('Pendiente', 'Recibida', 'Cancelada').
   * @returns {Promise<object>} La respuesta del backend, usualmente { ok: true, msg: '...', compra: {...} }.
   */
  updateCompraEstado: async (id, nuevoEstado) => {
    // Asegúrate que la ruta coincida con tu backend (ej: '/api/compras/:id/estado')
    const updateUrl = `${apiUrl}/${id}/estado`;
    try {
      const response = await axios.put(updateUrl, { estado_compra: nuevoEstado }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el estado de la compra:', error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || `Error al actualizar el estado de la compra: ${error.message}`);
    }
  },

  /**
   * (Opcional y PELIGROSO) Elimina una compra específica.
   * ¡Usar con extrema precaución! Generalmente es mejor cambiar el estado a 'Cancelada'.
   * @param {number|string} id - El ID de la compra a eliminar.
   * @returns {Promise<object>} La respuesta del backend, usualmente { ok: true, msg: '...' }.
   */
  deleteCompra: async (id) => {
    try {
      // ADVERTENCIA: Esta operación usualmente no revierte el stock automáticamente.
      console.warn(`Intentando eliminar permanentemente la compra con ID: ${id}. ¡Esta acción puede ser irreversible y no revierte stock!`);
      const response = await axios.delete(`${apiUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar la compra:', error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || `Error al eliminar la compra: ${error.message}`);
    }
  },

    /**
     * Actualiza los datos de la cabecera de una compra específica.
     * @param {number|string} id - El ID de la compra a actualizar.
     * @param {object} updatedData - Objeto con los campos a actualizar (ej: { id_proveedor, numero_referencia, estado_compra, monto_pagado }).
     * @returns {Promise<object>} La respuesta del backend.
     */
    updateCompra: async (id, updatedData) => {
        try {
            const response = await axios.put(`${apiUrl}/${id}`, updatedData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data; // Asume que el backend devuelve { ok: true, msg: '...', compra: {...} } o similar
        } catch (error) {
            console.error('Error al actualizar la compra:', error.response?.data || error.message);
            throw new Error(error.response?.data?.msg || `Error al actualizar la compra: ${error.message}`);
        }
    },
};

export default ComprasService;