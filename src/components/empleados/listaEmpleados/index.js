import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaSave,
  FaImage,
  FaEye,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import EmpleadoService from "../../../services/empleadosService";
import defaultUserImage from "../../../assets/images/login1.jpg";

const ListaEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el Modal de Edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para filtrado y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Obtener Empleados
  const fetchEmpleados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await EmpleadoService.getAllEmpleados();
      if (Array.isArray(responseData)) {
        setEmpleados(responseData);
        setFilteredEmpleados(responseData);
        setTotalPages(Math.ceil(responseData.length / itemsPerPage));
      } else {
        console.warn("Respuesta inesperada de getAllEmpleados:", responseData);
        setEmpleados([]);
        setFilteredEmpleados([]);
      }
    } catch (err) {
      console.error("Error fetching empleados:", err);
      setError(err.message || "No se pudieron cargar los empleados.");
      setEmpleados([]);
      setFilteredEmpleados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  // Filtra empleados basado en el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmpleados(empleados);
    } else {
      const results = empleados.filter(
        (empleado) =>
          empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empleado.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empleado.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empleado.correo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmpleados(results);
    }
    setCurrentPage(1);
    setTotalPages(Math.max(1, Math.ceil(filteredEmpleados.length / itemsPerPage)));
  }, [searchTerm, empleados]);

  // Actualiza el número total de páginas cuando cambian los empleados filtrados
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredEmpleados.length / itemsPerPage)));
  }, [filteredEmpleados]);

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Manejadores de paginación
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Obtener empleados para la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmpleados.slice(startIndex, endIndex);
  };

  // Manejadores de Acciones
  const handleDelete = async (empleadoId, nombreEmpleado) => {
    const result = await Swal.fire({
      title: `¿Eliminar a "${nombreEmpleado}"?`,
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
        await EmpleadoService.eliminarEmpleado(empleadoId);
        Swal.fire({
          title: "¡Eliminado!",
          text: `"${nombreEmpleado}" ha sido eliminado.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchEmpleados();
      } catch (err) {
        console.error("Error deleting empleado:", err);
        Swal.fire(
          "Error",
          err.message || "No se pudo eliminar el empleado.",
          "error"
        );
      }
    }
  };

  const handleToggleStatus = async (empleado) => {
    const { id_empleado, nombre, estado } = empleado;
    const newStatus = estado === "Activo" ? "Inactivo" : "Activo";
    const actionText = newStatus === "Activo" ? "activar" : "desactivar";
    const result = await Swal.fire({
      title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} a "${nombre}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ¡${actionText}!`,
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        await EmpleadoService.cambiarEstadoEmpleado(id_empleado);
        fetchEmpleados();
      } catch (err) {
        console.error(`Error ${actionText} empleado:`, err);
        Swal.fire(
          "Error",
          err.message || `No se pudo ${actionText} el empleado.`,
          "error"
        );
      }
    }
  };

  // Ver detalles del empleado
  const verEmpleado = (empleado) => {
    Swal.fire({
      title: `${empleado.nombre} ${empleado.apellido}`,
      html: `
        <div class="empleado-detalle">
          <p><strong>Foto:</strong></p>
          <img src="${empleado.foto || defaultUserImage}" alt="${empleado.nombre}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%;" onerror="this.src='${defaultUserImage}'" />
          <p><strong>Documento:</strong> ${empleado.documento}</p>
          <p><strong>Correo:</strong> ${empleado.correo}</p>
          <p><strong>Teléfono:</strong> ${empleado.telefono}</p>
          <p><strong>Estado:</strong> <span class="estado-${empleado.estado.toLowerCase()}">${empleado.estado}</span></p>
        </div>
      `,
      width: "600px",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "empleado-detalle-popup",
      },
    });
  };

  // Manejadores para el Modal de Edición
  const handleOpenEditModal = (empleado) => {
    setEditingEmpleado({ ...empleado });
    setNewPhotoFile(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmpleado(null);
    setNewPhotoFile(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEmpleado((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingEmpleado((prev) =>
          prev ? { ...prev, foto: event.target?.result } : null
        );
      };
      reader.readAsDataURL(file);
    } else {
      setNewPhotoFile(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!editingEmpleado) return;
    if (!editingEmpleado.nombre || editingEmpleado.nombre.length < 3) {
      Swal.fire("Error", "El nombre debe tener al menos 3 caracteres.", "error");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("nombre", editingEmpleado.nombre);
    formData.append("apellido", editingEmpleado.apellido);
    formData.append("correo", editingEmpleado.correo);
    formData.append("telefono", editingEmpleado.telefono);
    if (newPhotoFile) {
      formData.append("foto", newPhotoFile);
    }

    try {
      await EmpleadoService.updateEmpleado(editingEmpleado.id_empleado, formData);
      Swal.fire({
        icon: "success",
        title: "Empleado actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
      handleCloseEditModal();
      fetchEmpleados();
    } catch (err) {
      console.error("Error updating empleado:", err);
      Swal.fire(
        "Error",
        err.message || "No se pudo actualizar el empleado.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Renderizado
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Empleados</h1>
        <div className="flex space-x-4">
          <Link
            to="/empleados/crear"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus className="mr-2" /> Nuevo Empleado
          </Link>
        </div>
      </div>

      {/* Filtro de búsqueda */}
      <div className="mb-6">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, documento o correo..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Cargando empleados...</p>
        </div>
      )}
      {error && (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchEmpleados}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        filteredEmpleados.length === 0 ? (
          <div className="text-center mt-6">
            <p className="text-gray-600">No hay empleados para mostrar.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600">Foto</th>
                    <th className="px-4 py-2 text-left text-gray-600">Nombre</th>
                    <th className="px-4 py-2 text-left text-gray-600">Documento</th>
                    <th className="px-4 py-2 text-left text-gray-600">Correo</th>
                    <th className="px-4 py-2 text-left text-gray-600">Teléfono</th>
                    <th className="px-4 py-2 text-left text-gray-600">Estado</th>
                    <th className="px-4 py-2 text-left text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((empleado) => {
                    const isEmpleadoActive = empleado.estado === "Activo";
                    return (
                      <tr key={empleado.id_empleado} className="border-t">
                        <td className="px-4 py-2">
                          <img
                            src={empleado.foto || defaultUserImage}
                            alt={empleado.nombre}
                            className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full mx-auto border"
                            onError={(e) => {
                              e.target.src = defaultUserImage;
                            }}
                          />
                        </td>
                        <td className="px-4 py-2">{`${empleado.nombre} ${empleado.apellido}`}</td>
                        <td className="px-4 py-2">{empleado.documento}</td>
                        <td className="px-4 py-2">{empleado.correo}</td>
                        <td className="px-4 py-2">{empleado.telefono}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${
                              isEmpleadoActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {empleado.estado}
                          </span>
                        </td>
                        <td className="px-4 py-2 flex space-x-2">
                          <button
                            onClick={() => verEmpleado(empleado)}
                            className="p-2 text-blue-500 hover:text-blue-700"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(empleado)}
                            className="p-2 text-green-500 hover:text-green-700"
                            title="Editar empleado"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(empleado)}
                            className={`p-2 ${
                              isEmpleadoActive
                                ? "text-yellow-500 hover:text-yellow-700"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            title={`${isEmpleadoActive ? "Desactivar" : "Activar"} empleado`}
                          >
                            {isEmpleadoActive ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          <button
                            onClick={() => handleDelete(empleado.id_empleado, `${empleado.nombre} ${empleado.apellido}`)}
                            className="p-2 text-red-500 hover:text-red-700"
                            title="Eliminar empleado"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredEmpleados.length)}-
                {Math.min(currentPage * itemsPerPage, filteredEmpleados.length)} de {filteredEmpleados.length} empleados
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
                >
                  <FaChevronLeft />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded border ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600 hover:bg-blue-50"
                      }`}
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
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )
      )}

      {/* Modal de Edición */}
      {isEditModalOpen && editingEmpleado && (
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
                Editar Empleado: {editingEmpleado.nombre}
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Cerrar"
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 text-center">
                    Foto Actual
                  </label>
                  <img
                    src={editingEmpleado.foto || defaultUserImage}
                    alt="Vista previa"
                    className="w-24 h-24 object-cover rounded-full mx-auto border mt-2"
                    onError={(e) => {
                      e.target.src = defaultUserImage;
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleEditFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                    className={`mt-2 mx-auto block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
                      isSaving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <FaImage className="inline mr-2" /> Cambiar Foto
                  </button>
                  {newPhotoFile && (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Nuevo: {newPhotoFile.name}
                    </p>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700">
                    Nombre*
                  </label>
                  <input
                    id="edit-nombre"
                    type="text"
                    name="nombre"
                    value={editingEmpleado.nombre || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-apellido" className="block text-sm font-medium text-gray-700">
                    Apellido*
                  </label>
                  <input
                    id="edit-apellido"
                    type="text"
                    name="apellido"
                    value={editingEmpleado.apellido || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-correo" className="block text-sm font-medium text-gray-700">
                    Correo*
                  </label>
                  <input
                    id="edit-correo"
                    type="email"
                    name="correo"
                    value={editingEmpleado.correo || ""}
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
                    type="tel"
                    name="telefono"
                    value={editingEmpleado.telefono || ""}
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
                    "Guardando..."
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

export default ListaEmpleados;
