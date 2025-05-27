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
import ProductosService from "../../../services/productosService";
import defaultProductImage from "../../../assets/images/login1.jpg";

// Lista de categorías
const categoriasList = [
  { value: "SNACKS", label: "Snacks" },
  { value: "HIGIENE", label: "Higiene" },
  { value: "JUGUETERIA", label: "Juguetería" },
  { value: "ACCESORIOS", label: "Accesorios" },
];

const ListaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el Modal de Edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para filtrado y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Obtener Productos
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await ProductosService.getAllProductos();
      if (responseData && Array.isArray(responseData.productos)) {
        setProductos(responseData.productos);
        setFilteredProductos(responseData.productos);
        setTotalPages(Math.ceil(responseData.productos.length / itemsPerPage));
      } else {
        console.warn("Respuesta inesperada de getAllProductos:", responseData);
        setProductos([]);
        setFilteredProductos([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "No se pudieron cargar los productos.");
      setProductos([]);
      setFilteredProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Filtra productos basado en el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProductos(productos);
    } else {
      const results = productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (producto.descripcion &&
            producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProductos(results);
    }
    setCurrentPage(1);
    setTotalPages(Math.max(1, Math.ceil(filteredProductos.length / itemsPerPage)));
  }, [searchTerm, productos]);

  // Actualiza el número total de páginas cuando cambian los productos filtrados
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredProductos.length / itemsPerPage)));
  }, [filteredProductos]);

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

  // Obtener productos para la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProductos.slice(startIndex, endIndex);
  };

  // Determinar el color del semáforo basado en stock
  const getStockSemaphoreColor = (stock) => {
    const stockNum = parseInt(stock || 0);
    if (stockNum < 10) return "bg-red-200 text-red-800";
    if (stockNum < 20) return "bg-yellow-200 text-yellow-800";
    return "bg-green-200 text-green-800";
  };

  // Manejadores de Acciones Directas en Tabla
  const handleDelete = async (productId, nombreProducto) => {
    const result = await Swal.fire({
      title: `¿Eliminar "${nombreProducto}"?`,
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
        await ProductosService.eliminarProducto(productId);
        Swal.fire({
          title: "¡Eliminado!",
          text: `"${nombreProducto}" ha sido eliminado.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchProductos();
      } catch (err) {
        console.error("Error deleting product:", err);
        Swal.fire(
          "Error",
          err.message || "No se pudo eliminar el producto.",
          "error"
        );
      }
    }
  };

  const handleToggleStatus = async (producto) => {
    const { id_producto, nombre, estado } = producto;
    const newStatus = estado === "Activo" ? "Inactivo" : "Activo";
    const actionText = newStatus === "Activo" ? "activar" : "desactivar";
    const result = await Swal.fire({
      title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} "${nombre}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ¡${actionText}!`,
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        await ProductosService.putProducto(id_producto, newStatus);
        fetchProductos();
      } catch (err) {
        console.error(`Error ${actionText} product:`, err);
        Swal.fire(
          "Error",
          err.message || `No se pudo ${actionText} el producto.`,
          "error"
        );
      }
    }
  };

  // Ver detalles del producto
  const verProducto = (producto) => {
    Swal.fire({
      title: producto.nombre,
      html: `
        <div class="producto-detalle">
          <p><strong>Foto:</strong></p>
          <img src="${producto.foto || defaultProductImage}" alt="${producto.nombre}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" onerror="this.src='${defaultProductImage}'" />
          <p><strong>Categoría:</strong> ${producto.categoria}</p>
          <p><strong>Precio Costo:</strong> ${formatCurrency(producto.precioCosto)}</p>
          <p><strong>Precio Venta:</strong> ${formatCurrency(producto.precioVenta)}</p>
          <p><strong>Stock:</strong> 
            <span class="${getStockSemaphoreColor(producto.stock)} px-2 py-1 rounded-full">
              ${producto.stock ?? 0}
            </span>
          </p>
          <p><strong>Descripción:</strong> ${producto.descripcion || "Sin descripción"}</p>
          <p><strong>Estado:</strong> <span class="estado-${producto.estado.toLowerCase()}">${producto.estado}</span></p>
        </div>
      `,
      width: "600px",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "producto-detalle-popup",
      },
    });
  };

  // Manejadores para el Modal de Edición
  const handleOpenEditModal = (producto) => {
    setEditingProduct({ ...producto });
    setNewPhotoFile(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setNewPhotoFile(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingProduct((prev) =>
          prev ? { ...prev, foto: event.target?.result } : null
        );
      };
      reader.readAsDataURL(file);
    } else {
      setNewPhotoFile(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!editingProduct) return;
    if (!editingProduct.nombre || editingProduct.nombre.length < 3) {
      Swal.fire("Error", "El nombre debe tener al menos 3 caracteres.", "error");
      return;
    }
    if (!editingProduct.categoria) {
      Swal.fire("Error", "La categoría es obligatoria.", "error");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("nombre", editingProduct.nombre);
    formData.append("categoria", editingProduct.categoria);
    formData.append("descripcion", editingProduct.descripcion || "");
    if (newPhotoFile) {
      formData.append("foto", newPhotoFile);
    }

    try {
      await ProductosService.updateProducto(editingProduct.id_producto, formData);
      Swal.fire({
        icon: "success",
        title: "Producto actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
      handleCloseEditModal();
      fetchProductos();
    } catch (err) {
      console.error("Error updating product:", err);
      Swal.fire(
        "Error",
        err.message || "No se pudo actualizar el producto.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Helper para formatear moneda
  const formatCurrency = (value) => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue || 0);
  };

  // Renderizado
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Productos</h1>
        <div className="flex space-x-4">
          <Link
            to="/productos/crear"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus className="mr-2" /> Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Filtro de búsqueda */}
      <div className="mb-6">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o descripción..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Cargando productos...</p>
        </div>
      )}
      {error && (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchProductos}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        filteredProductos.length === 0 ? (
          <div className="text-center mt-6">
            <p className="text-gray-600">No hay productos para mostrar.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600">Foto</th>
                    <th className="px-4 py-2 text-left text-gray-600">Nombre</th>
                    <th className="px-4 py-2 text-left text-gray-600">Categoría</th>
                    <th className="px-4 py-2 text-left text-gray-600">P. Costo</th>
                    <th className="px-4 py-2 text-left text-gray-600">P. Venta</th>
                    <th className="px-4 py-2 text-left text-gray-600">Stock</th>
                    <th className="px-4 py-2 text-left text-gray-600">Estado</th>
                    <th className="px-4 py-2 text-left text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((producto) => {
                    const isProductActive = producto.estado === "Activo";
                    return (
                      <tr key={producto.id_producto} className="border-t">
                        <td className="px-4 py-2">
                          <img
                            src={producto.foto || defaultProductImage}
                            alt={producto.nombre}
                            className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full mx-auto border"
                            onError={(e) => {
                              e.target.src = defaultProductImage;
                            }}
                          />
                        </td>
                        <td className="px-4 py-2">{producto.nombre}</td>
                        <td className="px-4 py-2">{producto.categoria}</td>
                        <td className="px-4 py-2">{formatCurrency(producto.precioCosto)}</td>
                        <td className="px-4 py-2">{formatCurrency(producto.precioVenta)}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${getStockSemaphoreColor(
                              producto.stock
                            )}`}
                          >
                            {producto.stock ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${
                              isProductActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {producto.estado}
                          </span>
                        </td>
                        <td className="px-4 py-2 flex space-x-2">
                          <button
                            onClick={() => verProducto(producto)}
                            className="p-2 text-blue-500 hover:text-blue-700"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(producto)}
                            className="p-2 text-green-500 hover:text-green-700"
                            title="Editar producto"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(producto)}
                            className={`p-2 ${
                              isProductActive
                                ? "text-yellow-500 hover:text-yellow-700"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            title={`${isProductActive ? "Desactivar" : "Activar"} producto`}
                          >
                            {isProductActive ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          <button
                            onClick={() => handleDelete(producto.id_producto, producto.nombre)}
                            className="p-2 text-red-500 hover:text-red-700"
                            title="Eliminar producto"
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
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProductos.length)}-
                {Math.min(currentPage * itemsPerPage, filteredProductos.length)} de {filteredProductos.length} productos
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
                
                {/* Generación dinámica de botones de página */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Lógica para mostrar páginas adecuadas alrededor de la página actual
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
      {isEditModalOpen && editingProduct && (
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
                Editar Producto: {editingProduct.nombre}
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
                    src={editingProduct.foto || defaultProductImage}
                    alt="Vista previa"
                    className="w-24 h-24 object-cover rounded-lg mx-auto border mt-2"
                    onError={(e) => {
                      e.target.src = defaultProductImage;
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
                    value={editingProduct.nombre || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-categoria" className="block text-sm font-medium text-gray-700">
                    Categoría*
                  </label>
                  <select
                    id="edit-categoria"
                    name="categoria"
                    value={editingProduct.categoria || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Seleccione...
                    </option>
                    {categoriasList.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field md:col-span-2">
                  <label htmlFor="edit-descripcion" className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    id="edit-descripcion"
                    name="descripcion"
                    value={editingProduct.descripcion || ""}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
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

export default ListaProductos;