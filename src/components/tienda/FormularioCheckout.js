// src/components/tienda/FormularioCheckout.js
import React from 'react';
import { FaArrowLeft, FaCheckCircle, FaEnvelope, FaIdCard, FaPhone, FaUser } from 'react-icons/fa';

const FormularioCheckout = ({
    checkoutInfo,
    onInputChange,
    cartTotal,
    cartItemCount,
    formatCurrency,
    onBackToCart,
    onProceedToPayment, // Este se llamará desde TiendaCliente después de verificar login
    // onProceedToLogin, // Se elimina, la lógica de login/redirect se manejará en TiendaCliente
}) => {
    const inputClasses = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl border animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Datos de Envío y Contacto</h2>
                <button
                    onClick={onBackToCart}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 text-sm sm:text-base transition-colors"
                >
                    <FaArrowLeft /> Volver al Carrito
                </button>
            </div>
            {/* El formulario ahora llama directamente a onProceedToPayment,
                pero TiendaCliente se asegurará de que el usuario esté logueado ANTES de llamar a esta función.
            */}
            <form onSubmit={(e) => { e.preventDefault(); onProceedToPayment(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Información del Comprador</h3>
                    </div>
                    <div>
                        <label htmlFor="nombreCompleto" className={labelClasses}>
                            <FaUser className="inline mr-1 text-gray-500" /> Nombre Completo *
                        </label>
                        <input type="text" id="nombreCompleto" name="nombreCompleto" value={checkoutInfo.nombreCompleto} onChange={onInputChange} required className={inputClasses} placeholder="Tu nombre completo" />
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClasses}>
                           <FaEnvelope className="inline mr-1 text-gray-500" /> Correo Electrónico *
                        </label>
                        <input type="email" id="email" name="email" value={checkoutInfo.email} onChange={onInputChange} required className={inputClasses} placeholder="tu@correo.com"/>
                    </div>
                     <div>
                        <label htmlFor="tipoDocumento" className={labelClasses}>
                           <FaIdCard className="inline mr-1 text-gray-500" /> Tipo de Documento *
                        </label>
                        <select id="tipoDocumento" name="tipoDocumento" value={checkoutInfo.tipoDocumento} onChange={onInputChange} required className={`${inputClasses} appearance-none`}>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="NIT">NIT</option>
                            <option value="PP">Pasaporte</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="numeroDocumento" className={labelClasses}>
                            <FaIdCard className="inline mr-1 text-gray-500" /> Número de Documento *
                        </label>
                        <input type="text" id="numeroDocumento" name="numeroDocumento" value={checkoutInfo.numeroDocumento} onChange={onInputChange} required className={inputClasses} placeholder="Tu número de documento" />
                    </div>
                    <div>
                        <label htmlFor="telefono" className={labelClasses}>
                           <FaPhone className="inline mr-1 text-gray-500" /> Teléfono/Móvil *
                        </label>
                        <input type="tel" id="telefono" name="telefono" value={checkoutInfo.telefono} onChange={onInputChange} required className={inputClasses} placeholder="Solo números" />
                    </div>
                     <div>
                        <label htmlFor="tipoPersona" className={labelClasses}>
                           <FaUser className="inline mr-1 text-gray-500" /> Tipo de Persona (para PSE) *
                        </label>
                        <select id="tipoPersona" name="tipoPersona" value={checkoutInfo.tipoPersona} onChange={onInputChange} required className={`${inputClasses} appearance-none`}>
                            <option value="natural">Persona Natural</option>
                            <option value="juridica">Persona Jurídica</option>
                        </select>
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Información de Envío</h3>
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="direccion" className={labelClasses}>Dirección de Entrega *</label>
                        <input type="text" id="direccion" name="direccion" value={checkoutInfo.direccion} onChange={onInputChange} required className={inputClasses} placeholder="Calle, número, apto..." />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="ciudad" className={labelClasses}>Ciudad *</label>
                        <input type="text" id="ciudad" name="ciudad" value={checkoutInfo.ciudad} onChange={onInputChange} required className={inputClasses} placeholder="Tu ciudad" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label htmlFor="notasAdicionales" className={labelClasses}>Notas Adicionales (opcional)</label>
                        <textarea id="notasAdicionales" name="notasAdicionales" value={checkoutInfo.notasAdicionales} onChange={onInputChange} rows="3" className={inputClasses} placeholder="Instrucciones especiales..."></textarea>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Resumen del Pedido</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">{cartItemCount} artículo(s)</span>
                            <span className="font-semibold">{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(cartTotal)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    {/* El botón onProceedToLogin ya no es necesario aquí */}
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-150 w-full sm:w-auto transform hover:scale-105 active:scale-100"
                    >
                        Proceder al Pago <FaCheckCircle />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioCheckout;