import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaSearch,
    FaFilter,
    FaFileDownload,
    FaCircle,
    FaEye,
    FaCalendarAlt,
    FaFileInvoiceDollar,
    FaMoneyBillWave,
    FaTimes,
    FaBox,
    FaUser,
    FaMapMarkerAlt,
    FaPhone,
    FaSpinner
} from 'react-icons/fa';
import VentasService from '../../services/ventasServices';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const Ventas = () => {
    const { referencia } = useParams();
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('');
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [estadoPago, setEstadoPago] = useState(null);
    const [consultandoPago, setConsultandoPago] = useState(false);

    useEffect(() => {
        if (referencia) {
            consultarEstadoPago(referencia);
        } else {
            cargarVentas();
        }
    }, [referencia]);

    const consultarEstadoPago = async (ref) => {
        try {
            setConsultandoPago(true);
            console.log('Consultando estado del pago para referencia:', ref);
            const resultado = await VentasService.consultarEstadoPagoPorReferencia(ref);
            console.log('Resultado de la consulta:', resultado);

            if (resultado.success && resultado.datosCompra) {
                setEstadoPago({ ...resultado.datosCompra, estado: 'APROBADO' });
                Swal.fire({
                    icon: 'success',
                    title: '¡Pago Exitoso!',
                    text: 'Tu compra ha sido procesada correctamente',
                    timer: 3000,
                    showConfirmButton: false
                }).then(() => {
                    cargarVentas(); // Recargar la lista de ventas
                });
            } else {
                const mensajeEstado = resultado.mensaje || 'El pago no pudo ser procesado';
                const detallesEstado = resultado.detalles ? 
                    `\nMonto: ${resultado.detalles.monto/100} COP\nFecha: ${new Date(resultado.detalles.fecha_creacion).toLocaleString()}` : '';

                if (resultado.estado === 'PENDIENTE') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Procesando Pago',
                        text: mensajeEstado,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    // Consultar nuevamente en 5 segundos
                    setTimeout(() => consultarEstadoPago(ref), 5000);
                    return;
                }

                setEstadoPago({ estado: resultado.estado, mensaje: mensajeEstado, detalles: resultado.detalles });
                await Swal.fire({
                    icon: 'error',
                    title: 'Estado del Pago',
                    text: mensajeEstado,
                    footer: detallesEstado ? `<small>${detallesEstado}</small>` : '',
                    confirmButtonText: 'Volver a la lista',
                    showCancelButton: true,
                    cancelButtonText: 'Intentar nuevamente'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/ventas');
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        consultarEstadoPago(ref);
                    }
                });
            }
        } catch (error) {
            console.error('Error al consultar el pago:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener la información del pago',
                confirmButtonText: 'Volver a la lista',
                footer: '<small>Si el problema persiste, por favor contacta a soporte</small>'
            }).then(() => {
                navigate('/ventas');
            });
        } finally {
            setConsultandoPago(false);
        }
    };

    const cargarVentas = async () => {
        try {
            setLoading(true);
            const response = await VentasService.getAllVentas();
            setVentas(response.ventas || []);
            setError(null);
        } catch (err) {
            setError('Error al cargar las ventas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    };

    const getEstadoColor = (estado) => {
        const estados = {
            'Completada': 'text-green-600',
            'Pendiente': 'text-yellow-600',
            'Cancelada': 'text-red-600'
        };
        return estados[estado] || 'text-gray-600';
    };

    const exportarVentas = () => {
        const ventasParaExportar = ventasFiltradas.map(venta => ({
            'Número de Orden': venta.id_venta,
            'Fecha': formatearFecha(venta.fecha_venta),
            'Cliente': venta.nombre_cliente,
            'Teléfono': venta.telefono_cliente,
            'Dirección': venta.direccion_cliente,
            'Ciudad': venta.ciudad_cliente,
            'Estado': venta.estado_venta,
            'Total': formatearMoneda(venta.total_venta),
            'Productos': venta.detalles?.map(d => `${d.cantidad}x ${d.producto.nombre}`).join(', ') || ''
        }));

        const ws = XLSX.utils.json_to_sheet(ventasParaExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");
        XLSX.writeFile(wb, "Reporte_Ventas.xlsx");
    };

    const ventasFiltradas = ventas.filter(venta => {
        const coincideFiltro = 
            venta.nombre_cliente?.toLowerCase().includes(filtro.toLowerCase()) ||
            venta.id_venta?.toString().includes(filtro);
        
        const coincideEstado = !estadoFiltro || venta.estado_venta === estadoFiltro;
        
        const fechaVenta = new Date(venta.fecha_venta);
        const coincideFechas = (!fechaInicio || fechaVenta >= new Date(fechaInicio)) &&
                              (!fechaFin || fechaVenta <= new Date(fechaFin));
        
        return coincideFiltro && coincideEstado && coincideFechas;
    });

    if (consultandoPago) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Procesando tu pago</h2>
                    <p className="text-gray-600">Por favor, espera mientras verificamos el estado de tu transacción...</p>
                    <p className="text-sm text-gray-500 mt-4">Referencia: {referencia}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="text-red-600 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate flex items-center">
                            <FaFileInvoiceDollar className="h-8 w-8 text-indigo-600 mr-3" />
                            Gestión de Ventas
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Administra y visualiza todas las ventas realizadas
                        </p>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <button 
                            onClick={exportarVentas}
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FaFileDownload className="mr-2" />
                            Exportar a Excel
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Buscar por cliente o #orden"
                                    value={filtro}
                                    onChange={(e) => setFiltro(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Inicio
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaCalendarAlt className="text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Fin
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaCalendarAlt className="text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="Completada">Completada</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lista de Ventas */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Orden
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {ventasFiltradas.map((venta) => (
                                    <tr key={venta.id_venta} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{venta.id_venta}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {venta.nombre_cliente}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {venta.telefono_cliente}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatearFecha(venta.fecha_venta)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatearMoneda(venta.total_venta)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(venta.estado_venta)}`}>
                                                <FaCircle className="mr-1 h-2 w-2" />
                                                {venta.estado_venta}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button 
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                onClick={() => setVentaSeleccionada(venta)}
                                            >
                                                <FaEye className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mensaje si no hay ventas */}
                {ventasFiltradas.length === 0 && (
                    <div className="text-center py-12">
                        <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ventas</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No se encontraron ventas que coincidan con los filtros aplicados.
                        </p>
                    </div>
                )}

                {/* Modal de Detalles de Venta */}
                {ventaSeleccionada && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <FaFileInvoiceDollar className="h-6 w-6 text-indigo-600 mr-2" />
                                    Detalles de la Venta #{ventaSeleccionada.id_venta}
                                </h3>
                                <button
                                    onClick={() => setVentaSeleccionada(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FaTimes className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Información del Cliente */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <FaUser className="mr-2 text-indigo-600" />
                                        Información del Cliente
                                    </h4>
                                    <div className="space-y-2">
                                        <p className="flex items-center text-sm">
                                            <span className="font-medium mr-2">Nombre:</span>
                                            {ventaSeleccionada.nombre_cliente}
                                        </p>
                                        <p className="flex items-center text-sm">
                                            <FaPhone className="mr-2 text-gray-400" />
                                            {ventaSeleccionada.telefono_cliente}
                                        </p>
                                        <p className="flex items-center text-sm">
                                            <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                            {ventaSeleccionada.direccion_cliente}, {ventaSeleccionada.ciudad_cliente}
                                        </p>
                                    </div>
                                </div>

                                {/* Información de la Venta */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <FaMoneyBillWave className="mr-2 text-indigo-600" />
                                        Información de la Venta
                                    </h4>
                                    <div className="space-y-2">
                                        <p className="flex items-center text-sm">
                                            <span className="font-medium mr-2">Fecha:</span>
                                            {formatearFecha(ventaSeleccionada.fecha_venta)}
                                        </p>
                                        <p className="flex items-center text-sm">
                                            <span className="font-medium mr-2">Estado:</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(ventaSeleccionada.estado_venta)}`}>
                                                <FaCircle className="mr-1 h-2 w-2" />
                                                {ventaSeleccionada.estado_venta}
                                            </span>
                                        </p>
                                        <p className="flex items-center text-sm">
                                            <span className="font-medium mr-2">Total:</span>
                                            <span className="text-lg font-bold text-indigo-600">
                                                {formatearMoneda(ventaSeleccionada.total_venta)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Detalles de Productos */}
                                <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <FaBox className="mr-2 text-indigo-600" />
                                        Productos
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {ventaSeleccionada.detalles?.map((detalle, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {detalle.producto.nombre}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {detalle.cantidad}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatearMoneda(detalle.precio_unitario)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatearMoneda(detalle.cantidad * detalle.precio_unitario)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Notas */}
                                {ventaSeleccionada.notas_cliente && (
                                    <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">Notas</h4>
                                        <p className="text-sm text-gray-600">{ventaSeleccionada.notas_cliente}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ventas;
