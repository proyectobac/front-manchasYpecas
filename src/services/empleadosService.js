import axios from 'axios';

const apiUrl = `${process.env.REACT_APP_API_URL}/api/empleados/empleado`;

const getToken = () => {
  return localStorage.getItem('token');
};

const EmpleadoService = {
  createEmpleado: async (formData) => {
    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear el empleado:', error);
      throw new Error(`Error al crear el empleado: ${error.message}`);
    }
  },

  getAllEmpleados: async () => {
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener los empleados:', error);
      throw new Error(`Error al obtener los empleados: ${error.message}`);
    }
  },

  getEmpleadosActivos: async () => {
    try {
      const response = await axios.get(`${apiUrl}/activos`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener los empleados activos:', error);
      throw new Error(`Error al obtener los empleados activos: ${error.message}`);
    }
  },

  getEmpleadoById: async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el empleado por ID:', error);
      throw new Error(`Error al obtener el empleado por ID: ${error.message}`);
    }
  },

  updateEmpleado: async (id, updatedEmpleado) => {
    try {
      const response = await axios.put(`${apiUrl}/${id}`, updatedEmpleado, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el empleado:', error);
      throw new Error(`Error al actualizar el empleado: ${error.message}`);
    }
  },

  cambiarEstadoEmpleado: async (id) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/empleados/empleado/cambiarEstado/${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar el estado del empleado:', error);
      throw new Error(`Error al cambiar el estado del empleado: ${error.message}`);
    }
  },

  eliminarEmpleado: async (id) => {
    try {
      const response = await axios.delete(`${apiUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar el empleado:', error);
      throw new Error(`Error al eliminar el empleado: ${error.message}`);
    }
  },

  validarDocumento: async (documento) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${baseUrl}/api/empleados/validar?documento=${documento}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al validar el documento:', error);
      throw new Error(`Error al validar el documento: ${error.message}`);
    }
  }
};

export default EmpleadoService; 