import React from 'react';
import { FaArrowLeft, FaTrash, FaPlus, FaMinus, FaShoppingCart, FaCheckCircle } from 'react-icons/fa';
import defaultProductImage from '../../assets/images/login1.jpg'; // Ajusta la ruta

const CarritoCompras = ({ 
    items, 
    cartTotal,
    formatCurrency,
    onUpdateQuantity, 
    onRemoveItem, 
    onClose, // Para "Seguir Comprando"
    onProceedToCheckout // Para "Ingresar Datos de Envío"
}) => {

    if (!items || items.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-xl border animate-fade-in max-w-4xl mx-auto">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 gap-4">
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Tu Carrito</h2>
                    <button onClick={onClose} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 text-sm sm:text-base">
                        <FaArrowLeft /> Continuar Comprando
                    </button>
                </div>
                <div className="text-center text-gray-500 py-12">
                    <FaShoppingCart size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg">Tu carrito está vacío.</p>
                    <p className="text-sm mt-1">¡Añade algunos productos para empezar!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl border animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Tu Carrito</h2>
                <button onClick={onClose} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 text-sm sm:text-base">
                    <FaArrowLeft /> Continuar Comprando
                </button>
            </div>
            
            <div className="space-y-5 mb-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                    <div key={item.id_producto} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-150">
                        <div className="flex items-center gap-4 mb-3 sm:mb-0 flex-grow w-full sm:w-auto">
                            <img src={item.foto || defaultProductImage} alt={item.nombre} className="w-20 h-20 object-contain rounded border bg-gray-50 p-1" onError={(e) => { e.currentTarget.src = defaultProductImage; }} />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-900 text-base">{item.nombre}</p>
                                <p className="text-sm text-gray-600">{formatCurrency(item.precioVenta)} c/u</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mx-0 sm:mx-4 my-2 sm:my-0">
                            <button onClick={() => onUpdateQuantity(item.id_producto, -1)} className="bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-600 p-1.5 rounded-full transition-colors disabled:opacity-50" title="Disminuir"><FaMinus size={12} /></button>
                            <span className="font-bold w-8 text-center text-lg">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id_producto, 1)} disabled={item.quantity >= item.stockAvailable} className="bg-gray-200 hover:bg-green-100 text-gray-700 hover:text-green-600 p-1.5 rounded-full transition-colors disabled:opacity-50" title="Aumentar"><FaPlus size={12} /></button>
                        </div>
                        <p className="font-bold text-lg w-28 text-right my-2 sm:my-0">{formatCurrency(item.precioVenta * item.quantity)}</p>
                        <button onClick={() => onRemoveItem(item.id_producto)} className="ml-2 sm:ml-5 text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors" title="Eliminar"><FaTrash /></button>
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-200 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-2xl font-bold text-gray-900">
                    Total: {formatCurrency(cartTotal)}
                </p>
                <button
                    onClick={onProceedToCheckout}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center gap-2 transition duration-150 w-full md:w-auto justify-center text-lg transform hover:scale-105 active:scale-100"
                >
                    <FaCheckCircle /> Ingresar Datos de Envío
                </button>
            </div>
        </div>
    );
};

export default CarritoCompras;