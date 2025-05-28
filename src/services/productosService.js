// src/services/productosService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL; // http://localhost:3001
const API_PRODUCTOS_URL = `${API_BASE_URL}/api/productos/producto`; // Ruta base para CRUD de productos
// No uses /producto al final de API_PRODUCTOS_URL si tus rutas CRUD son /api/productos/:id
const API_PRODUCTOS_URL1 = `http://localhost:3001/api/imagenes/productos-imagenes`; // Ruta base para CRUD de productos

const getToken = () => {
  return localStorage.getItem('token');
};

const ProductoService = {
  // ... (tus métodos existentes: createProducto, getAllProductos (para admin), getProductoById, etc.)

  /**
   * Obtiene todos los productos agrupados por categoría desde el endpoint de imágenes.
   * Este es para la tienda del cliente.
   */
  getProductosFromImagenesByCategoria: async () => {
    try {
      // La ruta en tu backend es /api/productos/productos-imagenes
      // Asegúrate que tu Server.js monte las rutas de productos en /api/productos
      // y que dentro de productosRoutes.js tengas la ruta /productos-imagenes
      const response = await axios.get(`${API_PRODUCTOS_URL1}`, { // Ajusta la ruta completa si es necesario
        // Este endpoint podría no requerir token si es para la tienda pública,
        // pero si lo requiere, descomenta las cabeceras:
        // headers: {
        //   'Authorization': `Bearer ${getToken()}`
        // }
      });
      // La respuesta del backend es: { success: true, productos: productosPorCategoria }
      // donde productosPorCategoria es un objeto: { "SNACKS": [...], "HIGIENE": [...], ... }
      return response.data; // Debería devolver { success: true, productos: { /* objeto de categorías con arrays de productos */ } }
    } catch (error) {
      console.error('Error al obtener los productos por categoría desde imágenes:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || `Error al obtener productos por categoría: ${error.message}`);
    }
  },

  // --- MÉTODOS CRUD EXISTENTES (revisar URL base) ---
  createProducto: async (newProductoData) => { // formData, no newProducto como string
    try {
      const response = await axios.post(`${API_PRODUCTOS_URL}`, newProductoData, { // formData se envía directamente
        headers: {
          // 'Content-Type': 'multipart/form-data', // Axios lo maneja con FormData
          'Authorization': `Bearer ${getToken()}`
        }
      });
              console.log(response)

        console.log(response.data)
      return response.data;
    
    } catch (error) {
      console.error('Error al crear el producto:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || `Error al crear el producto: ${error.message}`;
      throw new Error(errorMsg);
    }
  },

  // Este podría ser para el panel de admin, si necesitas todos los productos en una lista plana
  getAllProductos: async () => {
    try {
      const response = await axios.get(`${API_PRODUCTOS_URL}`, { // Ruta para obtener todos los productos
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      // Asumimos que este endpoint devuelve { productos: [...] } o similar
      return response.data;
    } catch (error) {
      console.error('Error al obtener los productos:', error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || `Error al obtener los productos: ${error.message}`);
    }
  },

  getProductoById: async (id) => {
    try {
      const response = await axios.get(`${API_PRODUCTOS_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el producto por ID:', error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || `Error al obtener el producto por ID: ${error.message}`);
    }
  },

  updateProducto: async (id, updatedProductoData) => { // formData
    try {
      const response = await axios.put(`${API_PRODUCTOS_URL}/${id}`, updatedProductoData, { // formData
        headers: {
          // 'Content-Type': 'multipart/form-data', // Axios lo maneja con FormData
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el producto:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || `Error al actualizar el producto: ${error.message}`;
      throw new Error(errorMsg);
    }
  },
  
  // putProducto para cambiar estado (se solapa con updateProducto si solo envías 'estado')
  // Considera un endpoint específico para cambiar estado si prefieres: PATCH /api/productos/:id/estado
  // O simplemente usa updateProducto enviando solo el campo 'estado'.
  // Por ahora, asumiré que updateProducto puede manejar la actualización de estado.
  // Si tienes un putProducto específico, mantenlo:
  putProducto: async (id, estado) => { // Este método parece específico para cambiar solo el estado
    try {
      const response = await axios.put(`${API_PRODUCTOS_URL}/${id}/estado`, { estado }, { // Ejemplo de ruta específica
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar el estado del producto:', error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || `Error al cambiar el estado del producto: ${error.message}`);
    }
  },

  eliminarProducto: async (id_producto) => {
    try {
      const response = await axios.delete(`${API_PRODUCTOS_URL}/${id_producto}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar el producto:', error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || `Error al eliminar el producto: ${error.message}`);
    }
  },
};

export default ProductoService;