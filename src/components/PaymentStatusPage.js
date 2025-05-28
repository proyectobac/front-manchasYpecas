// src/components/PaymentStatusPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaHome } from 'react-icons/fa';
// Asume que tienes un servicio para consultar el estado del pago en tu backend
// Este servicio debe llamar a tu endpoint /api/pagos/estado/:referencia o /api/pagos/pse/estado/:referencia
import VentasService from '../services/ventasServices'; // Ajusta la ruta si es necesario

const PaymentStatusPage = () => {
    const { referencia } = useParams();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null); // 'APROBADO', 'RECHAZADO', 'PENDIENTE', 'ERROR'
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
            try {
                // Llama al backend para obtener el estado del pago
                // Asumimos que tu servicio VentasService tiene un método para esto
                // Este método internamente llamará a tu API: GET /api/pagos/estado/:referencia
                const response = await VentasService.consultarEstadoPagoPorReferencia(referencia);

                if (response && response.success && response.pago) {
                    setPaymentStatus(response.pago.estado);
                    setPaymentDetails(response.pago);

                    // Si el estado es APROBADO, podrías limpiar el carrito aquí si no se hizo antes
                    if (response.pago.estado === 'APROBADO') {
                        localStorage.removeItem('cart'); // O la forma en que gestiones el carrito
                        sessionStorage.removeItem('pendingOrder'); // Limpiar si se usó
                    }

                } else {
                    throw new Error(response.error || 'No se pudo obtener el estado del pago.');
                }
            } catch (err) {
                console.error("Error al verificar el estado del pago:", err);
                setError(err.message || 'Ocurrió un error al verificar tu pago.');
                setPaymentStatus('ERROR'); // Marcar como error si la consulta falla
            } finally {
                setLoading(false);
            }
        };

        checkPaymentStatus();
    }, [referencia]);

    const getStatusInfo = () => {
        switch (paymentStatus) {
            case 'APROBADO':
                return {
                    icon: <FaCheckCircle className="text-7xl text-green-500" />,
                    title: '¡Pago Aprobado!',
                    message: 'Tu compra ha sido procesada exitosamente. Gracias por elegirnos.',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-500',
                    textColor: 'text-green-700'
                };
            case 'RECHAZADO':
                return {
                    icon: <FaTimesCircle className="text-7xl text-red-500" />,
                    title: 'Pago Rechazado',
                    message: 'Lamentablemente, tu pago no pudo ser procesado. Por favor, verifica tus datos o intenta con otro método de pago.',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-500',
                    textColor: 'text-red-700'
                };
            case 'PENDIENTE':
                return {
                    icon: <FaSpinner className="text-7xl text-yellow-500 animate-spin" />,
                    title: 'Pago Pendiente',
                    message: 'Tu pago aún está siendo procesado. Te notificaremos una vez se complete. Puedes revisar el estado más tarde.',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-500',
                    textColor: 'text-yellow-700'
                };
            default: // ERROR o estado desconocido
                return {
                    icon: <FaTimesCircle className="text-7xl text-red-500" />,
                    title: 'Error en el Pago',
                    message: error || 'Hubo un problema al procesar o verificar tu pago. Contacta a soporte si el problema persiste.',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-500',
                    textColor: 'text-red-700'
                };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <FaSpinner className="text-6xl text-indigo-600 animate-spin mb-6" />
                <h1 className="text-2xl font-semibold text-gray-700">Verificando estado de tu pago...</h1>
                <p className="text-gray-500">Por favor, espera un momento.</p>
            </div>
        );
    }

    const { icon, title, message, bgColor, borderColor, textColor } = getStatusInfo();

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen ${bgColor} p-4`}>
            <div className={`bg-white p-8 md:p-12 rounded-xl shadow-2xl border-t-8 ${borderColor} max-w-lg w-full text-center`}>
                <div className="mb-8">
                    {icon}
                </div>
                <h1 className={`text-3xl md:text-4xl font-bold ${textColor} mb-4`}>{title}</h1>
                <p className="text-gray-600 text-lg mb-8">{message}</p>

                {paymentDetails && (
                    <div className="text-left bg-gray-50 p-4 rounded-md border border-gray-200 mb-8 text-sm">
                        <h3 className="font-semibold text-gray-700 mb-2">Detalles de la transacción:</h3>
                        <p><span className="font-medium">Referencia:</span> {paymentDetails.referencia_pago_interna || referencia}</p>
                        <p><span className="font-medium">Monto:</span> {paymentDetails.monto ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits:0 }).format(paymentDetails.monto / 100) : 'N/A'}</p>
                        <p><span className="font-medium">Fecha:</span> {paymentDetails.fecha_creacion ? new Date(paymentDetails.fecha_creacion).toLocaleString('es-CO') : 'N/A'}</p>
                        {paymentDetails.metodo_pago && <p><span className="font-medium">Método:</span> {paymentDetails.metodo_pago}</p>}
                    </div>
                )}

                <Link
                    to="/tienda"
                    className="w-full flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-150 text-lg"
                >
                    <FaHome className="mr-2" /> Volver a la Tienda
                </Link>
            </div>
            <p className="mt-8 text-xs text-gray-500">Referencia de Wompi: {referencia}</p>
        </div>
    );
};

export default PaymentStatusPage;