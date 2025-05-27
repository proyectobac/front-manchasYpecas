import axios from "axios";

// Configuración de la URL base desde el entorno
const apiUrl = `${process.env.REACT_APP_API_URL}/api/proveedores/proveedores`;

// Función para obtener el token
const getToken = () => {
  return localStorage.getItem("token");
};

// Métodos del servicio
const getAll = async () => {
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error al obtener proveedores:", error.response || error.message);
    throw error;
  }
};

const get = async (id) => {
  try {
    const response = await axios.get(`${apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error(`Error al obtener proveedor con ID ${id}:`, error.response || error.message);
    throw error;
  }
};

const getProveedoresActivos = async () => {
  try {
    const response = await axios.get(`${apiUrl}/activos`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error al obtener proveedores activos:", error.response || error.message);
    throw error;
  }
};

const getProveedoresProductos = async (id) => {
  try {
    const response = await axios.get(`${apiUrl}/productos/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error(`Error al obtener productos del proveedor con ID ${id}:`, error.response || error.message);
    throw error;
  }
};

const create = async (data) => {
  try {
    const response = await axios.post(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error al crear proveedor:", error.response || error.message);
    throw error;
  }
};

const update = async (id, data) => {
  try {
    const response = await axios.put(`${apiUrl}/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error(`Error al actualizar proveedor con ID ${id}:`, error.response || error.message);
    throw error;
  }
};

const cambiarEstado = async (id_proveedor, nuevoEstado) => {
  try {
    const response = await axios.put(
      `${apiUrl}/${id_proveedor}/cambiarestado`,
      { estado: nuevoEstado },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error(`Error al cambiar estado del proveedor con ID ${id_proveedor}:`, error.response || error.message);
    throw error;
  }
};

const remove = async (id) => {
  try {
    const response = await axios.delete(`${apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error(`Error al eliminar proveedor con ID ${id}:`, error.response || error.message);
    throw error;
  }
};

const findByTitle = async (title) => {
  try {
    const response = await axios.get(`${apiUrl}?title=${title}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error(`Error al buscar proveedor por título ${title}:`, error.response || error.message);
    throw error;
  }
};

const checkExistence = async (nombre, email, num_documento) => {
  try {
    const response = await getAll();
    const proveedores = response.data.listProveedores;

    const nombreExists = proveedores.some((proveedor) => proveedor.nombre === nombre);
    const emailExists = proveedores.some((proveedor) => proveedor.email === email);
    const documentoExist = proveedores.some((proveedor) => proveedor.num_documento === num_documento);

    return { nombreExists, emailExists, documentoExist };
  } catch (error) {
    console.error("Error al verificar existencia de proveedor:", error.response || error.message);
    throw error;
  }
};

// Exportar el servicio
const ProveedoresService = {
  getAll,
  get,
  getProveedoresActivos,
  getProveedoresProductos,
  create,
  update,
  cambiarEstado,
  remove,
  findByTitle,
  checkExistence,
};

export default ProveedoresService;