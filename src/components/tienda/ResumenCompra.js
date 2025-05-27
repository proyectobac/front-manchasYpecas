// import React from 'react';
// import { FaCheckCircle, FaStore, FaDownload } from 'react-icons/fa';
// import logo from '../../assets/images/login1.jpg';

// const ResumenCompra = ({ datosCompra, onClose }) => {
//     const { 
//         cliente, 
//         items, 
//         total, 
//         metodoPago, 
//         referenciaPago,
//         fecha = new Date()
//     } = datosCompra;

//     const formatCurrency = (value) => {
//         return new Intl.NumberFormat('es-CO', {
//             style: 'currency',
//             currency: 'COP',
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0
//         }).format(value);
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 print:p-0 z-50">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:overflow-visible print:shadow-none">
//                 <div className="p-6 print:p-4" id="comprobante-compra">
//                     <div className="text-center border-b pb-4 mb-4">
//                         <div className="flex justify-center mb-2">
//                             <img src={logo} alt="Logo" className="h-16 w-auto" />
//                         </div>
//                         <h1 className="text-2xl font-bold text-gray-800">Manchas y Pecas</h1>
//                         <div className="flex items-center justify-center gap-2 text-green-600 mt-2">
//                             <FaCheckCircle className="text-xl" />
//                             <span className="font-semibold">Compra Exitosa</span>
//                         </div>
//                     </div>

//                     <div className="mb-6">
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                             <div>
//                                 <p className="font-semibold text-gray-600">Número de Orden:</p>
//                                 <p>{referenciaPago}</p>
//                             </div>
//                             <div>
//                                 <p className="font-semibold text-gray-600">Fecha:</p>
//                                 <p>{fecha.toLocaleString()}</p>
//                             </div>
//                             <div>
//                                 <p className="font-semibold text-gray-600">Método de Pago:</p>
//                                 <p>{metodoPago}</p>
//                             </div>
//                             <div>
//                                 <p className="font-semibold text-gray-600">Estado:</p>
//                                 <p className="text-green-600 font-semibold">PAGADO</p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//                         <h2 className="font-bold text-gray-800 mb-2">Datos del Cliente</h2>
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                             <div>
//                                 <p className="font-semibold text-gray-600">Nombre:</p>
//                                 <p>{cliente.nombreCompleto}</p>
//                             </div>
//                             <div>
//                                 <p className="font-semibold text-gray-600">Teléfono:</p>
//                                 <p>{cliente.telefono}</p>
//                             </div>
//                             <div className="col-span-2">
//                                 <p className="font-semibold text-gray-600">Dirección:</p>
//                                 <p>{cliente.direccion}</p>
//                             </div>
//                             <div>
//                                 <p className="font-semibold text-gray-600">Ciudad:</p>
//                                 <p>{cliente.ciudad}</p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="mb-6">
//                         <h2 className="font-bold text-gray-800 mb-2">Detalle de Productos</h2>
//                         <div className="border rounded-lg overflow-hidden">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
//                                         <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
//                                         <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
//                                         <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {items.map((item, index) => (
//                                         <tr key={index}>
//                                             <td className="px-4 py-2 text-sm text-gray-900">{item.nombre}</td>
//                                             <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
//                                             <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.precioVenta)}</td>
//                                             <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.precioVenta * item.quantity)}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                                 <tfoot className="bg-gray-50">
//                                     <tr>
//                                         <td colSpan="3" className="px-4 py-2 text-right font-bold">Total:</td>
//                                         <td className="px-4 py-2 text-right font-bold">{formatCurrency(total)}</td>
//                                     </tr>
//                                 </tfoot>
//                             </table>
//                         </div>
//                     </div>

//                     <div className="text-center text-sm text-gray-600 border-t pt-4">
//                         <p className="mb-1">¡Gracias por tu compra!</p>
//                         <p className="flex items-center justify-center gap-1">
//                             <FaStore className="text-indigo-600" />
//                             <span>Manchas y Pecas - Tu tienda de confianza</span>
//                         </p>
//                     </div>
//                 </div>

//                 <div className="border-t px-6 py-4 flex justify-end gap-4 print:hidden">
//                     <button
//                         onClick={handlePrint}
//                         className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//                     >
//                         <FaDownload />
//                         Descargar/Imprimir
//                     </button>
//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
//                     >
//                         Cerrar
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ResumenCompra; 

import React from 'react';
import { FaCheckCircle, FaStore, FaDownload, FaEnvelope } from 'react-icons/fa';
import logo from '../../assets/images/login1.jpg';

const ResumenCompra = ({ datosCompra, onClose }) => {
    const { 
        cliente, 
        items, 
        total, 
        metodoPago, 
        referenciaPago,
        fecha = new Date()
    } = datosCompra;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 print:p-0 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:overflow-visible print:shadow-none">
                {/* Sección para imprimir */}
                <div className="p-6 print:p-4" id="comprobante-compra">
                    {/* Encabezado */}
                    <div className="text-center border-b pb-4 mb-4">
                        <div className="flex justify-center mb-2">
                            <img src={logo} alt="Logo" className="h-16 w-auto" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Manchas y Pecas</h1>
                        <div className="flex items-center justify-center gap-2 text-green-600 mt-2">
                            <FaCheckCircle className="text-xl" />
                            <span className="font-semibold">Compra Exitosa</span>
                        </div>
                    </div>

                    {/* Información de la compra */}
                    <div className="mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold text-gray-600">Número de Orden:</p>
                                <p>{referenciaPago}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Fecha:</p>
                                <p>{fecha.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Método de Pago:</p>
                                <p>{metodoPago}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Estado:</p>
                                <p className="text-green-600 font-semibold">PAGADO</p>
                            </div>
                        </div>
                    </div>

                    {/* Información del cliente */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h2 className="font-bold text-gray-800 mb-2">Datos del Cliente</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold text-gray-600">Nombre:</p>
                                <p>{cliente.nombreCompleto}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Teléfono:</p>
                                <p>{cliente.telefono}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="font-semibold text-gray-600">Dirección:</p>
                                <p>{cliente.direccion}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Ciudad:</p>
                                <p>{cliente.ciudad}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detalle de productos */}
                    <div className="mb-6">
                        <h2 className="font-bold text-gray-800 mb-2">Detalle de Productos</h2>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 text-sm text-gray-900">{item.nombre}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.precioVenta)}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.precioVenta * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-2 text-right font-bold">Total:</td>
                                        <td className="px-4 py-2 text-right font-bold">{formatCurrency(total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Pie de página */}
                    <div className="text-center text-sm text-gray-600 border-t pt-4">
                        <p className="mb-1">¡Gracias por tu compra!</p>
                        <p className="flex items-center justify-center gap-1">
                            <FaStore className="text-indigo-600" />
                            <span>Manchas y Pecas - Tu tienda de confianza</span>
                        </p>
                    </div>
                </div>

                {/* Botones de acción (no se imprimen) */}
                <div className="border-t px-6 py-4 flex justify-end gap-4 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FaDownload />
                        Descargar/Imprimir
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumenCompra; 