// src/components/PaymentStatusPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaHome, FaStore } from 'react-icons/fa';
// Asume que tienes un servicio para consultar el estado del pago en tu backend
// Este servicio debe llamar a tu endpoint /api/pagos/estado/:referencia o /api/pagos/pse/estado/:referencia
import VentasService from '../services/ventasServices'; // Ajusta la ruta si es necesario
import ResumenCompra from './tienda/ResumenCompra';

const PaymentStatusPage = () => {
    const { referencia } = useParams();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            if (!referencia) {
                setError('No se proporcionó una referencia de pago.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);

            // Verificar si estamos en modo de prueba
            const isTestMode = process.env.REACT_APP_PAYMENT_TEST_MODE === 'true';

            try {
                if (isTestMode) {
                    // Simulación de pago exitoso para pruebas
                    const orderDetails = JSON.parse(localStorage.getItem('lastOrderDetails') || '{}');
                    const mockPaymentDetails = {
                        estado: 'APROBADO',
                        referencia_pago_interna: referencia,
                        monto: localStorage.getItem('lastOrderAmount'),
                        fecha_creacion: new Date().toISOString(),
                        metodo_pago: 'PSE',
                        datos_cliente: orderDetails,
                        items: JSON.parse(localStorage.getItem('lastOrderItems') || '[]'),
                        id_venta_pre: orderDetails.id_venta_pre
                    };
                    
                    setPaymentDetails(mockPaymentDetails);
                    setPaymentStatus('APROBADO');
                } else {
                    // Código original para producción
                    const response = await VentasService.consultarEstadoPagoPorReferencia(referencia);
                    if (response && response.success && response.pago) {
                        setPaymentStatus(response.pago.estado);
                        setPaymentDetails(response.pago);
                        if (response.pago.estado === 'APROBADO') {
                            localStorage.removeItem('cart');
                            localStorage.removeItem('pendingOrder');
                        }
                    } else {
                        throw new Error(response.error || 'No se pudo obtener el estado del pago.');
                    }
                }

                // Limpiar datos temporales en ambos casos
                localStorage.removeItem('cart');
                localStorage.removeItem('lastOrderAmount');
                localStorage.removeItem('lastOrderDetails');
                localStorage.removeItem('lastOrderItems');
                localStorage.removeItem('pendingOrder');

            } catch (err) {
                console.error("Error al verificar el estado del pago:", err);
                setError(err.message || 'Ocurrió un error al verificar tu pago.');
                setPaymentStatus('ERROR');
            } finally {
                setLoading(false);
            }
        };

        checkPaymentStatus();
    }, [referencia]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <FaSpinner className="text-6xl text-indigo-600 animate-spin mb-6" />
                <h1 className="text-2xl font-semibold text-gray-700">Verificando estado de tu pago...</h1>
                <p className="text-gray-500">Por favor, espera un momento.</p>
            </div>
        );
    }

    // Mostrar el resumen de compra si tenemos los detalles del pago
    if (paymentDetails) {
        return (
            <ResumenCompra
                datosCompra={{
                    cliente: paymentDetails.datos_cliente,
                    items: paymentDetails.items,
                    total: paymentDetails.monto,
                    metodoPago: paymentDetails.metodo_pago,
                    referenciaPago: paymentDetails.referencia_pago_interna,
                    fecha: paymentDetails.fecha_creacion,
                    id_venta: paymentDetails.id_venta_pre
                }}
                onClose={() => navigate('/tienda')}
            />
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl border max-w-md w-full text-center">
                <FaTimesCircle className="text-7xl text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Error al Procesar el Pago</h2>
                <p className="text-gray-600 mb-6">{error || 'No se pudo procesar el pago. Por favor, intenta nuevamente.'}</p>
                <Link
                    to="/tienda"
                    className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-150"
                >
                    <FaStore className="inline-block mr-2" /> Volver a la Tienda
                </Link>
            </div>
        </div>
    );
};

export default PaymentStatusPage;