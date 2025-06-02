import React, { useState, useEffect } from 'react';
import {
    FaShoppingCart, FaUsers, FaBoxOpen, FaChartLine,
    FaMoneyBillWave, FaPaw, FaCalendarCheck, FaExclamationTriangle,
    FaFileInvoiceDollar, FaClock, FaCheckCircle
} from 'react-icons/fa';
import ProductosService from '../../services/productosService';
import ComprasService from '../../services/comprasService';
import axios from 'axios';

// Constantes para estados de compra
const ESTADOS_COMPRA = {
    'Pendiente de Pago': { label: 'Pendiente Pago', color: 'yellow' },
    'Pagada': { label: 'Pagada', color: 'green' },
    'Pagado Parcial': { label: 'Pago Parcial', color: 'blue' },
    'Pago parcial': { label: 'Pago Parcial', color: 'blue' },
    'Cancelada': { label: 'Cancelada', color: 'red' },
    'Desconocido': { label: 'Desconocido', color: 'gray' }
};

// Constantes para estados de stock
const ESTADOS_STOCK = {
    CRITICO: { min: 0, max: 5, label: 'Stock Crítico', color: 'red' },
    BAJO: { min: 6, max: 15, label: 'Stock Moderado', color: 'yellow' },
    NORMAL: { min: 16, max: 20, label: 'Stock Bueno', color: 'green' },
    ALTO: { min: 21, max: Infinity, label: 'Stock Óptimo', color: 'blue' }
};

const getEstadoStock = (stock) => {
    if (stock <= ESTADOS_STOCK.CRITICO.max) return ESTADOS_STOCK.CRITICO;
    if (stock <= ESTADOS_STOCK.BAJO.max) return ESTADOS_STOCK.BAJO;
    if (stock <= ESTADOS_STOCK.NORMAL.max) return ESTADOS_STOCK.NORMAL;
    return ESTADOS_STOCK.ALTO;
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalVentas: 0,
        totalProductos: 0,
        totalUsuarios: 0,
        ventasHoy: 0,
        productosAgotados: 0,
        ventasRecientes: [],
        productosPopulares: [],
        estadisticasMensuales: [],
        compras: {
            total: 0,
            pagadas: 0,
            pendientes: 0,
            parciales: 0,
            recientes: []
        }
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatCurrency = (value) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numericValue) || numericValue === null || numericValue === undefined) {
            return '$ 0';
        }
        return new Intl.NumberFormat('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        }).format(numericValue);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Obtener datos de productos usando el método correcto
                const productosResponse = await ProductosService.getAllProductos();
                const productos = productosResponse.productos || [];
                
                // Obtener datos de ventas
                const ventasResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/ventas/ventas`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const ventas = ventasResponse.data.ventas || [];
                
                // Obtener datos de usuarios
                const usuariosResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/usuarios/usuario`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const usuarios = usuariosResponse.data.usuarios || [];

                // Obtener datos de compras
                const comprasResponse = await ComprasService.getAllCompras();
                const compras = comprasResponse.compras || [];

                // Analizar estados de las compras (considerando ambas variantes de "pago parcial")
                const comprasStats = {
                    total: compras.length,
                    pagadas: compras.filter(c => c.estado_compra === 'Pagada').length,
                    pendientes: compras.filter(c => c.estado_compra === 'Pendiente de Pago').length,
                    parciales: compras.filter(c => 
                        c.estado_compra === 'Pagado Parcial' || 
                        c.estado_compra === 'Pago parcial'
                    ).length,
                    recientes: compras
                        .sort((a, b) => new Date(b.fecha_compra) - new Date(a.fecha_compra))
                        .slice(0, 5)
                        .map(compra => ({
                            ...compra,
                            estado_label: ESTADOS_COMPRA[compra.estado_compra]?.label || 'Desconocido'
                        }))
                };

                // Productos con análisis de stock
                const todosLosProductos = productos.map(producto => ({
                    ...producto,
                    estadoStock: getEstadoStock(producto.stock)
                }));

                // Obtener productos por cada estado
                const productosCriticos = todosLosProductos
                    .filter(p => p.stock <= ESTADOS_STOCK.CRITICO.max)
                    .slice(0, 3);
                
                const productosModerdados = todosLosProductos
                    .filter(p => p.stock > ESTADOS_STOCK.CRITICO.max && p.stock <= ESTADOS_STOCK.BAJO.max)
                    .slice(0, 3);
                
                const productosBuenos = todosLosProductos
                    .filter(p => p.stock > ESTADOS_STOCK.BAJO.max)
                    .slice(0, 3);

                // Combinar todos los productos
                const productosBajoStock = [
                    ...productosCriticos,
                    ...productosModerdados,
                    ...productosBuenos
                ].sort((a, b) => {
                    const prioridad = {
                        'Stock Crítico': 1,
                        'Stock Moderado': 2,
                        'Stock Bueno': 3,
                        'Stock Óptimo': 4
                    };
                    const prioridadA = prioridad[a.estadoStock.label];
                    const prioridadB = prioridad[b.estadoStock.label];
                    
                    if (prioridadA !== prioridadB) {
                        return prioridadA - prioridadB;
                    }
                    return a.stock - b.stock;
                });

                const productosAgotados = productos.filter(p => p.stock <= ESTADOS_STOCK.CRITICO.max).length;
                const ventasHoy = ventas.filter(v => 
                    new Date(v.fecha_venta).toDateString() === new Date().toDateString()
                ).length;

                const ventasRecientes = ventas
                    .sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta))
                    .slice(0, 5)
                    .map(venta => ({
                        id_venta: venta.id_venta,
                        fecha_venta: venta.fecha_venta,
                        total_venta: venta.total_venta,
                        estado_venta: venta.estado_venta,
                        nombre_cliente: venta.nombre_cliente,
                        telefono_cliente: venta.telefono_cliente,
                        direccion_cliente: venta.direccion_cliente,
                        ciudad_cliente: venta.ciudad_cliente,
                        notas_cliente: venta.notas_cliente,
                        detalles: venta.detalles
                    }));

                setStats({
                    totalVentas: ventasResponse.data.total || 0,
                    totalProductos: productos.length,
                    totalUsuarios: usuarios.length,
                    ventasHoy,
                    productosAgotados,
                    ventasRecientes,
                    productosPopulares: productosBajoStock,
                    estadisticasMensuales: calcularEstadisticasMensuales(ventas),
                    compras: comprasStats
                });
            } catch (err) {
                console.error('Error detallado:', err);
                setError('Error al cargar los datos del dashboard: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const calcularEstadisticasMensuales = (ventas) => {
        const ultimosMeses = [];
        const hoy = new Date();
        for (let i = 0; i < 6; i++) {
            const mes = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            const ventasDelMes = ventas.filter(v => {
                const fechaVenta = new Date(v.fecha_venta);
                return fechaVenta.getMonth() === mes.getMonth() &&
                       fechaVenta.getFullYear() === mes.getFullYear();
            });
            ultimosMeses.push({
                mes: mes.toLocaleString('default', { month: 'short' }),
                ventas: ventasDelMes.length,
                ingresos: ventasDelMes.reduce((acc, v) => acc + parseFloat(v.total_venta), 0)
            });
        }
        return ultimosMeses.reverse();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-100">
                <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-100">
                <div className="text-red-600 text-xl font-semibold">
                    <FaExclamationTriangle className="inline-block mr-2" />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Bienvenido al panel de control de Manchas y Pecas
                    </p>
                </div>

                {/* Tarjetas de estadísticas principales */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaShoppingCart className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Ventas Totales
                                        </dt>
                                        <dd className="text-2xl font-semibold text-gray-900">
                                            {stats.totalVentas}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaBoxOpen className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Productos
                                        </dt>
                                        <dd className="text-2xl font-semibold text-gray-900">
                                            {stats.totalProductos}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaUsers className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Usuarios
                                        </dt>
                                        <dd className="text-2xl font-semibold text-gray-900">
                                            {stats.totalUsuarios}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaCalendarCheck className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Ventas Hoy
                                        </dt>
                                        <dd className="text-2xl font-semibold text-gray-900">
                                            {stats.ventasHoy}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estado de Compras */}
                <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FaFileInvoiceDollar className="mr-2 text-purple-600" />
                        Estado de Compras
                    </h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <FaShoppingCart className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Compras
                                            </dt>
                                            <dd className="text-2xl font-semibold text-gray-900">
                                                {stats.compras.total}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <FaCheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Compras Pagadas
                                            </dt>
                                            <dd className="text-2xl font-semibold text-gray-900">
                                                {stats.compras.pagadas}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <FaClock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Pagos Pendientes
                                            </dt>
                                            <dd className="text-2xl font-semibold text-gray-900">
                                                {stats.compras.pendientes}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <FaMoneyBillWave className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Pagos Parciales
                                            </dt>
                                            <dd className="text-2xl font-semibold text-gray-900">
                                                {stats.compras.parciales}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compras Recientes */}
                    <div className="mt-6 bg-white shadow rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                <FaFileInvoiceDollar className="mr-2 text-purple-600" />
                                Compras Recientes
                            </h3>
                            <div className="mt-5">
                                <div className="flow-root">
                                    <ul className="-my-5 divide-y divide-gray-200">
                                        {stats.compras.recientes.map((compra) => (
                                            <li key={compra.id_compra} className="py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            Compra #{compra.id_compra}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(compra.fecha_compra).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-sm font-medium text-indigo-600 mt-1">
                                                            Proveedor: {compra.proveedor?.nombre || 'No especificado'}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            compra.estado_compra === 'Pagada' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : compra.estado_compra === 'Pagado Parcial' || compra.estado_compra === 'Pago parcial'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {compra.estado_label}
                                                        </span>
                                                        {(compra.estado_compra === 'Pagado Parcial' || compra.estado_compra === 'Pago parcial' || compra.estado_compra === 'Pendiente de Pago') && (
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                <span>Total: {formatCurrency(compra.total_compra)}</span>
                                                                {(compra.estado_compra === 'Pagado Parcial' || compra.estado_compra === 'Pago parcial') && (
                                                                    <span className="ml-2 text-red-600">
                                                                        Pendiente: {formatCurrency(compra.total_compra - (compra.monto_pagado || 0))}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {compra.estado_compra === 'Pagada' && (
                                                            <div className="mt-1 text-sm font-medium text-gray-900">
                                                                {formatCurrency(compra.total_compra)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráficos y tablas */}
                <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Estado de Stock de Productos */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                <FaPaw className="mr-2 text-orange-600" />
                                Estado de Stock de Productos
                            </h3>
                            <div className="mt-5">
                                <div className="flow-root">
                                    <ul className="-my-5 divide-y divide-gray-200">
                                        {stats.productosPopulares.map((producto) => (
                                            <li key={producto.id_producto} className="py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                                                            producto.estadoStock.color === 'red' 
                                                                ? 'bg-red-100 text-red-800'
                                                                : producto.estadoStock.color === 'yellow'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : producto.estadoStock.color === 'green'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {producto.stock}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {producto.nombre}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Categoría: {producto.categoria || 'No especificada'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            producto.estadoStock.color === 'red' 
                                                                ? 'bg-red-100 text-red-800'
                                                                : producto.estadoStock.color === 'yellow'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : producto.estadoStock.color === 'green'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {producto.estadoStock.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ventas Recientes */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                <FaMoneyBillWave className="mr-2 text-green-600" />
                                Ventas Recientes
                            </h3>
                            <div className="mt-5">
                                <div className="flow-root">
                                    <ul className="-my-3 divide-y divide-gray-200">
                                        {stats.ventasRecientes.map((venta) => (
                                            <li key={venta.id_venta} className="py-3">
                                                <div className="flex flex-col space-y-2">
                                                    {/* Encabezado y estado */}
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-lg font-medium text-gray-900">
                                                                Orden #{venta.id_venta}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(venta.fecha_venta).toLocaleDateString('es-ES', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            venta.estado_venta === 'Completada' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {venta.estado_venta}
                                                        </span>
                                                    </div>

                                                    {/* Info del cliente y productos en una línea */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="text-sm">
                                                            <span className="text-gray-500">Cliente: </span>
                                                            <span className="font-medium text-gray-900">{venta.nombre_cliente}</span>
                                                            <span className="text-gray-500 ml-2">Tel: </span>
                                                            <span className="text-gray-900">{venta.telefono_cliente}</span>
                                                        </div>
                                                        <div className="text-sm text-right">
                                                            <span className="text-gray-500">Dirección: </span>
                                                            <span className="text-gray-900">{venta.direccion_cliente}, {venta.ciudad_cliente}</span>
                                                        </div>
                                                    </div>

                                                    {/* Productos y total */}
                                                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                        <div className="text-sm">
                                                            <span className="text-gray-500">Productos: </span>
                                                            {venta.detalles?.map((detalle, idx) => (
                                                                <span key={idx} className="text-gray-900">
                                                                    {detalle.cantidad}x {detalle.producto.nombre}
                                                                    {idx < venta.detalles.length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm text-gray-500 mr-2">Total:</span>
                                                            <span className="font-semibold text-indigo-600">
                                                                {formatCurrency(venta.total_venta)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Notas del cliente si existen */}
                                                    {venta.notas_cliente && (
                                                        <div className="text-sm text-gray-500 italic">
                                                            Nota: {venta.notas_cliente}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas Mensuales */}
                <div className="mt-8">
                    <div className="bg-white shadow rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                <FaChartLine className="mr-2 text-blue-600" />
                                Estadísticas Mensuales
                            </h3>
                            <div className="mt-5">
                                <div className="grid grid-cols-6 gap-4">
                                    {stats.estadisticasMensuales.map((estadistica, index) => (
                                        <div key={index} className="text-center">
                                            <div className="text-sm font-medium text-gray-500">
                                                {estadistica.mes}
                                            </div>
                                            <div className="mt-1">
                                                <div className="text-2xl font-semibold text-indigo-600">
                                                    {estadistica.ventas}
                                                </div>
                                                <div className="text-xs text-gray-500">ventas</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alertas y Notificaciones */}
                {stats.productosAgotados > 0 && (
                    <div className="mt-8">
                        <div className="rounded-md bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FaExclamationTriangle className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Alerta de Inventario
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            {stats.productosAgotados} productos están con stock bajo o agotado.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 