import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    FaPlus,
    FaEye,
    FaEdit,
    FaTrashAlt,
    FaTimes,
    FaSave,
    FaFileInvoiceDollar,
    FaMoneyBillWave,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';
import ComprasService from '../../../services/comprasService';
import ProveedoresService from '../../../services/proveedoresService';

// Define los posibles estados y sus etiquetas/colores
const estadosCompra = {
    'Pendiente de Pago': { label: 'Pendiente Pago', color: 'yellow', textColor: 'text-yellow-800', bgColor: 'bg-yellow-100' },
    'Pagada': { label: 'Pagada', color: 'green', textColor: 'text-green-800', bgColor: 'bg-green-100' },
    'Pagado Parcial': { label: 'Pago Parcial', color: 'blue', textColor: 'text-blue-800', bgColor: 'bg-blue-100' },
    'Cancelada': { label: 'Cancelada', color: 'red', textColor: 'text-red-800', bgColor: 'bg-red-100' },
    'Desconocido': { label: 'Desconocido', color: 'gray', textColor: 'text-gray-800', bgColor: 'bg-gray-100' },
};

const ListaCompras = () => {
    const [compras, setCompras] = useState([]);
    const [filteredCompras, setFilteredCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Estados para el Modal de Edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCompra, setEditingCompra] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [proveedoresList, setProveedoresList] = useState([]);
    const [abonoAmount, setAbonoAmount] = useState('');
    // Estados para filtrado y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    // Obtener Compras y Proveedores
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setProveedoresList([]);
        setCompras([]);
        try {
            const [comprasRes, provRes] = await Promise.all([
                ComprasService.getAllCompras(),
                ProveedoresService.getAll()
            ]);

            if (comprasRes && comprasRes.ok && Array.isArray(comprasRes.compras)) {
                setCompras(comprasRes.compras);
                setFilteredCompras(comprasRes.compras);
                setTotalPages(Math.ceil(comprasRes.compras.length / itemsPerPage));
            } else {
                console.warn('Respuesta inesperada de getAllCompras:', comprasRes);
                const comprasErrorMsg = comprasRes?.msg || 'No se pudieron cargar las compras.';
                setError(prev => prev ? `${prev}\n${comprasErrorMsg}` : comprasErrorMsg);
            }

            if (provRes && provRes.data && Array.isArray(provRes.data.listProveedores)) {
                setProveedoresList(provRes.data.listProveedores);
            } else {
                console.warn("Respuesta inesperada de proveedores o está vacío:", provRes);
                const provErrorMsg = 'Advertencia: No se cargaron proveedores para edición.';
                setError(prev => prev ? `${prev}\n${provErrorMsg}` : provErrorMsg);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            const errorMsg = err.response?.data?.msg || err.message || 'Error cargando datos.';
            setError(errorMsg);
            setCompras([]);
            setFilteredCompras([]);
            setProveedoresList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtra compras basado en el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCompras(compras);
        } else {
            const results = compras.filter((compra) =>
                (compra.proveedor?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (compra.numero_referencia?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (compra.estado_compra?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
            setFilteredCompras(results);
        }
        setCurrentPage(1);
        setTotalPages(Math.max(1, Math.ceil(filteredCompras.length / itemsPerPage)));
    }, [searchTerm, compras]);

    // Actualiza el número total de páginas cuando cambian las compras filtradas
    useEffect(() => {
        setTotalPages(Math.max(1, Math.ceil(filteredCompras.length / itemsPerPage)));
    }, [filteredCompras]);

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

    // Obtener compras para la página actual
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredCompras.slice(startIndex, endIndex);
    };

    // Helpers
    const formatCurrency = (value) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numericValue) || numericValue === null || numericValue === undefined) {
            return '$ 0';
        }
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numericValue);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            console.error("Error formateando fecha:", dateString, e);
            return 'Fecha inválida';
        }
    };

    // Ver Detalles de la Compra
    const handleVerDetalles = (compra) => {
        const estadoActual = compra.estado_compra || 'Desconocido';
        const estadoInfo = estadosCompra[estadoActual] || estadosCompra['Desconocido'];
        let detallesHtml = '<p class="text-gray-500 italic text-sm">No hay detalles de productos para esta compra.</p>';

        if (compra.detalles && compra.detalles.length > 0) {
            detallesHtml = `
              <div class="overflow-x-auto mt-2">
                <table class="swal-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th class="text-center">Cant.</th>
                      <th class="text-right">Costo U.</th>
                      <th class="text-right">Subtotal</th>
                      <th class="text-center">Margen</th>
                      <th class="text-right">P. Venta Calc.</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${compra.detalles.map(d => `
                      <tr>
                        <td>${d.producto?.nombre || '<span class="text-red-500">Producto no encontrado</span>'}</td>
                        <td class="text-center">${d.cantidad}</td>
                        <td class="text-right">${formatCurrency(d.precio_costo_unitario)}</td>
                        <td class="text-right">${formatCurrency(d.subtotal_linea)}</td>
                        <td class="text-center">${d.margen_aplicado !== null ? `${parseFloat(d.margen_aplicado).toFixed(1)}%` : '-'}</td>
                        <td class="text-right">${d.precio_venta_calculado !== null ? formatCurrency(d.precio_venta_calculado) : '-'}</td>
                      </tr>`).join('')}
                  </tbody>
                </table>
              </div>`;
        }

        Swal.fire({
            title: `<span class="font-semibold text-lg">Detalle Compra #${compra.id_compra || 'N/A'}</span>`,
            html: `
              <div class="compra-detalle text-left text-sm space-y-1">
                <p><strong>Proveedor:</strong> ${compra.proveedor?.nombre || '<span class="text-gray-400 italic">N/A</span>'}</p>
                <p><strong>Referencia:</strong> ${compra.numero_referencia || '<span class="text-gray-400 italic">-</span>'}</p>
                <p><strong>Fecha:</strong> ${formatDate(compra.fecha_compra)}</p>
                <p><strong>Total Compra:</strong> <span class="font-medium">${formatCurrency(compra.total_compra)}</span></p>
                ${compra.monto_pagado !== undefined && compra.monto_pagado !== null ? `<p><strong>Monto Pagado:</strong> <span class="font-medium">${formatCurrency(compra.monto_pagado)}</span></p>` : ''}
                <p><strong>Estado:</strong> <span class="estado-badge ${estadoInfo.bgColor} ${estadoInfo.textColor}">${estadoInfo.label}</span></p>
                <hr class="my-3 border-gray-200">
                <h4 class="text-base font-semibold mb-2 text-gray-700">Productos Comprados:</h4>
                ${detallesHtml}
              </div>`,
            width: '800px', showCloseButton: true, showConfirmButton: false,
            customClass: { popup: 'compra-detalle-popup rounded-lg shadow-lg' },
            didOpen: () => {
                const style = document.createElement('style');
                style.textContent = `
                  .swal-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 0.85em; }
                  .swal-table th, .swal-table td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: middle;}
                  .swal-table th { background-color: #f9fafb; font-weight: 600; color: #4b5563; }
                  .swal-table tbody tr:nth-child(even) { background-color: #f9fafb; }
                  .compra-detalle p { margin-bottom: 5px; color: #374151; }
                  .compra-detalle p strong { font-weight: 600; color: #1f2937; margin-right: 4px;}
                  .compra-detalle hr { border-top: 1px solid #e5e7eb; }
                  .estado-badge { padding: 3px 10px; border-radius: 99px; font-weight: 500; font-size: 0.75rem; display: inline-block; line-height: 1.2; }
                  .bg-yellow-100 { background-color: #FEF9C3; } .text-yellow-800 { color: #854D0E; }
                  .bg-green-100 { background-color: #D1FAE5; } .text-green-800 { color: #065F46; }
                  .bg-blue-100 { background-color: #DBEAFE; } .text-blue-800 { color: #1E40AF; }
                  .bg-red-100 { background-color: #FEE2E2; } .text-red-800 { color: #991B1B; }
                  .bg-gray-100 { background-color: #F3F4F6; } .text-gray-800 { color: #1F2937; }
                  .text-right { text-align: right; } .text-center { text-align: center; }
                  .text-gray-500 { color: #6b7280; } .italic { font-style: italic; }
                  .text-red-500 { color: #ef4444; } .text-gray-400 { color: #9ca3af; }
                  .font-medium { font-weight: 500; } .font-semibold { font-weight: 600; }
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
    const handleOpenEditModal = (compra) => {
        if (!proveedoresList || proveedoresList.length === 0) {
            Swal.fire("Error", "No se han cargado los proveedores. La edición no está disponible.", "error");
            return;
        }
        setEditingCompra({
            ...compra,
            id_proveedor: compra.id_proveedor ? Number(compra.id_proveedor) : '',
            monto_pagado: parseFloat(compra.monto_pagado ?? 0),
            total_compra: parseFloat(compra.total_compra) || 0,
        });
        setAbonoAmount('');
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingCompra(null);
        setIsSaving(false);
        setAbonoAmount('');
    };

    const handleEditHeaderChange = (e) => {
        const { name, value } = e.target;
        setEditingCompra((prev) => {
            if (!prev) return null;
            if (name === 'id_proveedor') {
                return { ...prev, [name]: parseInt(value) || '' };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleAbonoChange = (e) => {
        setAbonoAmount(e.target.value);
    };

    const handleSaveChanges = async () => {
        if (!editingCompra) return;

        if (!editingCompra.id_proveedor || isNaN(editingCompra.id_proveedor)) {
            Swal.fire("Error", "Seleccione un proveedor válido.", "error"); return;
        }

        const abonoActual = parseFloat(abonoAmount);
        if (abonoAmount !== '' && (isNaN(abonoActual) || abonoActual < 0)) {
            Swal.fire("Error", "El monto del nuevo pago debe ser un número positivo.", "error"); return;
        }
        const abonoAAplicar = abonoAmount === '' || isNaN(abonoActual) ? 0 : abonoActual;

        const montoPagadoActual = editingCompra.monto_pagado;
        const totalCompra = editingCompra.total_compra;
        const nuevoTotalPagado = montoPagadoActual + abonoAAplicar;

        const tolerancia = 0.001;
        if (nuevoTotalPagado > totalCompra + tolerancia) {
            Swal.fire("Error", `El pago de ${formatCurrency(abonoAAplicar)} excede el saldo pendiente (${formatCurrency(totalCompra - montoPagadoActual)}).`, "error"); return;
        }

        let nuevoEstadoCompra = 'Pendiente de Pago';
        if (Math.abs(nuevoTotalPagado - totalCompra) < tolerancia) {
            nuevoEstadoCompra = 'Pagada';
        } else if (nuevoTotalPagado > 0) {
            nuevoEstadoCompra = 'Pagado Parcial';
        }

        if (editingCompra.estado_compra === 'Cancelada') {
            Swal.fire("Info", "No se puede modificar una compra cancelada.", "info");
            return;
        }

        setIsSaving(true);
        const updatedData = {
            id_proveedor: editingCompra.id_proveedor,
            numero_referencia: editingCompra.numero_referencia || null,
            estado_compra: nuevoEstadoCompra,
            monto_pagado: parseFloat(nuevoTotalPagado.toFixed(2)),
        };

        try {
            const response = await ComprasService.updateCompra(editingCompra.id_compra, updatedData);
            if (response && response.ok) {
                Swal.fire({ icon: 'success', title: '¡Actualizado!', text: response.msg || 'Compra y pago actualizados.', timer: 1800, showConfirmButton: false });
                handleCloseEditModal();
                fetchData();
            } else {
                throw new Error(response?.msg || 'La actualización falló.');
            }
        } catch (error) {
            console.error("Error updating purchase:", error);
            Swal.fire('Error', error.message || 'No se pudo actualizar la compra.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Eliminar Compra
    const handleDeleteCompra = async (idCompra, referencia) => {
        const result = await Swal.fire({
            title: `¿Eliminar Compra #${idCompra}?`,
            html: `<p>Ref: ${referencia || 'N/A'}</p><p class="text-red-600 font-bold mt-4">¡ADVERTENCIA CRÍTICA!</p><p class="text-red-500">Eliminar es PERMANENTE y NO revierte el stock. Se recomienda CANCELAR en su lugar.</p><p class="mt-3">¿Seguro que quieres eliminarla?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, ¡Eliminar!',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                await ComprasService.deleteCompra(idCompra);
                Swal.fire({ title: '¡Eliminada!', icon: 'success', timer: 1500, showConfirmButton: false });
                fetchData();
            } catch (error) {
                console.error('Error eliminando compra:', error);
                Swal.fire('Error', error.message || 'No se pudo eliminar la compra.', 'error');
            }
        }
    };

    // Renderizado
    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                    <FaFileInvoiceDollar className="mr-3 text-indigo-600" /> Historial de Compras
                </h1>
                <Link
                    to="/compras/crear"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg inline-flex items-center shadow-md transition duration-150 ease-in-out transform hover:-translate-y-px active:scale-95"
                >
                    <FaPlus className="mr-2" /> Nueva Compra
                </Link>
            </div>

            {/* Filtro de búsqueda */}
            <div className="mb-6">
                <div className="relative flex items-center">
                    <FaSearch className="absolute left-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por proveedor, referencia o estado..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* Indicadores de Carga y Error */}
            {loading && (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Cargando historial...</p>
                </div>
            )}
            {error && (
                <div className="text-center py-10 bg-red-50 p-6 rounded-lg border border-red-300 shadow-md">
                    <p className="text-red-700 font-semibold text-xl mb-3">¡Oops! Algo salió mal</p>
                    <p className="text-red-600 mb-5">{error}</p>
                    <button
                        onClick={fetchData}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-150 ease-in-out"
                    >
                        Reintentar Carga
                    </button>
                </div>
            )}

            {/* Mensaje si no hay datos */}
            {!loading && !error && filteredCompras.length === 0 && (
                <div className="text-center mt-8 py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <FaFileInvoiceDollar className="mx-auto text-gray-300 text-5xl mb-5" />
                    <p className="text-gray-500 text-xl mb-5">No hay compras que coincidan con la búsqueda.</p>
                    <Link to="/compras/crear" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center shadow-md transition duration-150 ease-in-out transform hover:-translate-y-px active:scale-95">
                        <FaPlus className="mr-2" /> Registrar Primera Compra
                    </Link>
                </div>
            )}

            {/* Tabla de Compras */}
            {!loading && !error && filteredCompras.length > 0 && (
                <>
                    <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {getCurrentPageItems().map((compra) => {
                                    const estadoActual = compra.estado_compra || 'Desconocido';
                                    const estadoInfo = estadosCompra[estadoActual] || estadosCompra['Desconocido'];
                                    const canDelete = true;
                                    const canEdit = estadoActual !== 'Cancelada';

                                    return (
                                        <tr key={compra.id_compra} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{compra.id_compra}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{compra.proveedor?.nombre || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{compra.numero_referencia || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(compra.fecha_compra)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-700">{formatCurrency(compra.total_compra)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                <span className={`estado-badge ${estadoInfo.bgColor} ${estadoInfo.textColor}`}>
                                                    {estadoInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                                <button onClick={() => handleVerDetalles(compra)} className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-full p-1.5 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150" title="Ver detalles"><FaEye size={18} /></button>
                                                {canEdit && (<button onClick={() => handleOpenEditModal(compra)} className="text-green-600 hover:text-green-900 hover:bg-green-100 rounded-full p-1.5 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150" title="Editar / Registrar Pago"><FaEdit size={16} /></button>)}
                                                {canDelete && (<button onClick={() => handleDeleteCompra(compra.id_compra, compra.numero_referencia)} className="text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full p-1.5 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150" title="Eliminar compra"><FaTrashAlt size={15} /></button>)}
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
                            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCompras.length)}-
                            {Math.min(currentPage * itemsPerPage, filteredCompras.length)} de {filteredCompras.length} compras
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded border ${
                                    currentPage === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-indigo-600 hover:bg-indigo-50"
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
                                                ? "bg-indigo-600 text-white"
                                                : "bg-white text-indigo-600 hover:bg-indigo-50"
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
                                        : "bg-white text-indigo-600 hover:bg-indigo-50"
                                }`}
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Modal de Edición */}
            {isEditModalOpen && editingCompra && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto"
                    onClick={handleCloseEditModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 md:p-8 my-8 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
                            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 leading-tight">
                                Editar / Registrar Pago<br/>
                                <span className="text-base font-normal text-gray-500">Compra #{editingCompra.id_compra}</span>
                            </h3>
                            <button onClick={handleCloseEditModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mt-2 -mr-2" aria-label="Cerrar"><FaTimes size={24} /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                            <div className="mb-6 p-4 border rounded-lg bg-gray-50 text-sm space-y-2 shadow-sm">
                                <div className="flex justify-between"><span>Total Compra:</span> <span className="font-medium">{formatCurrency(editingCompra.total_compra)}</span></div>
                                <div className="flex justify-between"><span>Pagado Actual:</span> <span className="font-medium">{formatCurrency(editingCompra.monto_pagado)}</span></div>
                                <div className="flex justify-between"><span>Saldo Pendiente:</span> <span className="font-bold text-red-600">{formatCurrency(editingCompra.total_compra - editingCompra.monto_pagado)}</span></div>
                                <div className="flex justify-between items-center"><span>Estado Actual:</span> <span className={`estado-badge ${estadosCompra[editingCompra.estado_compra]?.bgColor || 'bg-gray-100'} ${estadosCompra[editingCompra.estado_compra]?.textColor || 'text-gray-800'}`}>{estadosCompra[editingCompra.estado_compra]?.label || ' Chesterton'}</span></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
                                <div className="form-field">
                                    <label htmlFor="edit-proveedor" className="block text-sm font-medium text-gray-700 mb-1">Proveedor*</label>
                                    <select id="edit-proveedor" name="id_proveedor" value={editingCompra.id_proveedor || ''} onChange={handleEditHeaderChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2 px-3" required>
                                        <option value="" disabled>Seleccione...</option>
                                        {proveedoresList.map((prov) => (<option key={prov.id_proveedor} value={prov.id_proveedor}>{prov.nombre}</option>))}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label htmlFor="edit-referencia" className="block text-sm font-medium text-gray-700 mb-1">Nº Referencia</label>
                                    <input id="edit-referencia" type="text" name="numero_referencia" value={editingCompra.numero_referencia || ''} onChange={handleEditHeaderChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2 px-3" maxLength={50} />
                                </div>
                                <div className="form-field md:col-span-2">
                                    <label htmlFor="edit-abono" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                        <FaMoneyBillWave className="inline mr-2 text-green-600" /> Registrar Nuevo Pago (Abono)
                                    </label>
                                    <input id="edit-abono" type="number" name="abono" value={abonoAmount} onChange={handleAbonoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2 px-3" min="0" step="0.01" placeholder="0.00"/>
                                    {(parseFloat(abonoAmount || 0) > editingCompra.total_compra - editingCompra.monto_pagado) && (
                                        <p className="text-xs text-red-600 mt-1">El abono no puede exceder el saldo pendiente.</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-5 border-t border-gray-200">
                                <button type="button" className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out flex items-center justify-center text-sm font-medium shadow-sm w-full sm:w-auto order-2 sm:order-1" onClick={handleCloseEditModal} disabled={isSaving}>
                                    <FaTimes className="mr-2"/> Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out flex items-center justify-center text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2" disabled={isSaving || (parseFloat(abonoAmount || 0) + editingCompra.monto_pagado > editingCompra.total_compra + 0.001)}>
                                    {isSaving ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>) : (<FaSave className="mr-2" />)}
                                    {isSaving ? 'Guardando...' : 'Guardar / Registrar Pago'}
                                </button>
                            </div>
                        </form>
                        <style>{`
                            @keyframes modal-scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                            .animate-modal-scale-in { animation: modal-scale-in 0.2s ease-out forwards; }
                            .estado-badge { padding: 3px 10px; border-radius: 99px; font-weight: 500; font-size: 0.75rem; display: inline-block; line-height: 1.2; }
                            .bg-yellow-100 { background-color: #FEF9C3; } .text-yellow-800 { color: #854D0E; }
                            .bg-green-100 { background-color: #D1FAE5; } .text-green-800 { color: #065F46; }
                            .bg-blue-100 { background-color: #DBEAFE; } .text-blue-800 { color: #1E40AF; }
                            .bg-red-100 { background-color: #FEE2E2; } .text-red-800 { color: #991B1B; }
                            .bg-gray-100 { background-color: #F3F4F6; } .text-gray-800 { color: #1F2937; }
                        `}</style>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaCompras;