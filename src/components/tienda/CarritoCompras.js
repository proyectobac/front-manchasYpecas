import React from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

const CarritoCompras = ({ items, onUpdateQuantity, onRemoveItem, onClose }) => {
    const calcularTotal = () => {
        return items.reduce((total, item) => total + (item.precioVenta * item.quantity), 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    if (items.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Carrito de Compras</h2>
                    <div className="text-center py-8">
                        <p className="text-gray-600">Tu carrito está vacío</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Seguir Comprando
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Carrito de Compras</h2>
                    <div className="overflow-y-auto max-h-[50vh]">
                        {items.map((item) => (
                            <div key={item.id_producto} className="flex items-center gap-4 py-4 border-b">
                                <img
                                    src={item.foto || '/placeholder.jpg'}
                                    alt={item.nombre}
                                    className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                                    <p className="text-gray-600">{formatCurrency(item.precioVenta)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onUpdateQuantity(item.id_producto, Math.max(0, item.quantity - 1))}
                                        className="p-1 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id_producto, item.quantity + 1)}
                                        className="p-1 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaPlus />
                                    </button>
                                    <button
                                        onClick={() => onRemoveItem(item.id_producto)}
                                        className="p-1 text-red-500 hover:text-red-700 ml-2"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold">Total:</span>
                            <span className="text-xl font-bold text-indigo-600">
                                {formatCurrency(calcularTotal())}
                            </span>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Seguir Comprando
                            </button>
                            <button
                                onClick={() => onClose('checkout')}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Proceder al Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarritoCompras; 