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
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaFilter
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
  const [productosPorCategoria, setProductosPorCategoria] = useState({});
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el Modal de Edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para filtrado y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Función para construir la URL completa de la imagen
  const getImageUrl = (foto) => {
    if (!foto) return defaultProductImage;
    if (foto.startsWith('http')) return foto;
    return `${process.env.REACT_APP_API_URL}${foto}`;
  };

  // Obtener Productos
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener productos normales
      const responseData = await ProductosService.getAllProductos();
      let todosLosProductos = [];

      if (responseData && Array.isArray(responseData.productos)) {
        todosLosProductos = responseData.productos;
      }

      // Obtener productos con imágenes por categoría
      const responseImagenes = await ProductosService.getProductosFromImagenesByCategoria();
      if (responseImagenes && responseImagenes.success && typeof responseImagenes.productos === 'object') {
        // Convertir el objeto de categorías en un array plano de productos
        const productosConImagenes = Object.values(responseImagenes.productos).flat();
        
        // Combinar los productos, eliminando duplicados por id_producto
        todosLosProductos = [...todosLosProductos];
        productosConImagenes.forEach(productoConImagen => {
          const index = todosLosProductos.findIndex(p => p.id_producto === productoConImagen.id_producto);
          if (index !== -1) {
            // Si el producto existe, actualizar su información de imagen
            todosLosProductos[index] = {
              ...todosLosProductos[index],
              foto: productoConImagen.foto
            };
          } else {
            // Si no existe, agregar el nuevo producto
            todosLosProductos.push(productoConImagen);
          }
        });

        setProductosPorCategoria(responseImagenes.productos);
      }

      setProductos(todosLosProductos);
      setFilteredProductos(todosLosProductos);
      setTotalPages(Math.ceil(todosLosProductos.length / itemsPerPage));
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

  // Filtra productos basado en el término de búsqueda y categoría
  useEffect(() => {
    let results = productos;
    
    // Filtrar por categoría si hay una seleccionada
    if (selectedCategory) {
      results = results.filter(producto => producto.categoria === selectedCategory);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      results = results.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (producto.descripcion &&
            producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredProductos(results);
    setCurrentPage(1);
    setTotalPages(Math.max(1, Math.ceil(results.length / itemsPerPage)));
  }, [searchTerm, selectedCategory, productos]);

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Manejar cambio en el filtro de categoría
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
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
      title: '',
      html: `
        <div class="producto-detalle-container">
          <div class="producto-imagen-container">
            <img 
              src="${getImageUrl(producto.foto)}" 
              alt="${producto.nombre}"
              class="producto-imagen"
              onerror="this.src='${defaultProductImage}'"
            />
          </div>
          <div class="producto-info-container">
            <h2 class="producto-titulo">${producto.nombre}</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Categoría</span>
                <span class="info-value">${producto.categoria}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Precio Costo</span>
                <span class="info-value precio">${formatCurrency(producto.precioCosto)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Precio Venta</span>
                <span class="info-value precio">${formatCurrency(producto.precioVenta)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Stock</span>
                <span class="info-value stock ${getStockSemaphoreColor(producto.stock)}">
                  ${producto.stock ?? 0}
                </span>
              </div>
              <div class="info-item descripcion">
                <span class="info-label">Descripción</span>
                <span class="info-value">${producto.descripcion || "Sin descripción"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Estado</span>
                <span class="info-value estado-badge ${producto.estado === 'Activo' ? 'estado-activo' : 'estado-inactivo'}">
                  ${producto.estado}
                </span>
              </div>
            </div>
          </div>
        </div>
      `,
      width: '800px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'producto-detalle-popup',
      },
      didOpen: () => {
        const style = document.createElement('style');
        style.textContent = `
          .producto-detalle-container {
            display: flex;
            gap: 2rem;
            padding: 1rem;
            text-align: left;
          }
          .producto-imagen-container {
            flex: 0 0 300px;
          }
          .producto-imagen {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .producto-info-container {
            flex: 1;
          }
          .producto-titulo {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .info-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .info-item.descripcion {
            grid-column: span 2;
          }
          .info-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .info-value {
            font-size: 1rem;
            color: #1f2937;
          }
          .info-value.precio {
            font-weight: 600;
            color: #0891b2;
          }
          .info-value.stock {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-weight: 600;
            text-align: center;
          }
          .estado-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-weight: 500;
            text-align: center;
          }
          .estado-activo {
            background-color: #d1fae5;
            color: #065f46;
          }
          .estado-inactivo {
            background-color: #fee2e2;
            color: #991b1b;
          }
          @media (max-width: 768px) {
            .producto-detalle-container {
              flex-direction: column;
            }
            .producto-imagen-container {
              flex: 0 0 auto;
            }
            .info-grid {
              grid-template-columns: 1fr;
            }
            .info-item.descripcion {
              grid-column: span 1;
            }
          }
        `;
        document.head.appendChild(style);
        Swal.getPopup()._styleElement = style;
      },
      willClose: () => {
        const styleElement = Swal.getPopup()._styleElement;
        if (styleElement && document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
      }
    });
  };

  // Manejadores para el Modal de Edición
  const handleOpenEditModal = (producto) => {
    setEditingProduct({ ...producto });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (editingProduct?.previewFoto) {
      URL.revokeObjectURL(editingProduct.previewFoto);
    }
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => prev ? { ...prev, [name]: value } : null);
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
    formData.append("nombre", editingProduct.nombre.trim());
    formData.append("descripcion", editingProduct.descripcion?.trim() || "");
    formData.append("categoria", editingProduct.categoria);
    formData.append("estado", editingProduct.estado);
    formData.append("precioVenta", editingProduct.precioVenta || "0");
    formData.append("stock", editingProduct.stock || "0");
    
    // Agregar la nueva imagen si existe
    if (editingProduct.newFoto) {
      formData.append("foto", editingProduct.newFoto);
    }

    try {
      await ProductosService.updateProducto(editingProduct.id_producto, formData);
      // Limpiar URL de vista previa si existe
      if (editingProduct.previewFoto) {
        URL.revokeObjectURL(editingProduct.previewFoto);
      }
      Swal.fire({
        title: "¡Éxito!",
        text: "Producto actualizado correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      handleCloseEditModal();
      fetchProductos();
    } catch (error) {
      console.error("Error updating product:", error);
      Swal.fire(
        "Error",
        error.message || "No se pudo actualizar el producto",
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

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="relative flex items-center">
          <FaFilter className="absolute left-3 text-gray-400" />
          <select
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Todas las categorías</option>
            {categoriasList.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
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
                    <th className="px-4 py-2 text-left text-gray-600">Imagen</th>
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
                            src={getImageUrl(producto.foto)} 
                            alt={producto.nombre}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => { e.target.src = defaultProductImage; }}
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
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Editar Producto - {editingProduct.nombre}
                </h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Producto</label>
                    <input
                      type="text"
                      name="nombre"
                      value={editingProduct.nombre}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      placeholder="Ingrese el nombre del producto"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                    <select
                      name="categoria"
                      value={editingProduct.categoria}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Seleccione una categoría</option>
                      {categoriasList.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={editingProduct.descripcion || ""}
                      onChange={handleEditInputChange}
                      rows="4"
                      className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                      placeholder="Ingrese una descripción del producto"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen Actual</label>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={getImageUrl(editingProduct.foto)} 
                        alt={editingProduct.nombre}
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        onError={(e) => { e.target.src = defaultProductImage; }}
                      />
                      <div className="flex flex-col space-y-2">
                        <input
                          type="file"
                          name="foto"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setEditingProduct(prev => ({
                                ...prev,
                                newFoto: file,
                                previewFoto: URL.createObjectURL(file)
                              }));
                            }
                          }}
                          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {editingProduct.previewFoto && (
                          <div className="relative">
                            <img 
                              src={editingProduct.previewFoto} 
                              alt="Vista previa" 
                              className="w-32 h-32 object-cover rounded-lg border border-blue-300"
                            />
                            <button
                              onClick={() => {
                                URL.revokeObjectURL(editingProduct.previewFoto);
                                setEditingProduct(prev => ({
                                  ...prev,
                                  newFoto: null,
                                  previewFoto: null
                                }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6 px-4 py-3 bg-gray-50 border-t">
              <button
                onClick={handleCloseEditModal}
                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaProductos;