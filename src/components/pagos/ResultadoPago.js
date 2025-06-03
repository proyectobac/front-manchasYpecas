// ResultadoPago.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VentasService from '../../services/ventasServices'; // Asegúrate que la ruta sea correcta
import {
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaShoppingBag,
    FaUser,
    FaMapMarkerAlt,
    FaPhone,
    FaMoneyBillWave,
    FaSpinner,
    FaEnvelope,
    FaIdCard
} from 'react-icons/fa';

const ResultadoPago = () => {
    const { referencia } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true); // Para el spinner inicial
    const [estadoPago, setEstadoPago] = useState(null); // 'PENDIENTE', 'APROBADO', etc.
    const [datosPago, setDatosPago] = useState(null); // Objeto con detalles del pago
    const [actualizandoEstado, setActualizandoEstado] = useState(false); // Para el spinner de reintento

    const intentosConsulta = useRef(0);
    const timeoutRef = useRef(null);
    const MAX_INTENTOS = 60; // ej. 60 reintentos * 5 segundos = 5 minutos

    // Función que realmente llama al servicio y actualiza estados locales
    const fetchAndSetPaymentStatus = useCallback(async () => {
        // No reiniciar 'loading' a true aquí si ya tenemos 'datosPago',
        // para no ocultar la información ya mostrada.
        // 'actualizandoEstado' se usará para el spinner de reintento.

        try {
            console.log(`[Intento ${intentosConsulta.current + 1}] Consultando estado para referencia:`, referencia);
            const resultadoBackend = await VentasService.consultarEstadoPagoPorReferencia(referencia);
            console.log(`[Intento ${intentosConsulta.current + 1}] Respuesta del backend:`, resultadoBackend);

            if (resultadoBackend && resultadoBackend.success && resultadoBackend.pago) {
                const pagoInfo = resultadoBackend.pago;
                setDatosPago({ // Mapea los datos del backend a la estructura que usa la UI
                    referencia: pagoInfo.referencia_pago_interna || pagoInfo.referencia,
                    monto: pagoInfo.monto,
                    fecha_creacion: pagoInfo.fecha_creacion,
                    metodo_pago: pagoInfo.metodo_pago,
                    datos_cliente: pagoInfo.datos_cliente, // Este es el objeto JSON de cliente
                    items: pagoInfo.items || [],         // Este es el array JSON de items
                    // Campos adicionales que tu UI podría necesitar directamente
                    estadoActual: pagoInfo.estado // Guardamos el estado aquí también si es útil
                });
                setEstadoPago(pagoInfo.estado); // Actualiza el estado general del pago
                return pagoInfo.estado; // Devuelve para la lógica de reintento
            } else {
                // Si success es false, o no hay 'pago'
                console.warn(`[Intento ${intentosConsulta.current + 1}] Consulta no exitosa o sin datos de pago:`, resultadoBackend);
                setEstadoPago(resultadoBackend?.estado || 'ERROR_CONSULTA'); // Usa el estado si viene, sino un error
                return resultadoBackend?.estado || 'ERROR_CONSULTA';
            }
        } catch (error) { // Error en la propia llamada a VentasService (debería ser raro si VentasService maneja sus errores)
            console.error(`[Intento ${intentosConsulta.current + 1}] Error catastrófico en fetchAndSetPaymentStatus:`, error);
            setEstadoPago('ERROR_CATASTROFICO');
            return 'ERROR_CATASTROFICO';
        }
    }, [referencia]);


   // ResultadoPago.js

// ... (otros useState, useCallback, etc.)

useEffect(() => {
    let isMounted = true;
    if (intentosConsulta.current === 0) { // Solo mostrar spinner principal en el primerísimo intento
        setLoading(true);
    }

    const consultarYProgramar = async () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Mover el incremento aquí, ANTES de la llamada async
        // y solo si no hemos alcanzado el máximo.
        // Esto asegura que para la siguiente iteración el contador ya esté actualizado.
        if (intentosConsulta.current < MAX_INTENTOS) {
            intentosConsulta.current += 1; // Incrementar para el intento actual
        } else {
            if (isMounted) {
                setActualizandoEstado(false);
                if (loading) setLoading(false);
            }
            return; // Alcanzó el máximo de intentos
        }
        
        // Para el mensaje, usamos el valor ANTES del incremento para mostrar "Intento 1..."
        // o podemos pasar el valor actual. Voy a ajustar el mensaje para ser más claro.
        console.log(`Iniciando intento ${intentosConsulta.current} de ${MAX_INTENTOS}`);
        if (isMounted) setActualizandoEstado(true); // Mostrar spinner de reintento

        const estadoObtenido = await fetchAndSetPaymentStatus();

        if (!isMounted) return;

        if (loading) setLoading(false); // Quitar spinner principal si aún estaba activo

        if (estadoObtenido === 'PENDIENTE' && intentosConsulta.current < MAX_INTENTOS) {
            // Ya incrementamos, solo programamos el siguiente
            timeoutRef.current = setTimeout(consultarYProgramar, 5000);
        } else {
            // Detener si no es PENDIENTE o se agotaron intentos
            setActualizandoEstado(false);
        }
    };

    intentosConsulta.current = 0; // Reiniciar contador al montar el componente
    consultarYProgramar(); // Iniciar la primera consulta

    return () => {
        isMounted = false;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActualizandoEstado(false); // Asegurar que se quite el spinner al desmontar
    };
}, [fetchAndSetPaymentStatus]); // Eliminamos 'loading' de las dependencias para evitar re-ejecuciones no deseadas.
                                 // fetchAndSetPaymentStatus (que depende de 'referencia') es la dependencia principal.// 'loading' aquí ayuda a que se dispare solo una vez al inicio si no cambia

    const formatearMoneda = (valor) => {
        if (typeof valor !== 'number' || isNaN(valor)) return '$ 0';
         // Asumiendo que el monto viene en centavos desde el backend
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(valor / 100);
    };

    const getEstadoInfo = () => {
        // ... (esta función permanece igual que en tu código o mi versión anterior)
        switch (estadoPago) {
            case 'APROBADO':
                return {
                    icon: <FaCheckCircle className="w-16 h-16 text-green-500" />,
                    title: '¡Pago Exitoso!',
                    message: 'Tu compra ha sido procesada correctamente.',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50'
                };
            case 'PENDIENTE':
                return {
                    icon: <FaClock className="w-16 h-16 text-yellow-500" />,
                    title: 'Pago en Proceso',
                    message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50'
                };
            case 'RECHAZADO':
                 return {
                    icon: <FaTimesCircle className="w-16 h-16 text-red-500" />,
                    title: 'Pago Rechazado',
                    message: 'Tu pago fue rechazado. Por favor, intenta con otro método o contacta a tu banco.',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50'
                };
            default: // Incluye 'ERROR_CONSULTA', 'ERROR_INESPERADO_FORMATO', 'ERROR_CATASTROFICO_SERVICIO', etc.
                return {
                    icon: <FaTimesCircle className="w-16 h-16 text-red-500" />,
                    title: 'Estado del Pago', // Título más neutro para errores
                    message: `No se pudo confirmar el estado final de tu pago en este momento. Referencia: ${referencia}. Contacta a soporte si el problema persiste.`,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50'
                };
        }
    };

    if (loading && !datosPago) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-lg text-center">
                    <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Verificando el estado de tu pago...</p>
                </div>
            </div>
        );
    }

    const estadoInfo = getEstadoInfo();

    // Si NO hay datosPago Y (la carga terminó Y el estado no es algo que esperamos que muestre datos luego)
    if (!datosPago && !loading && estadoPago !== 'PENDIENTE' && estadoPago !== 'APROBADO') {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 text-center">
                    <div className="mx-auto flex justify-center mb-4">{estadoInfo.icon}</div>
                    <h2 className={`text-2xl font-bold ${estadoInfo.color}`}>{estadoInfo.title}</h2>
                    <p className="mt-2 text-gray-600">{estadoInfo.message}</p>
                    <button
                        onClick={() => navigate('/tienda')}
                        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        Volver a la Tienda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className={`p-6 text-center border-b border-gray-200 ${estadoInfo.bgColor}`}>
                        <div className="mx-auto flex justify-center items-center mb-4">
                            {estadoInfo.icon}
                            {actualizandoEstado && estadoPago === 'PENDIENTE' && (
                                <FaSpinner className="w-6 h-6 text-yellow-500 animate-spin ml-3" />
                            )}
                        </div>
                        <h2 className={`text-2xl font-bold ${estadoInfo.color}`}>{estadoInfo.title}</h2>
                        <p className="mt-1 text-gray-600">{estadoInfo.message}</p>
                        {actualizandoEstado && estadoPago === 'PENDIENTE' && (
                            <p className="mt-2 text-sm text-yellow-600">
                                Verificando actualización... (Intento {intentosConsulta.current} de {MAX_INTENTOS})
                            </p>
                        )}
                    </div>

                    {/* Mostrar detalles solo si datosPago existe */}
                    {datosPago && (
                        <div className="p-6 bg-white">
                            <div className="mb-6">
                                <p className="text-sm text-gray-500">Referencia de Orden</p>
                                <p className="text-lg font-semibold">{datosPago.referencia}</p>
                                {datosPago.fecha_creacion && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Fecha: {new Date(datosPago.fecha_creacion).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}
                                    </p>
                                )}
                            </div>

                            {datosPago.datos_cliente && ( // Verifica que datos_cliente exista
                                <div className="mb-6 border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                                        <FaUser className="mr-2 text-indigo-600" /> Información del Cliente
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                        <p><strong className="text-gray-600">Nombre:</strong> {datosPago.datos_cliente.nombre}</p>
                                        <p><strong className="text-gray-600">Email:</strong> {datosPago.datos_cliente.email}</p>
                                        <p><strong className="text-gray-600">Teléfono:</strong> {datosPago.datos_cliente.telefono}</p>
                                        <p><strong className="text-gray-600">Documento:</strong> {datosPago.datos_cliente.tipo_documento} {datosPago.datos_cliente.documento}</p>
                                        <p className="md:col-span-2"><strong className="text-gray-600">Dirección:</strong> {datosPago.datos_cliente.direccion}, {datosPago.datos_cliente.ciudad}</p>
                                        {datosPago.datos_cliente.notasAdicionales && (
                                            <p className="md:col-span-2"><strong className="text-gray-600">Notas:</strong> {datosPago.datos_cliente.notasAdicionales}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {datosPago.items && datosPago.items.length > 0 && (
                                <div className="mb-6 border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                                        <FaShoppingBag className="mr-2 text-indigo-600" /> Resumen de la Orden
                                    </h3>
                                    <div className="space-y-3">
                                        {datosPago.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-md text-sm">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{item.nombre_producto || item.nombre}</p>
                                                    <p className="text-gray-600">Cantidad: {item.cantidad}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-800">{formatearMoneda(item.subtotal)}</p>
                                                    <p className="text-gray-600 text-xs">({formatearMoneda(item.precio_unitario || item.precioVenta)} c/u)</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-lg font-medium text-gray-700">Método de pago:</p>
                                    <p className="text-lg font-medium text-gray-900">{datosPago.metodo_pago}</p>
                                </div>
                                <div className="flex justify-between items-center font-bold">
                                    <p className="text-xl text-gray-700">TOTAL ORDEN:</p>
                                    <p className="text-2xl text-indigo-600">{formatearMoneda(datosPago.monto)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-end">
                            <button
                                onClick={() => navigate('/tienda')}
                                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors">
                                Volver a la Tienda
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultadoPago;