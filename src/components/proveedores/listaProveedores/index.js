import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaSave,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Swal from "sweetalert2";
import ProveedoresService from "../../../services/proveedoresService";

// Constantes
const ITEMS_PER_PAGE = 10;
const INITIAL_STATE = {
  proveedores: [],
  filteredProveedores: [],
  loading: true,
  error: null,
  isEditModalOpen: false,
  editingProveedor: null,
  isSaving: false,
  searchTerm: "",
  currentPage: 1,
  totalPages: 1,
};

// Componente principal
const ListaProveedores = () => {
  // Estados
  const [state, setState] = useState(INITIAL_STATE);

  // Desestructuración para facilitar acceso
  const {
    proveedores,
    filteredProveedores,
    loading,
    error,
    isEditModalOpen,
    editingProveedor,
    isSaving,
    searchTerm,
    currentPage,
    totalPages,
  } = state;

  // Cargar proveedores
  const fetchProveedores = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await ProveedoresService.getAll();
      const proveedoresList = response.data.listProveedores || [];
      setState((prev) => ({
        ...prev,
        proveedores: proveedoresList,
        filteredProveedores: proveedoresList,
        totalPages: Math.max(1, Math.ceil(proveedoresList.length / ITEMS_PER_PAGE)),
        loading: false,
      }));
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
      setState((prev) => ({
        ...prev,
        error: "Ocurrió un error al cargar los proveedores. Por favor, intente nuevamente.",
        proveedores: [],
        filteredProveedores: [],
        loading: false,
      }));
    }
  }, []);

  // Efecto inicial para cargar proveedores
  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  // Filtrar proveedores según término de búsqueda
  useEffect(() => {
    const results = searchTerm.trim()
      ? proveedores.filter(
          (prov) =>
            (prov.nombre?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (prov.num_documento?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (prov.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        )
      : proveedores;

    setState((prev) => ({
      ...prev,
      filteredProveedores: results,
      currentPage: 1,
      totalPages: Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE)),
    }));
  }, [searchTerm, proveedores]);

  // Manejadores
  const handleSearchChange = (e) => {
    setState((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setState((prev) => ({ ...prev, currentPage: page }));
    }
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProveedores.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const handleToggleStatus = async (proveedor) => {
    const { id_proveedor, nombre, estado } = proveedor;
    const nuevoEstado = estado === "Activo" ? "Inactivo" : "Activo";
    const actionText = nuevoEstado === "Activo" ? "activar" : "desactivar";

    const result = await Swal.fire({
      title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} "${nombre}"?`,
      text: `El proveedor será ${nuevoEstado === "Activo" ? "activado" : "desactivado"}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ¡${actionText}!`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await ProveedoresService.cambiarEstado(id_proveedor, nuevoEstado);
        Swal.fire({
          title: "¡Estado actualizado!",
          text: `El proveedor ha sido ${nuevoEstado === "Activo" ? "activado" : "desactivado"} exitosamente.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchProveedores();
      } catch (err) {
        console.error(`Error al ${actionText} proveedor:`, err);
        Swal.fire(
          "Error",
          err.response?.data?.message || `No se pudo ${actionText} el proveedor.`,
          "error"
        );
      }
    }
  };

  const handleDelete = async (id_proveedor, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar "${nombre}"?`,
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡eliminar!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await ProveedoresService.remove(id_proveedor);
        Swal.fire({
          title: "¡Eliminado!",
          text: "El proveedor ha sido eliminado exitosamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchProveedores();
      } catch (err) {
        console.error("Error al eliminar proveedor:", err);
        Swal.fire(
          "Error",
          err.response?.data?.message || "No se pudo eliminar el proveedor.",
          "error"
        );
      }
    }
  };

  const verProveedor = (proveedor) => {
    Swal.fire({
      title: proveedor.nombre,
      html: `
        <div class="proveedor-detalle">
          <p><strong>Tipo Documento:</strong> ${proveedor.tipo_documento || "N/A"}</p>
          <p><strong>N° Documento:</strong> ${proveedor.num_documento || "N/A"}</p>
          <p><strong>Dirección:</strong> ${proveedor.direccion || "N/A"}</p>
          <p><strong>Teléfono:</strong> ${proveedor.telefono || "N/A"}</p>
          <p><strong>Email:</strong> ${proveedor.email || "N/A"}</p>
          <p><strong>Estado:</strong> <span class="estado-${proveedor.estado?.toLowerCase() || "inactivo"}">${
        proveedor.estado || "N/A"
      }</span></p>
          <p><strong>Fecha de Registro:</strong> ${
            proveedor.createdAt ? new Date(proveedor.createdAt).toLocaleDateString() : "N/A"
          }</p>
        </div>
      `,
      width: "600px",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: { popup: "proveedor-detalle-popup" },
    });
  };

  const handleOpenEditModal = (proveedor) => {
    setState((prev) => ({ ...prev, editingProveedor: { ...proveedor }, isEditModalOpen: true }));
  };

  const handleCloseEditModal = () => {
    setState((prev) => ({ ...prev, isEditModalOpen: false, editingProveedor: null }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      editingProveedor: { ...prev.editingProveedor, [name]: value },
    }));
  };

  const handleSaveChanges = async () => {
    if (!editingProveedor) return;

    // Validaciones
    if (!editingProveedor.nombre || editingProveedor.nombre.length < 3) {
      Swal.fire("Error", "El nombre debe tener al menos 3 caracteres.", "error");
      return;
    }
    if (!editingProveedor.email || !/\S+@\S+\.\S+/.test(editingProveedor.email)) {
      Swal.fire("Error", "El email debe ser válido.", "error");
      return;
    }
    if (!editingProveedor.num_documento || !/^\d+$/.test(editingProveedor.num_documento)) {
      Swal.fire("Error", "El número de documento debe ser numérico.", "error");
      return;
    }
    if (!editingProveedor.telefono || !/^\d+$/.test(editingProveedor.telefono)) {
      Swal.fire("Error", "El teléfono debe contener solo números.", "error");
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true }));
    try {
      await ProveedoresService.update(editingProveedor.id_proveedor, editingProveedor);
      Swal.fire({
        icon: "success",
        title: "Proveedor actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
      handleCloseEditModal();
      fetchProveedores();
    } catch (err) {
      console.error("Error al actualizar proveedor:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo actualizar el proveedor.",
        "error"
      );
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // Renderizado
  return (
    <div className="container mx-auto p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Proveedores</h1>
        <Link
          to="/proveedor/crear"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus className="mr-2" /> Nuevo Proveedor
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o email..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Buscar proveedores"
          />
        </div>
      </div>

      {/* Estados de carga y error */}
      {loading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Cargando proveedores...</p>
        </div>
      )}
      {error && (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchProveedores}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de proveedores */}
      {!loading && !error && (
        filteredProveedores.length === 0 ? (
          <div className="text-center mt-6">
            <p className="text-gray-600">No hay proveedores para mostrar.</p>
            {searchTerm && (
              <button
                onClick={() => setState((prev) => ({ ...prev, searchTerm: "" }))}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600">ID</th>
                    <th className="px-4 py-2 text-left text-gray-600">Nombre</th>
                    <th className="px-4 py-2 text-left text-gray-600">Doc.</th>
                    <th className="px-4 py-2 text-left text-gray-600">Número Doc.</th>
                    <th className="px-4 py-2 text-left text-gray-600">Teléfono</th>
                    <th className="px-4 py-2 text-left text-gray-600">Email</th>
                    <th className="px-4 py-2 text-left text-gray-600">Estado</th>
                    <th className="px-4 py-2 text-left text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((proveedor) => (
                    <tr key={proveedor.id_proveedor} className="border-t">
                      <td className="px-4 py-2">{proveedor.id_proveedor}</td>
                      <td className="px-4 py-2">{proveedor.nombre}</td>
                      <td className="px-4 py-2">{proveedor.tipo_documento}</td>
                      <td className="px-4 py-2">{proveedor.num_documento}</td>
                      <td className="px-4 py-2">{proveedor.telefono}</td>
                      <td className="px-4 py-2">{proveedor.email}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${
                            proveedor.estado === "Activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {proveedor.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => verProveedor(proveedor)}
                          className="p-2 text-blue-500 hover:text-blue-700"
                          title="Ver detalles"
                          aria-label="Ver detalles del proveedor"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(proveedor)}
                          className="p-2 text-green-500 hover:text-green-700"
                          title="Editar proveedor"
                          aria-label="Editar proveedor"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(proveedor)}
                          className={`p-2 ${
                            proveedor.estado === "Activo"
                              ? "text-yellow-500 hover:text-yellow-700"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                          title={`${proveedor.estado === "Activo" ? "Desactivar" : "Activar"} proveedor`}
                          aria-label={`${proveedor.estado === "Activo" ? "Desactivar" : "Activar"} proveedor`}
                        >
                          {proveedor.estado === "Activo" ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button
                          onClick={() => handleDelete(proveedor.id_proveedor, proveedor.nombre)}
                          className="p-2 text-red-500 hover:text-red-700"
                          title="Eliminar proveedor"
                          aria-label="Eliminar proveedor"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProveedores.length)}-
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredProveedores.length)} de{" "}
                {filteredProveedores.length} proveedores
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                  aria-label="Página anterior"
                >
                  <FaChevronLeft />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum =
                    totalPages <= 5
                      ? i + 1
                      : currentPage <= 3
                      ? i + 1
                      : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded border ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600 hover:bg-blue-50"
                      }`}
                      aria-label={`Página ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                  aria-label="Página siguiente"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )
      )}

      {/* Modal de Edición */}
      {isEditModalOpen && editingProveedor && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCloseEditModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Editar Proveedor: {editingProveedor.nombre}
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Cerrar modal"
              >
                <FaTimes />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveChanges();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="form-field">
                  <label htmlFor="edit-tipo_documento" className="block text-sm font-medium text-gray-700">
                    Tipo Documento*
                  </label>
                  <select
                    id="edit-tipo_documento"
                    name="tipo_documento"
                    value={editingProveedor.tipo_documento || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Seleccione...
                    </option>
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="edit-num_documento" className="block text-sm font-medium text-gray-700">
                    Número Documento*
                  </label>
                  <input
                    id="edit-num_documento"
                    type="text"
                    name="num_documento"
                    value={editingProveedor.num_documento || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700">
                    Nombre*
                  </label>
                  <input
                    id="edit-nombre"
                    type="text"
                    name="nombre"
                    value={editingProveedor.nombre || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-direccion" className="block text-sm font-medium text-gray-700">
                    Dirección*
                  </label>
                  <input
                    id="edit-direccion"
                    type="text"
                    name="direccion"
                    value={editingProveedor.direccion || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-telefono" className="block text-sm font-medium text-gray-700">
                    Teléfono*
                  </label>
                  <input
                    id="edit-telefono"
                    type="text"
                    name="telefono"
                    value={editingProveedor.telefono || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                    Email*
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    name="email"
                    value={editingProveedor.email || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center"
                  onClick={handleCloseEditModal}
                  disabled={isSaving}
                >
                  <FaTimes className="mr-2" /> Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaProveedores;