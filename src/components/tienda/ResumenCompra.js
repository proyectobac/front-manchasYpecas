import React from 'react';
import { FaCheckCircle, FaStore, FaDownload } from 'react-icons/fa';
import logo from '../../assets/images/login1.jpg'; // Ajusta la ruta si es necesario

const ResumenCompra = ({ datosCompra, onClose }) => {
    const { 
        cliente, items, total, metodoPago, referenciaPago, fecha = new Date()
    } = datosCompra;

    const formatCurrency = (value) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numericValue) || numericValue === null || numericValue === undefined) return '$ 0';
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(numericValue);
    };

    const handlePrint = () => window.print();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 print:p-0 z-50 animate-fade-in">
            <style>
                {`
                @media print {
                    body * { visibility: hidden; }
                    #comprobante-compra, #comprobante-compra * { visibility: visible; }
                    #comprobante-compra { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
                    .print-hidden { display: none !important; }
                }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                `}
            </style>
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto print:overflow-visible print:shadow-none print:rounded-none print:max-h-full">
                <div className="p-6 sm:p-8 print:p-4" id="comprobante-compra">
                    <div className="text-center border-b border-gray-200 pb-6 mb-6">
                        <img src={logo} alt="Logo Manchas y Pecas" className="h-20 w-auto mx-auto mb-3 print:h-16" />
                        <h1 className="text-3xl font-bold text-gray-800 print:text-2xl">Manchas y Pecas</h1>
                        <div className="flex items-center justify-center gap-2 text-green-600 mt-3">
                            <FaCheckCircle className="text-2xl print:text-xl" />
                            <span className="font-semibold text-lg print:text-base">Compra Exitosa</span>
                        </div>
                    </div>

                    <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:text-base">
                        <div><p className="font-semibold text-gray-600">Número de Orden:</p><p className="text-gray-800">{referenciaPago}</p></div>
                        <div><p className="font-semibold text-gray-600">Fecha de Compra:</p><p className="text-gray-800">{new Date(fecha).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}</p></div>
                        <div><p className="font-semibold text-gray-600">Método de Pago:</p><p className="text-gray-800">{metodoPago}</p></div>
                        <div><p className="font-semibold text-gray-600">Estado del Pago:</p><p className="text-green-600 font-bold">PAGADO</p></div>
                    </div>

                    <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 print:text-lg">Datos del Cliente</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm sm:text-base">
                            <div><p className="font-medium text-gray-500">Nombre:</p><p className="text-gray-700">{cliente.nombreCompleto}</p></div>
                            <div><p className="font-medium text-gray-500">Teléfono:</p><p className="text-gray-700">{cliente.telefono}</p></div>
                            {cliente.email && <div><p className="font-medium text-gray-500">Email:</p><p className="text-gray-700">{cliente.email}</p></div>}
                            {cliente.numeroDocumento && <div><p className="font-medium text-gray-500">Documento:</p><p className="text-gray-700">{cliente.tipoDocumento} {cliente.numeroDocumento}</p></div>}
                            <div className="sm:col-span-2"><p className="font-medium text-gray-500">Dirección de Envío:</p><p className="text-gray-700">{cliente.direccion}, {cliente.ciudad}</p></div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 print:text-lg">Detalle de Productos</h2>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((item, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{item.nombre}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800 text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800 text-right">{formatCurrency(item.precioVenta)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">{formatCurrency(item.precioVenta * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-100">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-gray-700 uppercase">Total Pagado:</td>
                                        <td className="px-4 py-3 text-right text-base font-bold text-gray-900">{formatCurrency(total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-600 border-t border-gray-200 pt-6 mt-6">
                        <p className="mb-1">¡Gracias por tu compra en Manchas y Pecas!</p>
                        <p className="flex items-center justify-center gap-1">
                            <FaStore className="text-indigo-600" />
                            <span>Visítanos pronto.</span>
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 print-hidden">
                    <button 
                        onClick={handlePrint} 
                        className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-150 flex items-center justify-center gap-2"
                    >
                        <FaDownload /> Descargar/Imprimir
                    </button>
                    <button 
                        onClick={onClose} 
                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-150"
                    >
                        Cerrar y Volver a la Tienda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumenCompra;