// components/MetodosDePago.js
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
    FaArrowLeft, FaCcVisa, FaCcMastercard, FaCcAmex, FaAngleDown,
    FaUniversity, FaMoneyBillWave, FaCreditCard, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
// VentasService es pasado como prop desde TiendaCliente

const MetodosDePago = ({
    cartTotal,
    cartItemCount,
    cart,
    checkoutInfo, // Contiene nombreCompleto, email, tipoDocumento, numeroDocumento, tipoPersona, etc.
    formatCurrency,
    onPaymentProcess, // Callback a TiendaCliente
    onBackToCheckoutInfo,
    isPlacingOrder,
    VentasService // Este es el servicio que acabamos de modificar
}) => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        isFlipped: false,
        type: '' // Para almacenar el tipo de tarjeta
    });
    const [bancosPSE, setBancosPSE] = useState([]);
    const [selectedBanco, setSelectedBanco] = useState('');
    const [loadingBancos, setLoadingBancos] = useState(false);
    const [error, setError] = useState(null);

    // Función para detectar el tipo de tarjeta
    const detectCardType = (number) => {
        const patterns = {
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/,
            discover: /^6(?:011|5)/,
            diners: /^3(?:0[0-5]|[68])/
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(number.replace(/\s/g, ''))) {
                return type;
            }
        }
        return '';
    };

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(.{4})/g, '$1 ').trim();
        if (value.length <= 19) {
            const cardType = detectCardType(value);
            setCardData(prev => ({ 
                ...prev, 
                number: value,
                type: cardType 
            }));
        }
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        if (value.length <= 5) {
            setCardData(prev => ({ ...prev, expiry: value }));
        }
    };

    const handleCVVChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 3) {
            setCardData(prev => ({ ...prev, cvv: value }));
        }
    };

    const handleNameChange = (e) => {
        setCardData(prev => ({ ...prev, name: e.target.value.toUpperCase() }));
    };

    const handlePayment = async () => {
        if (selectedMethod === 'CARD') {
            // Validaciones básicas
            if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
                alert('Por favor complete todos los campos de la tarjeta');
                return;
            }

            // Si es tarjeta, procesar pago con tarjeta
            onPaymentProcess({
                success: true,
                data: {
                    referenciaPago: `REF-${Date.now()}`,
                    items: cart.map(item => ({
                        id_producto: item.id_producto,
                        cantidad: item.quantity,
                        precioVenta: parseFloat(item.precioVenta),
                        precioUnitario: parseFloat(item.precioVenta),
                        nombre: item.nombre,
                        quantity: item.quantity
                    })),
                    metodoPago: 'Tarjeta'
                },
                paymentMethod: 'CARD'
            });
        } else {
            // Si no es tarjeta, usar el proceso existente
            handleProcessPaymentInternal();
        }
    };

    const paymentCodes = ["3854 9625 1078", "7412 5890 3216", "2981 5437 0624", "7453 1896 0274"];
    const [randomPaymentCode, setRandomPaymentCode] = useState('');

    const generateRandomCode = () => {
        const randomIndex = Math.floor(Math.random() * paymentCodes.length);
        return paymentCodes[randomIndex];
    };

    useEffect(() => {
        if (selectedMethod === 'CASH' && !randomPaymentCode) {
            setRandomPaymentCode(generateRandomCode());
        }
    }, [selectedMethod, randomPaymentCode]);

    useEffect(() => {
        const cargarBancos = async () => {
            setLoadingBancos(true);
            setError(null);
            try {
                const response = await VentasService.obtenerBancosPSE();
                console.log('Respuesta de bancos:', response); // Para debug
                if (response && response.bancos) {
                    setBancosPSE(response.bancos);
                } else {
                    throw new Error('No se pudieron cargar los bancos');
                }
            } catch (err) {
                console.error('Error cargando bancos PSE:', err);
                setError('Error al cargar los bancos PSE. Por favor intenta de nuevo.');
            } finally {
                setLoadingBancos(false);
            }
        };
        cargarBancos();
    }, [VentasService]);

    const handleProcessPaymentInternal = async () => {
        if (!selectedBanco) {
            Swal.fire('Error', 'Por favor selecciona un banco', 'warning');
            return;
        }

        setLoadingBancos(true);
        setError(null);

        try {
            const paymentData = {
                banco_codigo: selectedBanco,
                tipo_persona: 'natural',
                tipo_documento: checkoutInfo.tipoDocumento || 'CC',
                documento: checkoutInfo.numeroDocumento,
                nombre_completo: checkoutInfo.nombreCompleto.trim(),
                email: checkoutInfo.email,
                telefono: checkoutInfo.telefono,
                direccion_entrega: checkoutInfo.direccion,
                ciudad: checkoutInfo.ciudad,
                notasAdicionales: checkoutInfo.notasAdicionales || '',
                items: cart.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.quantity,
                    precioVenta: item.precioVenta,
                    nombre: item.nombre
                }))
            };

            console.log('Datos de pago a enviar:', paymentData);

            const response = await VentasService.iniciarPagoPSEConBackend(paymentData);

            if (response.success && response.redirect_url) {
                onPaymentProcess({
                    success: true,
                    isRedirect: true,
                    redirectUrl: response.redirect_url,
                    data: {
                        referenciaPago: response.referencia
                    },
                    paymentMethod: 'PSE'
                });
            } else {
                throw new Error('No se recibió la URL de redirección del banco');
            }
        } catch (error) {
            console.error('Error al procesar pago PSE:', error);
            setError(error.message || 'Error al procesar el pago PSE.');
            onPaymentProcess({
                success: false,
                data: {
                    errorMessage: error.message || 'Error al procesar el pago'
                }
            });
        } finally {
            setLoadingBancos(false);
        }
    };

    // ... (resto del JSX del componente MetodosDePago con Tailwind, sin cambios respecto a la versión anterior que te di)
    // El JSX que te proporcioné anteriormente para MetodosDePago con Tailwind es correcto.
    // Solo asegúrate de que 'apiError' se use para mostrar errores generales, similar a como se usa 'wompiError'.
    const baseInputClasses = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
    const baseLabelClasses = "block text-sm font-medium text-gray-700 mb-1";
    const paymentOptionBase = "border rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out flex flex-col items-center justify-center space-y-2 h-full";
    const paymentOptionSelected = "border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-500";
    const paymentOptionUnselected = "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50";
    const paymentIconWrapperBase = "flex items-center justify-center mb-2 p-3 rounded-lg shadow-md w-full text-white text-3xl";


    if (selectedMethod === 'processing') {
        return (
            <div className="bg-white p-8 rounded-lg shadow-xl border max-w-md mx-auto text-center animate-fade-in">
                <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Procesando Pago</h2>
                <p className="text-gray-600">Por favor espera, estamos conectando de forma segura...</p>
            </div>
        );
    }

    if (selectedMethod === 'failure') {
        return (
            <div className="bg-white p-8 rounded-lg shadow-xl border max-w-md mx-auto text-center animate-fade-in">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaExclamationTriangle size={40} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-700 mb-3">Error en el Pago</h2>
                <p className="text-gray-600 mb-6">{error || 'No pudimos procesar tu pago. Por favor, verifica tus datos o intenta con otro método.'}</p>
                <button
                    onClick={() => { setSelectedMethod(null); setError(null); }}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-150"
                >
                    Intentar de Nuevo
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl border animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Método de Pago</h2>
                <button onClick={onBackToCheckoutInfo} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 text-sm sm:text-base transition-colors">
                    <FaArrowLeft /> Volver a Datos de Envío
                </button>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Selecciona cómo quieres pagar:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div onClick={() => setSelectedMethod('CARD')} className={`${paymentOptionBase} ${selectedMethod === 'CARD' ? paymentOptionSelected : paymentOptionUnselected}`}>
                        <div className={`${paymentIconWrapperBase} bg-gradient-to-r from-blue-500 to-purple-600`}>
                            <FaCcVisa /><FaCcMastercard className="mx-1" /><FaCcAmex />
                        </div>
                        <h4 className="text-center font-medium text-gray-700">Tarjeta Crédito/Débito</h4>
                    </div>
                    <div onClick={() => setSelectedMethod('PSE')} className={`${paymentOptionBase} ${selectedMethod === 'PSE' ? paymentOptionSelected : paymentOptionUnselected}`}>
                        <div className={`${paymentIconWrapperBase} bg-green-600`}>
                            <FaUniversity className="mr-2" /><span className="font-bold text-xl">PSE</span>
                        </div>
                        <h4 className="text-center font-medium text-gray-700">PSE - Débito Bancario</h4>
                    </div>
                    <div onClick={() => setSelectedMethod('CASH')} className={`${paymentOptionBase} ${selectedMethod === 'CASH' ? paymentOptionSelected : paymentOptionUnselected}`}>
                        <div className={`${paymentIconWrapperBase} bg-orange-500`}>
                            <FaMoneyBillWave className="mr-2" /><span className="font-bold text-xl">EFECTIVO</span>
                        </div>
                        <h4 className="text-center font-medium text-gray-700">Pago en Efectivo</h4>
                    </div>
                </div>
            </div>

            {selectedMethod === 'PSE' && (
                <div className="border rounded-lg p-5 bg-gray-50 mb-6 animate-fade-in">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Pago por PSE</h3>
                    {loadingBancos ? <div className="flex items-center justify-center text-gray-600"><FaSpinner className="animate-spin text-2xl mr-2" />Cargando bancos...</div> : (
                        <div className="relative">
                            <label htmlFor="bancoPSE" className={baseLabelClasses}>Selecciona tu banco</label>
                            <select id="bancoPSE" value={selectedBanco} onChange={(e) => setSelectedBanco(e.target.value)} required className={`${baseInputClasses} appearance-none pr-10`}>
                                <option value="">Selecciona una entidad bancaria</option>
                                {bancosPSE.map(banco => (
                                    <option key={banco.financial_institution_code} value={banco.financial_institution_code}>
                                        {banco.financial_institution_name}
                                    </option>
                                ))}
                            </select>
                            <FaAngleDown className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3 pointer-events-none text-gray-500 text-lg" />
                        </div>
                    )}
                    <p className="text-gray-600 text-sm mt-4">Al continuar, serás redirigido al portal de tu banco para completar la transacción de forma segura.</p>
                </div>
            )}

            {selectedMethod === 'CASH' && (
                <div className="border rounded-lg p-5 bg-gray-50 mb-6 animate-fade-in">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Pago en Efectivo</h3>
                    <div className="text-center mb-3">
                        <h4 className="font-medium text-gray-700 text-base">Tu código de pago es:</h4>
                        <button onClick={() => setRandomPaymentCode(generateRandomCode())} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-1">
                            (Generar nuevo código)
                        </button>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg text-center mb-4">
                        <div className="font-mono text-3xl font-bold tracking-wider text-gray-800">
                            {randomPaymentCode}
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Válido por 48 horas</p>
                    </div>
                    <p className="text-center text-gray-600 text-sm">Puedes realizar tu pago en puntos Efecty, Baloto o corresponsales bancarios autorizados.</p>
                </div>
            )}

            {selectedMethod === 'CARD' && (
                <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Ingresa los datos de tu tarjeta</h3>
                    
                    {/* Campos de entrada */}
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Número de Tarjeta
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cardData.number}
                                    onChange={handleCardNumberChange}
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
                                    maxLength="19"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {cardData.type === 'visa' && <FaCcVisa className="text-blue-600 text-2xl" />}
                                    {cardData.type === 'mastercard' && <FaCcMastercard className="text-orange-600 text-2xl" />}
                                    {cardData.type === 'amex' && <FaCcAmex className="text-blue-800 text-2xl" />}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Titular de la Tarjeta
                            </label>
                            <input
                                type="text"
                                value={cardData.name}
                                onChange={handleNameChange}
                                placeholder="Como aparece en la tarjeta"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vencimiento
                                </label>
                                <input
                                    type="text"
                                    value={cardData.expiry}
                                    onChange={handleExpiryChange}
                                    placeholder="MM/YY"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    maxLength="5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    value={cardData.cvv}
                                    onChange={handleCVVChange}
                                    onFocus={() => setCardData(prev => ({ ...prev, isFlipped: true }))}
                                    onBlur={() => setCardData(prev => ({ ...prev, isFlipped: false }))}
                                    placeholder="123"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    maxLength="3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Visualización de la tarjeta */}
                    <div className="relative h-48 w-full max-w-md mx-auto">
                        <div className={`absolute w-full h-full transition-all duration-300 ${cardData.isFlipped ? 'rotate-y-180' : ''}`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white shadow-xl">
                                <div className="h-8 flex justify-between">
                                    <div className="text-2xl">
                                        {cardData.type === 'visa' && <FaCcVisa />}
                                        {cardData.type === 'mastercard' && <FaCcMastercard />}
                                        {cardData.type === 'amex' && <FaCcAmex />}
                                        {!cardData.type && <FaCreditCard />}
                                    </div>
                                    <div className="text-sm font-medium">
                                        {cardData.type === 'visa' && 'VISA'}
                                        {cardData.type === 'mastercard' && 'MASTERCARD'}
                                        {cardData.type === 'amex' && 'AMERICAN EXPRESS'}
                                        {!cardData.type && 'TARJETA'}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="font-mono text-2xl tracking-wider">
                                        {cardData.number || '**** **** **** ****'}
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <p className="text-xs opacity-75">TITULAR</p>
                                        <p className="font-mono tracking-wider">
                                            {cardData.name || 'TU NOMBRE'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs opacity-75">VENCE</p>
                                        <p className="font-mono tracking-wider">
                                            {cardData.expiry || 'MM/YY'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg my-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumen del Pedido</h3>
                <div className="flex justify-between items-center text-gray-700">
                    <span>{cartItemCount} artículo(s)</span>
                    <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center font-bold text-xl text-gray-900">
                        <span>TOTAL A PAGAR:</span>
                        <span>{formatCurrency(cartTotal)}</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-center mt-8">
                <button
                    onClick={handlePayment}
                    disabled={
                        (selectedMethod === 'PSE' && (!selectedBanco || loadingBancos)) || 
                        (selectedMethod === 'CARD' && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)) ||
                        !selectedMethod ||
                        isPlacingOrder
                    }
                    className={`w-full sm:w-auto px-10 py-3.5 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${(selectedMethod === 'PSE' && (!selectedBanco || loadingBancos)) || isPlacingOrder || !selectedMethod
                            ? 'bg-gray-400 cursor-not-allowed focus:ring-gray-400'
                            : selectedMethod === 'CARD'
                            ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                            : selectedMethod === 'PSE'
                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                            : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400'}`}
                >
                    {loadingBancos || isPlacingOrder ? (
                        <FaSpinner className="animate-spin text-xl" />
                    ) : !selectedMethod ? (
                        'Selecciona un método de pago'
                    ) : selectedMethod === 'CARD' ? (
                        `Pagar con ${cardData.type ? cardData.type.toUpperCase() : 'Tarjeta'}`
                    ) : selectedMethod === 'PSE' ? (
                        'Pagar con PSE'
                    ) : selectedMethod === 'CASH' ? (
                        'Pagar en Efectivo'
                    ) : (
                        'Pagar'
                    )}
                </button>
            </div>
        </div>
    );
};

export default MetodosDePago;