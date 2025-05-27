// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import defaultProductImage from '../../assets/images/login1.jpg';
// import ProductosService from '../../services/productosService';
// import VentasService from '../../services/ventasServices';

// import Swal from 'sweetalert2';
// import ResumenCompra from './ResumenCompra';
// import CarritoCompras from './CarritoCompras';
// import FormularioPago from './FormularioPago';
// import {
//     FaShoppingCart, FaArrowLeft, FaTrash, FaPlus, FaMinus,
//     FaExclamationTriangle, FaCheckCircle, FaUserCircle,
//     FaAngleLeft, FaAngleRight,
//     FaCcVisa, FaCcMastercard, FaCcAmex, FaAngleDown,
//     FaUniversity, FaMoneyBillWave, FaCreditCard
// } from 'react-icons/fa';

// // Define las categorías predefinidas
// const categoriasPredefinidas = [
//     { value: 'TODAS', label: 'Todas' },
//     { value: 'SNACKS', label: 'Snacks' },
//     { value: 'HIGIENE', label: 'Higiene' },
//     { value: 'JUGUETERIA', label: 'Juguetería' },
//     { value: 'ACCESORIOS', label: 'Accesorios' },
// ];

// // Límite para mostrar "Últimas unidades"
// const STOCK_THRESHOLD = 5;

// // Imágenes para el carrusel
// const carouselImages = [
//     {
//         src: 'https://placehold.co/1200x300/3730A3/FFF?text=Ofertas+Especiales',
//         alt: 'Ofertas especiales',
//         title: 'Ofertas Especiales',
//         subtitle: 'Hasta 50% de descuento en productos seleccionados'
//     },
//     {
//         src: 'https://placehold.co/1200x300/6366F1/FFF?text=Nuevos+Productos',
//         alt: 'Nuevos productos',
//         title: 'Nuevos Productos',
//         subtitle: 'Conoce nuestras últimas novedades'
//     },
//     {
//         src: 'https://placehold.co/1200x300/4F46E5/FFF?text=Envío+Gratis',
//         alt: 'Envío gratis',
//         title: 'Envío Gratis',
//         subtitle: 'En compras superiores a $50.000'
//     },
// ];

// const TiendaCliente = () => {
//     const [productos, setProductos] = useState([]);
//     const [categorias, setCategorias] = useState(categoriasPredefinidas);
//     const [selectedCategoria, setSelectedCategoria] = useState('TODAS');
//     const [filteredProductos, setFilteredProductos] = useState([]);
//     const [cart, setCart] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [viewMode, setViewMode] = useState('browsing'); // 'browsing', 'cart', 'checkout', 'payment'
//     const [checkoutInfo, setCheckoutInfo] = useState({
//         nombreCompleto: '',
//         telefono: '',
//         direccion: '',
//         ciudad: '',
//         notasAdicionales: '',
//     });
//     const [currentSlide, setCurrentSlide] = useState(0);
//     const [isAutoPlaying, setIsAutoPlaying] = useState(true);
//     const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditCard');
//     const [paymentViewMode, setPaymentViewMode] = useState('browsing');

//     const navigate = useNavigate();

//     // Cargar productos
//     const fetchProductos = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const responseData = await ProductosService.getAllProductos();
//             if (responseData && Array.isArray(responseData.productos)) {
//                 const activeProducts = responseData.productos.filter(p => p.estado === 'Activo');
//                 setProductos(activeProducts);
//                 setFilteredProductos(activeProducts);

//                 const uniqueCategorias = ['TODAS', ...new Set(activeProducts.map(p => p.categoria).filter(Boolean))];
//                 setCategorias(uniqueCategorias.map(cat => ({
//                     value: cat,
//                     label: cat === 'TODAS' ? 'Todas' : (cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase() || 'Sin Categoría')
//                 })));
//             } else {
//                 console.warn("Respuesta inesperada o vacía de productos:", responseData);
//                 setProductos([]);
//                 setFilteredProductos([]);
//                 setError('No se pudieron cargar los productos.');
//             }
//         } catch (err) {
//             console.error("Error fetching products:", err);
//             setError(err.message || "Error al cargar productos.");
//             setProductos([]);
//             setFilteredProductos([]);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchProductos();
//     }, [fetchProductos]);

//     // Filtrar productos por categoría
//     useEffect(() => {
//         const filtered = selectedCategoria === 'TODAS'
//             ? productos
//             : productos.filter(producto => producto.categoria === selectedCategoria);
//         setFilteredProductos(filtered);
//     }, [selectedCategoria, productos]);

//     // Carrusel automático
//     useEffect(() => {
//         let interval;
//         if (isAutoPlaying) {
//             interval = setInterval(() => {
//                 setCurrentSlide(current => (current + 1) % carouselImages.length);
//             }, 5000);
//         }
//         return () => clearInterval(interval);
//     }, [isAutoPlaying]);

//     // Formatear moneda
//     const formatCurrency = (value) => {
//         return new Intl.NumberFormat('es-CO', {
//             style: 'currency',
//             currency: 'COP',
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0
//         }).format(value);
//     };

//     // Manejar cambio de cantidad en el carrito
//     const handleUpdateQuantity = useCallback((productId, newQuantity) => {
//         if (newQuantity === 0) {
//             handleRemoveFromCart(productId);
//             return;
//         }

//         setCart(currentCart => {
//             return currentCart.map(item => {
//                 if (item.id_producto === productId) {
//                     return { ...item, quantity: newQuantity };
//                 }
//                 return item;
//             });
//         });
//     }, []);

//     // Agregar al carrito
//     const handleAddToCart = useCallback((producto) => {
//         setCart(currentCart => {
//             const existingItem = currentCart.find(item => item.id_producto === producto.id_producto);
//             if (existingItem) {
//                 return currentCart.map(item =>
//                     item.id_producto === producto.id_producto
//                         ? { ...item, quantity: item.quantity + 1 }
//                         : item
//                 );
//             }
//             return [...currentCart, { ...producto, quantity: 1 }];
//         });

//         Swal.fire({
//             title: '¡Producto agregado!',
//             text: 'El producto se ha agregado al carrito',
//             icon: 'success',
//             timer: 1500,
//             showConfirmButton: false
//         });
//     }, []);

//     // Eliminar del carrito
//     const handleRemoveFromCart = useCallback((productId) => {
//         setCart(currentCart => currentCart.filter(item => item.id_producto !== productId));
//     }, []);

//     // Calcular total del carrito
//     const cartTotal = useMemo(() => {
//         return cart.reduce((total, item) => total + (item.precioVenta * item.quantity), 0);
//     }, [cart]);

//     // Manejar cierre de modales
//     const handleCloseModal = useCallback((nextView = 'browsing') => {
//         setViewMode(nextView);
//     }, []);

//     // Manejar cambio en el formulario de checkout
//     const handleCheckoutChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setCheckoutInfo(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     }, []);

//     // Procesar pago
//     const processPayment = async () => {
//         if (selectedPaymentMethod === 'creditCard') {
//             // ... validaciones existentes ...
//         }

//         setPaymentViewMode('processing');

//         try {
//             const orderData = {
//                 cliente: checkoutInfo,
//                 items: cart.map(item => ({
//                     id_producto: item.id_producto,
//                     cantidad: item.quantity,
//                     precioUnitario: item.precioVenta
//                 })),
//                 total: cartTotal,
//                 metodoPago: selectedPaymentMethod,
//                 estadoPago: 'PAGADO',
//                 referenciaPago: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
//             };

//             const response = await VentasService.createVenta(orderData);

//             if (response && response.ok) {
//                 setPaymentViewMode('success');
//                 // Actualizar stock de productos
//                 for (const item of cart) {
//                     await ProductosService.updateProducto(item.id_producto, {
//                         stock: item.stockAvailable - item.quantity
//                     });
//                 }
//             } else {
//                 throw new Error(response?.msg || 'No se pudo registrar la venta.');
//             }
//         } catch (error) {
//             console.error("Error processing payment:", error);
//             setPaymentViewMode('failure');
//             Swal.fire('Error', error.message || 'Hubo un problema al procesar el pago.', 'error');
//         }
//     };

//     // Renderizar controles del carrusel
//     const renderCarouselControls = () => (
//         <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
//             {carouselImages.map((_, index) => (
//                 <button
//                     key={index}
//                     className={`w-3 h-3 rounded-full ${
//                         currentSlide === index ? 'bg-white' : 'bg-white/50'
//                     }`}
//                     onClick={() => setCurrentSlide(index)}
//                 />
//             ))}
//         </div>
//     );

//     // Renderizar navegación del carrusel
//     const renderCarouselNavigation = () => (
//         <>
//             <button
//                 className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
//                 onClick={() => setCurrentSlide((current) => (current - 1 + carouselImages.length) % carouselImages.length)}
//             >
//                 <FaAngleLeft className="text-2xl" />
//             </button>
//             <button
//                 className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
//                 onClick={() => setCurrentSlide((current) => (current + 1) % carouselImages.length)}
//             >
//                 <FaAngleRight className="text-2xl" />
//             </button>
//         </>
//     );

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="text-center">
//                     <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
//                     <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
//                     <p className="text-gray-600">{error}</p>
//                     <button
//                         onClick={() => window.location.reload()}
//                         className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                     >
//                         Reintentar
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-100">
//             {/* Header */}
//             <header className="bg-white shadow">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//                     <div className="flex justify-between items-center">
//                         <h1 className="text-2xl font-bold text-gray-800">Tienda</h1>
//                         <button
//                             onClick={() => setViewMode('cart')}
//                             className="relative p-2 text-gray-600 hover:text-gray-800"
//                         >
//                             <FaShoppingCart className="text-2xl" />
//                             {cart.length > 0 && (
//                                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                                     {cart.length}
//                                 </span>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </header>

//             {/* Main Content */}
//             <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Carrusel */}
//                 <div className="relative mb-8 rounded-lg overflow-hidden">
//                     <div
//                         className="aspect-[16/5] transition-transform duration-500"
//                         style={{
//                             transform: `translateX(-${currentSlide * 100}%)`
//                         }}
//                     >
//                         <div className="absolute inset-0">
//                             <img
//                                 src={carouselImages[currentSlide].src}
//                                 alt={carouselImages[currentSlide].alt}
//                                 className="w-full h-full object-cover"
//                             />
//                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
//                                 <div className="absolute bottom-8 left-8 text-white">
//                                     <h2 className="text-3xl font-bold mb-2">
//                                         {carouselImages[currentSlide].title}
//                                     </h2>
//                                     <p className="text-lg">
//                                         {carouselImages[currentSlide].subtitle}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     {renderCarouselNavigation()}
//                     {renderCarouselControls()}
//                 </div>

//                 {/* Categorías */}
//                 <div className="mb-8">
//                     <div className="flex flex-wrap gap-4">
//                         {categorias.map((categoria) => (
//                             <button
//                                 key={categoria.value}
//                                 onClick={() => setSelectedCategoria(categoria.value)}
//                                 className={`px-4 py-2 rounded-full ${
//                                     selectedCategoria === categoria.value
//                                         ? 'bg-indigo-600 text-white'
//                                         : 'bg-white text-gray-600 hover:bg-gray-50'
//                                 }`}
//                             >
//                                 {categoria.label}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Lista de Productos */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                     {filteredProductos.map((producto) => (
//                         <div
//                             key={producto.id_producto}
//                             className="bg-white rounded-lg shadow-md overflow-hidden"
//                         >
//                             <div className="relative aspect-square">
//                                 <img
//                                     src={producto.foto || defaultProductImage}
//                                     alt={producto.nombre}
//                                     className="w-full h-full object-cover"
//                                 />
//                                 {producto.stock <= STOCK_THRESHOLD && producto.stock > 0 && (
//                                     <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
//                                         ¡Últimas unidades!
//                                     </div>
//                                 )}
//                                 {producto.stock === 0 && (
//                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                                         <span className="text-white font-bold text-lg">
//                                             Agotado
//                                         </span>
//                                     </div>
//                                 )}
//                             </div>
//                             <div className="p-4">
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                                     {producto.nombre}
//                                 </h3>
//                                 <p className="text-sm text-gray-600 mb-4">
//                                     {producto.descripcion}
//                                 </p>
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-lg font-bold text-indigo-600">
//                                         {formatCurrency(producto.precioVenta)}
//                                     </span>
//                                     <button
//                                         onClick={() => handleAddToCart(producto)}
//                                         disabled={producto.stock === 0}
//                                         className={`px-4 py-2 rounded ${
//                                             producto.stock === 0
//                                                 ? 'bg-gray-300 cursor-not-allowed'
//                                                 : 'bg-indigo-600 text-white hover:bg-indigo-700'
//                                         }`}
//                                     >
//                                         Agregar
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </main>

//             {/* Modales */}
//             {viewMode === 'cart' && (
//                 <CarritoCompras
//                     items={cart}
//                     onUpdateQuantity={handleUpdateQuantity}
//                     onRemoveItem={handleRemoveFromCart}
//                     onClose={handleCloseModal}
//                 />
//             )}

//             {viewMode === 'checkout' && (
//                 <FormularioPago
//                     total={cartTotal}
//                     items={cart}
//                     onPagoCompletado={processPayment}
//                     onBack={() => setViewMode('cart')}
//                 />
//             )}

//             {viewMode === 'success' && (
//                 <ResumenCompra
//                     datosCompra={{
//                         cliente: checkoutInfo,
//                         items: cart,
//                         total: cartTotal,
//                         metodoPago: 'PSE',
//                         referenciaPago: 'MP-' + Date.now(),
//                         fecha: new Date()
//                     }}
//                     onClose={() => {
//                         setViewMode('browsing');
//                         setCart([]);
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default TiendaCliente; 

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProductosService from '../../services/productosService';
import defaultProductImage from '../../assets/images/login1.jpg';
import VentasService from '../../services/ventasServices';
import Swal from 'sweetalert2';
import ResumenCompra from './ResumenCompra';
// Primero, añade estos iconos a tu importación existente:
import {
    FaShoppingCart, FaArrowLeft, FaTrash, FaPlus, FaMinus,
    FaExclamationTriangle, FaCheckCircle, FaUserCircle,
    FaAngleLeft, FaAngleRight,
    // Añade estos nuevos iconos para las tarjetas:
    FaCcVisa, FaCcMastercard, FaCcAmex, FaAngleDown,
    FaUniversity, FaMoneyBillWave, FaCreditCard
} from 'react-icons/fa';

// Luego reemplaza la sección de selección de método de pago con esto:
// Define las categorías predefinidas
const categoriasPredefinidas = [
    { value: 'TODAS', label: 'Todas' },
    { value: 'SNACKS', label: 'Snacks' },
    { value: 'HIGIENE', label: 'Higiene' },
    { value: 'JUGUETERIA', label: 'Juguetería' },
    { value: 'ACCESORIOS', label: 'Accesorios' },
];

// Límite para mostrar "Últimas unidades"
const STOCK_THRESHOLD = 5;

// Imágenes para el carrusel
const carouselImages = [
    {
        src: 'https://placehold.co/1200x300/3730A3/FFF?text=Ofertas+Especiales',
        alt: 'Ofertas especiales',
        title: 'Ofertas Especiales',
        subtitle: 'Hasta 50% de descuento en productos seleccionados'
    },
    {
        src: 'https://placehold.co/1200x300/6366F1/FFF?text=Nuevos+Productos',
        alt: 'Nuevos productos',
        title: 'Nuevos Productos',
        subtitle: 'Conoce nuestras últimas novedades'
    },
    {
        src: 'https://placehold.co/1200x300/4F46E5/FFF?text=Envío+Gratis',
        alt: 'Envío gratis',
        title: 'Envío Gratis',
        subtitle: 'En compras superiores a $50.000'
    },
];

const TiendaCliente = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState(categoriasPredefinidas);
    const [selectedCategoria, setSelectedCategoria] = useState('TODAS');
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('browsing'); // 'browsing', 'cart', 'checkout', 'payment'
    const [checkoutInfo, setCheckoutInfo] = useState({
        nombreCompleto: '', telefono: '', direccion: '', ciudad: '', notasAdicionales: '',
    });
    const [isPlacingOrder, ] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [paymentViewMode, setPaymentViewMode] = useState('method'); // 'method', 'processing', 'success', 'failure'
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // 'creditCard', 'pse', 'cash'
    const [creditCardInfo, setCreditCardInfo] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
    });

    const navigate = useNavigate();

    // Obtener Productos
    const fetchProductos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await ProductosService.getAllProductos();
            if (responseData && Array.isArray(responseData.productos)) {
                const activeProducts = responseData.productos.filter(p => p.estado === 'Activo');
                setProductos(activeProducts);
                setFilteredProductos(activeProducts);

                const uniqueCategorias = ['TODAS', ...new Set(activeProducts.map(p => p.categoria).filter(Boolean))];
                setCategorias(uniqueCategorias.map(cat => ({
                    value: cat,
                    label: cat === 'TODAS' ? 'Todas' : (cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase() || 'Sin Categoría')
                })));
            } else {
                console.warn("Respuesta inesperada o vacía de productos:", responseData);
                setProductos([]);
                setFilteredProductos([]);
                setError('No se pudieron cargar los productos.');
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message || "Error al cargar productos.");
            setProductos([]);
            setFilteredProductos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Autoplay para el carrusel
    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

    // Filtrar Productos por Categoría
    useEffect(() => {
        if (selectedCategoria === 'TODAS') {
            setFilteredProductos(productos);
        } else {
            setFilteredProductos(productos.filter(p => p.categoria === selectedCategoria));
        }
    }, [selectedCategoria, productos]);

    // Funciones del carrusel
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    // Lógica del Carrito
    const addToCart = (producto) => {
        if (producto.stock <= 0) {
            Swal.fire({ icon: 'warning', title: 'Agotado', text: 'Este producto no tiene stock disponible.', timer: 2000, showConfirmButton: false });
            return;
        }

        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.id_producto === producto.id_producto);
            let newCart = [...prevCart];

            if (existingItemIndex > -1) {
                const currentItem = newCart[existingItemIndex];
                if (currentItem.quantity < producto.stock) {
                    newCart[existingItemIndex] = { ...currentItem, quantity: currentItem.quantity + 1 };
                    showToast(`${producto.nombre} añadido (Cantidad: ${currentItem.quantity + 1})`);
                } else {
                    Swal.fire({ icon: 'warning', title: 'Límite alcanzado', text: `No puedes añadir más de ${producto.stock} unidades.`, timer: 2500, showConfirmButton: false });
                }
            } else {
                newCart.push({
                    id_producto: producto.id_producto,
                    nombre: producto.nombre,
                    foto: producto.foto,
                    precioVenta: parseFloat(producto.precioVenta) || 0,
                    quantity: 1,
                    stockAvailable: producto.stock,
                });
                showToast(`${producto.nombre} añadido al carrito`);
            }
            return newCart;
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id_producto !== productId));
        showToast('Producto eliminado', 'info');
    };

    const updateCartQuantity = (productId, amount) => {
        setCart(prevCart => {
            let itemToRemove = false;
            const newCart = prevCart.map(item => {
                if (item.id_producto === productId) {
                    const newQuantity = item.quantity + amount;
                    if (newQuantity <= 0) {
                        itemToRemove = true;
                        return null;
                    } else if (newQuantity <= item.stockAvailable) {
                        return { ...item, quantity: newQuantity };
                    } else {
                        Swal.fire({ icon: 'warning', title: 'Límite alcanzado', text: `Stock disponible: ${item.stockAvailable}.`, timer: 2000, showConfirmButton: false });
                        return item;
                    }
                }
                return item;
            }).filter(item => item !== null);

            if (itemToRemove) {
                showToast('Producto eliminado del carrito', 'info');
            }

            return newCart;
        });
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.precioVenta * item.quantity || 0), 0);
    }, [cart]);

    const cartItemCount = useMemo(() => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }, [cart]);

    // Helpers
    const formatCurrency = (value) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numericValue) || numericValue === null || numericValue === undefined) {
            return '$ 0';
        }
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numericValue);
    };

    const showToast = (message, icon = 'success') => {
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true, didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); } });
        Toast.fire({ icon: icon, title: message });
    };

    // Lógica de Checkout
    const handleCheckoutInputChange = (e) => {
        const { name, value } = e.target;
        setCheckoutInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleProceedToCheckout = () => {
        if (cart.length === 0) {
            Swal.fire('Carrito Vacío', 'Añade productos al carrito antes de proceder.', 'info');
            return;
        }
        setViewMode('checkout');
    };

    const handleProceedToLogin = (e) => {
        e.preventDefault();
        if (!checkoutInfo.nombreCompleto || !checkoutInfo.telefono || !checkoutInfo.direccion || !checkoutInfo.ciudad) {
            Swal.fire('Campos Requeridos', 'Completa los campos de envío (*).', 'warning');
            return;
        }
        if (!/^\d+$/.test(checkoutInfo.telefono)) {
            Swal.fire('Teléfono Inválido', 'Ingresa solo números.', 'warning');
            return;
        }

        try {
            const pendingOrderData = {
                cart: cart,
                checkoutInfo: checkoutInfo,
                timestamp: Date.now()
            };
            sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrderData));
            console.log("Datos de pedido guardados temporalmente:", pendingOrderData);
            navigate('/login?from=checkout');
        } catch (storageError) {
            console.error("Error guardando en sessionStorage:", storageError);
            Swal.fire('Error', 'No se pudo guardar la información del pedido temporalmente.', 'error');
        }
    };

    // Lógica de Pago
    const handleCreditCardChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            const numbersOnly = value.replace(/\D/g, '');
            const truncated = numbersOnly.slice(0, 16);
            formattedValue = truncated.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        } else if (name === 'expiryDate') {
            const numbersOnly = value.replace(/\D/g, '');
            if (numbersOnly.length <= 2) {
                formattedValue = numbersOnly;
            } else {
                formattedValue = `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}`;
            }
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }

        setCreditCardInfo(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!checkoutInfo.nombreCompleto || !checkoutInfo.telefono || !checkoutInfo.direccion || !checkoutInfo.ciudad) {
            Swal.fire('Campos Requeridos', 'Por favor, completa todos los campos de envío (*).', 'warning');
            return;
        }

        if (!/^\d+$/.test(checkoutInfo.telefono)) {
            Swal.fire('Teléfono Inválido', 'Ingresa solo números en el teléfono.', 'warning');
            return;
        }

        setViewMode('payment');
        setPaymentViewMode('method');
    };

    const processPayment = async () => {
        if (selectedPaymentMethod === 'creditCard') {
            if (!creditCardInfo.cardNumber || creditCardInfo.cardNumber.replace(/\s/g, '').length < 16) {
                Swal.fire('Error', 'Número de tarjeta inválido', 'error');
                return;
            }
            if (!creditCardInfo.cardHolder) {
                Swal.fire('Error', 'Ingresa el nombre del titular', 'error');
                return;
            }
            if (!creditCardInfo.expiryDate || creditCardInfo.expiryDate.length < 5) {
                Swal.fire('Error', 'Fecha de expiración inválida', 'error');
                return;
            }
            if (!creditCardInfo.cvv || creditCardInfo.cvv.length < 3) {
                Swal.fire('Error', 'Código de seguridad inválido', 'error');
                return;
            }
        } else if (!selectedPaymentMethod) {
            Swal.fire('Error', 'Selecciona un método de pago', 'error');
            return;
        }

        setPaymentViewMode('processing');

        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const isSuccess = Math.random() > 0.1;

            if (isSuccess) {
                const orderData = {
                    cliente: checkoutInfo,
                    items: cart.map(item => ({
                        id_producto: item.id_producto,
                        cantidad: item.quantity,
                        precioUnitario: item.precioVenta
                    })),
                    total: cartTotal,
                    metodoPago: selectedPaymentMethod,
                    estadoPago: 'PAGADO',
                    referenciaPago: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                };

                const response = await VentasService.createVenta(orderData);

                if (response && response.ok) {
                    setPaymentViewMode('success');
                } else {
                    throw new Error(response?.msg || 'No se pudo registrar la venta.');
                }
            } else {
                setPaymentViewMode('failure');
                await new Promise(resolve => setTimeout(resolve, 2000));
                Swal.fire({
                    icon: 'error',
                    title: 'Error en el Pago',
                    text: 'Tu banco ha rechazado la transacción. Por favor intenta con otro método de pago.',
                    confirmButtonText: 'Intentar de nuevo'
                });
                setPaymentViewMode('method');
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            setPaymentViewMode('failure');
            Swal.fire('Error', error.message || 'Hubo un problema al procesar el pago.', 'error');
        }
    };

    // Agrega esto justo después de tus declaraciones de estado
    const paymentCodes = [
        "3854 9625 1078",
        "7412 5890 3216",
        "2580 1472 9630",
        "9513 6842 0715",
        "1289 5736 4280",
        "6540 9378 2156",
        "8024 7613 5829",
        "4703 8126 5948",
        "5821 0937 4602",
        "3067 4195 8273",
        "7934 2650 1894",
        "2046 7513 9820",
        "9485 3061 7254",
        "5318 9746 0231",
        "8642 1075 3906",
        "4097 6253 8140",
        "1570 8243 6921",
        "6384 0715 9268",
        "2981 5437 0624",
        "7453 1896 0274"
    ];

    // Agrega después de tus declaraciones de estado
    const [randomPaymentCode, setRandomPaymentCode] = useState('');

    // Agrega esta función después de tus otras funciones en el componente
    const generateRandomCode = () => {
        const randomIndex = Math.floor(Math.random() * paymentCodes.length);
        return paymentCodes[randomIndex];
    };

    // Asegúrate de generar un código cuando se selecciona el método de pago en efectivo
    // Puedes agregar esto dentro de una función useEffect
    useEffect(() => {
        if (selectedPaymentMethod === 'cash') {
            setRandomPaymentCode(generateRandomCode());
        }
    }, [selectedPaymentMethod]);

    // Renderizado
    const renderCategoryBar = () => (
        <div className="mb-4 bg-white p-4 rounded-lg shadow-md border border-gray-200 sticky top-0 z-30">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center sm:text-left">Explora Nuestras Categorías</h2>
            <Link
                to="/login"
                className="fixed top-4 right-4 bg-white text-indigo-600 p-3 rounded-full shadow-lg hover:bg-indigo-100 hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center"
                title="Iniciar Sesión / Mi Cuenta"
            >
                <FaUserCircle size={24} />
            </Link>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                {categorias.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategoria(cat.value)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm border
                            ${selectedCategoria === cat.value
                                ? 'bg-indigo-600 text-white border-indigo-700 ring-indigo-500'
                                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 ring-indigo-500'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderCarousel = () => (
        <div className="mb-8 relative overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-48 md:h-64 lg:h-72 w-full bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden">
                <div className="h-full w-full relative">
                    {carouselImages.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                                <h2 className="text-xl md:text-2xl font-bold">{image.title}</h2>
                                <p className="text-sm md:text-base mt-1">{image.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Anterior"
                >
                    <FaAngleLeft size={20} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Siguiente"
                >
                    <FaAngleRight size={20} />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {carouselImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 w-6 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                            aria-label={`Ir a slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderProductCard = (producto) => {
        const isInCart = cart.some(item => item.id_producto === producto.id_producto);
        const currentCartItem = cart.find(item => item.id_producto === producto.id_producto);
        const canAddToCart = producto.stock > (currentCartItem?.quantity || 0);
        const showStockWarning = producto.stock > 0 && producto.stock <= STOCK_THRESHOLD;
        const isOutOfStock = producto.stock <= 0;

        return (
            <div key={producto.id_producto} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 flex flex-col transform transition duration-300 hover:shadow-xl hover:-translate-y-1.5">
                <div className="relative h-52 w-full bg-gradient-to-br from-gray-50 to-gray-100 group">
                    <img
                        src={producto.foto || defaultProductImage}
                        alt={producto.nombre}
                        className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.src = defaultProductImage; }}
                    />
                    <div className="absolute top-2 right-2 space-y-1">
                        {showStockWarning && !isOutOfStock && (
                            <span className="block bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center animate-pulse">
                                <FaExclamationTriangle className="mr-1.5" />  ¡{producto.stock} Últimas unidades!
                            </span>
                        )}
                        {isOutOfStock && (
                            <span className="block bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                                Agotado
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">{producto.categoria || 'General'}</span>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 truncate h-7" title={producto.nombre}>{producto.nombre}</h3>
                    <p className="text-2xl font-extrabold text-gray-900 mb-5">{formatCurrency(producto.precioVenta)}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button
                            onClick={() => addToCart(producto)}
                            disabled={isOutOfStock || !canAddToCart}
                            className={`w-full text-black font-bold py-2.5 px-4 rounded-lg transition duration-200 ease-in-out flex items-center justify-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                                ${isInCart && canAddToCart ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500' : ''}
                                ${isInCart && !canAddToCart ? 'bg-yellow-500 focus:ring-yellow-500 cursor-not-allowed' : ''}
                                ${!isInCart && !isOutOfStock ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' : ''}
                                ${isOutOfStock ? 'bg-gray-400 focus:ring-gray-400' : ''}
                            `}
                        >
                            {isOutOfStock ? 'Agotado' :
                                isInCart && canAddToCart ? <FaPlus size={14} /> :
                                    isInCart && !canAddToCart ? <FaExclamationTriangle size={14} /> :
                                        <FaShoppingCart size={16} />}
                            {isOutOfStock ? 'Agotado' :
                                isInCart && canAddToCart ? 'Añadir Otro' :
                                    isInCart && !canAddToCart ? 'Máximo' :
                                        'Añadir al Carrito'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderCartView = () => (
        <div className="bg-white p-6 rounded-lg shadow-xl border animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Tu Carrito</h2>
                <button onClick={() => setViewMode('browsing')} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 text-sm sm:text-base">
                    <FaArrowLeft /> Continuar Comprando
                </button>
            </div>
            {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    <FaShoppingCart size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg">Tu carrito está vacío.</p>
                    <p className="text-sm mt-1">¡Añade algunos productos para empezar!</p>
                </div>
            ) : (
                <>
                    <div className="space-y-5 mb-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {cart.map(item => (
                            <div key={item.id_producto} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-150">
                                <div className="flex items-center gap-4 mb-3 sm:mb-0 flex-grow w-full sm:w-auto">
                                    <img src={item.foto || defaultProductImage} alt={item.nombre} className="w-20 h-20 object-contain rounded border bg-gray-50 p-1" onError={(e) => { e.currentTarget.src = defaultProductImage; }} />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-900 text-base">{item.nombre}</p>
                                        <p className="text-sm text-gray-600">{formatCurrency(item.precioVenta)} c/u</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mx-0 sm:mx-4 my-2 sm:my-0">
                                    <button onClick={() => updateCartQuantity(item.id_producto, -1)} className="bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-600 p-1.5 rounded-full transition-colors disabled:opacity-50" title="Disminuir"><FaMinus size={12} /></button>
                                    <span className="font-bold w-8 text-center text-lg">{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item.id_producto, 1)} disabled={item.quantity >= item.stockAvailable} className="bg-gray-200 hover:bg-green-100 text-gray-700 hover:text-green-600 p-1.5 rounded-full transition-colors disabled:opacity-50" title="Aumentar"><FaPlus size={12} /></button>
                                </div>
                                <p className="font-bold text-lg w-28 text-right my-2 sm:my-0">{formatCurrency(item.precioVenta * item.quantity)}</p>
                                <button onClick={() => removeFromCart(item.id_producto)} className="ml-2 sm:ml-5 text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors" title="Eliminar"><FaTrash /></button>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-2xl font-bold text-gray-900">
                            Total: {formatCurrency(cartTotal)}
                        </p>
                        <button
                            onClick={handleProceedToCheckout}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center gap-2 transition duration-150 w-full md:w-auto justify-center text-lg transform hover:scale-105 active:scale-100"
                        >
                            <FaCheckCircle /> Ingresar Datos de Envío
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    const renderCheckoutView = () => (
        <div className="bg-white p-6 rounded-lg shadow-xl border animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Datos de Envío</h2>
                <button
                    onClick={() => setViewMode('cart')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 text-sm sm:text-base"
                >
                    <FaArrowLeft /> Volver al Carrito
                </button>
            </div>
            <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="col-span-1">
                        <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            id="nombreCompleto"
                            name="nombreCompleto"
                            value={checkoutInfo.nombreCompleto}
                            onChange={handleCheckoutInputChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Tu nombre completo"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono/Móvil *
                        </label>
                        <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            value={checkoutInfo.telefono}
                            onChange={handleCheckoutInputChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Solo números"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección de Entrega *
                        </label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={checkoutInfo.direccion}
                            onChange={handleCheckoutInputChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Calle, número, apto..."
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-1">
                            Ciudad *
                        </label>
                        <input
                            type="text"
                            id="ciudad"
                            name="ciudad"
                            value={checkoutInfo.ciudad}
                            onChange={handleCheckoutInputChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Tu ciudad"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label htmlFor="notasAdicionales" className="block text-sm font-medium text-gray-700 mb-1">
                            Notas Adicionales (opcional)
                        </label>
                        <textarea
                            id="notasAdicionales"
                            name="notasAdicionales"
                            value={checkoutInfo.notasAdicionales}
                            onChange={handleCheckoutInputChange}
                            rows="3"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Instrucciones especiales para la entrega..."
                        ></textarea>
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
                    <button
                        type="button"
                        onClick={handleProceedToLogin}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-150 w-full sm:w-auto"
                    >
                        <FaUserCircle /> Continuar a Login/Registro
                    </button>
                    <button
                        type="submit"
                        disabled={isPlacingOrder}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-150 w-full sm:w-auto"
                    >
                        {isPlacingOrder ? 'Procesando...' : 'Proceder al Pago (Invitado)'} <FaCheckCircle />
                    </button>
                </div>
            </form>
        </div>
    );

    const renderPaymentView = () => {
        if (paymentViewMode === 'method') {
            return (
                <div className="bg-white p-6 rounded-lg shadow-xl border animate-fade-in max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 gap-4">
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Método de Pago</h2>
                        <button
                            onClick={() => setViewMode('checkout')}
                            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 text-sm sm:text-base"
                        >
                            <FaArrowLeft /> Volver a Datos de Envío
                        </button>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Selecciona cómo quieres pagar:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div
                                onClick={() => setSelectedPaymentMethod('creditCard')}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === 'creditCard'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="flex items-center justify-center mb-3 relative">
                                    <div className="flex space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg shadow-md w-full">
                                        <FaCcVisa className="text-white text-3xl" />
                                        <FaCcMastercard className="text-white text-3xl" />
                                        <FaCcAmex className="text-white text-3xl" />
                                    </div>
                                </div>
                                <h4 className="text-center font-medium">Tarjeta de Crédito/Débito</h4>
                            </div>
                            <div
                                onClick={() => setSelectedPaymentMethod('pse')}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === 'pse'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="flex items-center justify-center mb-3">
                                    <div className="bg-green-600 p-3 rounded-lg shadow-md w-full flex items-center justify-center">
                                        <FaUniversity className="text-white text-3xl mr-2" />
                                        <span className="text-white font-bold text-xl">PSE</span>
                                    </div>
                                </div>
                                <h4 className="text-center font-medium">PSE - Débito Bancario</h4>
                            </div>
                            <div
                                onClick={() => setSelectedPaymentMethod('cash')}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === 'cash'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="flex items-center justify-center mb-3">
                                    <div className="bg-orange-500 p-3 rounded-lg shadow-md w-full flex items-center justify-center">
                                        <FaMoneyBillWave className="text-white text-3xl mr-2" />
                                        <span className="text-white font-bold text-xl">EFECTIVO</span>
                                    </div>
                                </div>
                                <h4 className="text-center font-medium">Pago en Efectivo</h4>
                            </div>
                        </div>
                    </div>

                    {selectedPaymentMethod === 'creditCard' && (
                        <div className="border rounded-lg p-5 bg-gray-50 mb-6 animate-fade-in">
                            <h3 className="text-lg font-medium mb-4">Ingresa los datos de tu tarjeta</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2 relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={creditCardInfo.cardNumber}
                                            onChange={handleCreditCardChange}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <div className="absolute right-3 top-2.5">
                                            {creditCardInfo.cardNumber.startsWith('4') && <FaCcVisa className="text-blue-600 text-2xl" />}
                                            {creditCardInfo.cardNumber.startsWith('5') && <FaCcMastercard className="text-red-500 text-2xl" />}
                                            {creditCardInfo.cardNumber.startsWith('3') && <FaCcAmex className="text-blue-500 text-2xl" />}
                                            {!creditCardInfo.cardNumber.startsWith('3') &&
                                                !creditCardInfo.cardNumber.startsWith('4') &&
                                                !creditCardInfo.cardNumber.startsWith('5') &&
                                                creditCardInfo.cardNumber &&
                                                <FaCreditCard className="text-gray-500 text-2xl" />}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titular de la Tarjeta</label>
                                    <input
                                        type="text"
                                        name="cardHolder"
                                        value={creditCardInfo.cardHolder}
                                        onChange={handleCreditCardChange}
                                        placeholder="Como aparece en la tarjeta"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={creditCardInfo.expiryDate}
                                            onChange={handleCreditCardChange}
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={creditCardInfo.cvv}
                                                onChange={handleCreditCardChange}
                                                placeholder="123"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <div className="absolute right-3 top-3 text-gray-400">
                                                <FaCreditCard className="text-lg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vista previa de la tarjeta */}
                            <div className="mt-6 w-full max-w-md mx-auto">
                                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-xl shadow-lg relative overflow-hidden h-48">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>

                                    <div className="flex justify-between items-start">
                                        <div className="text-white font-bold text-xl">Tarjeta Digital</div>
                                        <FaCreditCard className="text-white text-2xl" />
                                    </div>

                                    <div className="mt-10 text-white text-xl tracking-wider font-mono">
                                        {creditCardInfo.cardNumber ?
                                            creditCardInfo.cardNumber.replace(/(.{4})/g, '$1 ').trim() :
                                            "**** **** **** ****"}
                                    </div>

                                    <div className="mt-4 flex justify-between">
                                        <div className="text-gray-200 text-xs">
                                            <div className="mb-1">TITULAR</div>
                                            <div className="font-semibold tracking-wider">
                                                {creditCardInfo.cardHolder || "TU NOMBRE"}
                                            </div>
                                        </div>
                                        <div className="text-gray-200 text-xs">
                                            <div className="mb-1">VENCE</div>
                                            <div className="font-semibold tracking-wider">
                                                {creditCardInfo.expiryDate || "MM/YY"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedPaymentMethod === 'pse' && (
                        <div className="border rounded-lg p-5 bg-gray-50 mb-6 animate-fade-in">
                            <h3 className="text-lg font-medium mb-4">Pago por PSE</h3>

                            <div className="mb-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                <div className="flex items-center mb-4">
                                    <div className="bg-green-600 p-2 rounded-lg mr-3">
                                        <FaUniversity className="text-white text-xl" />
                                    </div>
                                    <h4 className="font-medium text-gray-800">Selecciona tu banco</h4>
                                </div>

                                <div className="relative">
                                    <select className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white">
                                        <option value="">Selecciona una entidad bancaria</option>
                                        <option value="bancolombia">Bancolombia</option>
                                        <option value="davivienda">Davivienda</option>
                                        <option value="bbva">BBVA</option>
                                        <option value="bogota">Banco de Bogotá</option>
                                        <option value="popular">Banco Popular</option>
                                    </select>
                                    <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                                        <FaAngleDown className="text-lg" />
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-3">Al hacer clic en "Ir a mi Banco", serás redirigido al sistema de tu banco para completar la transacción.</p>


                        </div>
                    )}
                    {selectedPaymentMethod === 'cash' && (
                        <div className="border rounded-lg p-5 bg-gray-50 mb-6 animate-fade-in">
                            <h3 className="text-lg font-medium mb-4">Pago en Efectivo</h3>

                            <div className="mb-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                <div className="text-center mb-4">
                                    <div className="bg-orange-500 inline-flex p-3 rounded-full mb-3">
                                        <FaMoneyBillWave className="text-white text-2xl" />
                                    </div>
                                    <h4 className="font-medium text-gray-800">Código de pago</h4>
                                </div>
                                <div className="text-center mt-2">
                                <button
                                    onClick={() => setRandomPaymentCode(generateRandomCode())}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-end mx-auto"                                >
                                    <FaCheckCircle className="mr-1" /> Generar nuevo código
                                </button>
                            </div>

                                <div className="bg-gray-100 p-4 rounded-lg text-center mb-3">
                                    <div className="font-mono text-2xl font-bold tracking-widest text-gray-800">
                                        {randomPaymentCode}
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">Válido por 48 horas</p>
                                </div>
                            </div>

                         
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center flex-col">
                                    <div className="bg-red-100 p-2 rounded-full mb-2">
                                        <FaMoneyBillWave className="text-red-600" />
                                    </div>
                                    <p className="text-center text-sm font-medium">Efecty</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center flex-col">
                                    <div className="bg-blue-100 p-2 rounded-full mb-2">
                                        <FaMoneyBillWave className="text-blue-600" />
                                    </div>
                                    <p className="text-center text-sm font-medium">Baloto</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center flex-col">
                                    <div className="bg-green-100 p-2 rounded-full mb-2">
                                        <FaUniversity className="text-green-600" />
                                    </div>
                                    <p className="text-center text-sm font-medium">Corresponsales</p>
                                </div>
                            </div>


                        </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Resumen del Pedido</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">{cartItemCount} artículo(s)</span>
                            <span className="font-semibold">{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>TOTAL A PAGAR:</span>
                                <span>{formatCurrency(cartTotal)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={processPayment}
                            disabled={!selectedPaymentMethod}
                            className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 ${selectedPaymentMethod ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {selectedPaymentMethod === 'creditCard' && 'Pagar con Tarjeta'}
                            {selectedPaymentMethod === 'pse' && 'Ir a mi Banco'}
                            {selectedPaymentMethod === 'cash' && 'Generar Código de Pago'}
                            {!selectedPaymentMethod && 'Selecciona un método'}
                        </button>
                    </div>
                </div>
            );
        }

        if (paymentViewMode === 'processing') {
            return (
                <div className="bg-white p-8 rounded-lg shadow-xl border max-w-md mx-auto text-center">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600 mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Procesando Pago</h2>
                    <p className="text-gray-600">Por favor espera, estamos procesando tu pago...</p>
                    <p className="text-gray-500 text-sm mt-6">No cierres esta ventana</p>
                </div>
            );
        }

        if (paymentViewMode === 'success') {
            const datosCompra = {
                cliente: checkoutInfo,
                items: cart,
                total: cartTotal,
                metodoPago: selectedPaymentMethod === 'creditCard' ? 'Tarjeta de Crédito' :
                           selectedPaymentMethod === 'pse' ? 'PSE' :
                           selectedPaymentMethod === 'cash' ? 'Efectivo' : selectedPaymentMethod,
                referenciaPago: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                fecha: new Date()
            };

            return <ResumenCompra 
                datosCompra={datosCompra}
                onClose={() => {
                    setCart([]);
                    setCheckoutInfo({ nombreCompleto: '', telefono: '', direccion: '', ciudad: '', notasAdicionales: '' });
                    setCreditCardInfo({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
                    setSelectedPaymentMethod(null);
                    setViewMode('browsing');
                }}
            />;
        }

        if (paymentViewMode === 'failure') {
            return (
                <div className="bg-white p-8 rounded-lg shadow-xl border max-w-md mx-auto text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaExclamationTriangle size={40} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-700 mb-3">Error en el Pago</h2>
                    <p className="text-gray-600">Lo sentimos, no pudimos procesar tu pago.</p>
                    <p className="text-gray-500 text-sm mt-6">Intentando nuevamente...</p>
                </div>
            );
        }

        return null;
    };

    const renderProductsGrid = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md text-center my-10">
                    <FaExclamationTriangle size={30} className="mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">Error al cargar productos</h3>
                    <p>{error}</p>
                    <button
                        onClick={fetchProductos}
                        className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
                    >
                        Reintentar
                    </button>
                </div>
            );
        }

        if (filteredProductos.length === 0) {
            return (
                <div className="text-center py-16">
                    <p className="text-gray-600 text-lg">
                        No hay productos disponibles en esta categoría.
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProductos.map(producto => renderProductCard(producto))}
            </div>
        );
    };

    const renderCartFloatingButton = () => (
        <button
            onClick={() => setViewMode('cart')}
            className={`fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 z-50 
            ${cart.length > 0 ? 'animate-bounce' : ''}`}
            aria-label="Ver carrito"
        >
            <div className="relative">
                <FaShoppingCart size={24} />
                {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {cartItemCount}
                    </span>
                )}
            </div>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            {viewMode === 'browsing' && cart.length > 0 && renderCartFloatingButton()}
            <div className="container mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Manchas y Pecas</h1>
                    <p className="text-gray-600 mt-2">Los mejores productos al alcance de un clic</p>
                </div>
                {viewMode === 'browsing' && (
                    <>
                        {renderCategoryBar()}
                        {renderCarousel()}
                        {renderProductsGrid()}
                    </>
                )}
                {viewMode === 'cart' && renderCartView()}
                {viewMode === 'checkout' && renderCheckoutView()}
                {viewMode === 'payment' && renderPaymentView()}
            </div>
        </div>
    );
};

export default TiendaCliente;

