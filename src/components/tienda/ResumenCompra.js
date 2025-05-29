import React from 'react';
import { FaCheckCircle, FaStore, FaDownload } from 'react-icons/fa';
import logo from '../../assets/images/login1.jpg'; // Ajusta la ruta si es necesario

const ResumenCompra = ({ datosCompra, onClose }) => {
    const { 
        cliente, items, total, metodoPago, referenciaPago, fecha = new Date()
    } = datosCompra;

    const formatCurrency = (value) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numericValue) || numericValue === null || numericValue === undefined || numericValue <= 0) {
            return '$ 0';
        }
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(numericValue);
    };

    const handlePrint = () => window.print();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:items-start print:inset-auto z-50">
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

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Datos de Envío</h2>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm sm:text-base">
                            <p><span className="font-semibold">Nombre:</span> {cliente.nombreCompleto}</p>
                            <p><span className="font-semibold">Teléfono:</span> {cliente.telefono}</p>
                            <p><span className="font-semibold">Dirección:</span> {cliente.direccion}</p>
                            <p><span className="font-semibold">Ciudad:</span> {cliente.ciudad}</p>
                            {cliente.notasAdicionales && (
                                <p className="mt-2"><span className="font-semibold">Notas:</span> {cliente.notasAdicionales}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Detalle de Productos</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">PRODUCTO</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">CANTIDAD</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">PRECIO UNIT.</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">SUBTOTAL</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((item, index) => {
                                        const precioVenta = parseFloat(item.precioUnitario || item.precioVenta);
                                        const cantidad = parseInt(item.cantidad || item.quantity);
                                        const subtotal = precioVenta * cantidad;
                                        
                                        if (isNaN(precioVenta) || precioVenta <= 0) return null;
                                        
                                        return (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{item.nombre}</td>
                                                <td className="px-4 py-3 text-sm text-gray-800 text-center">{cantidad}</td>
                                                <td className="px-4 py-3 text-sm text-gray-800 text-right">{formatCurrency(precioVenta)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">{formatCurrency(subtotal)}</td>
                                            </tr>
                                        );
                                    })}
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

                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center print:hidden border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Volver a la Tienda
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <FaDownload /> Descargar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumenCompra;