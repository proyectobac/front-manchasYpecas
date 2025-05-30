// src/components/tienda/tienda.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ProductosService from '../../services/productosService'; // Usaremos el servicio actualizado
import defaultProductImage from '../../assets/images/login1.jpg'; // Ajusta la ruta si es necesario
import VentasService from '../../services/ventasServices';
import Swal from 'sweetalert2';
// Asumimos que tienes un servicio para obtener detalles del usuario
import UsuariosService from '../../services/usuariosService'; // Asegúrate que este servicio exista y tenga getUserDetails

import ResumenCompra from './ResumenCompra';
import CarritoCompras from './CarritoCompras';
import FormularioCheckout from './FormularioCheckout';
import MetodosDePago from './MetodosDePago';

import {
    FaShoppingCart, FaUserCircle,
    FaAngleLeft, FaAngleRight, FaExclamationTriangle, FaStore
} from 'react-icons/fa';


const STOCK_THRESHOLD = 5;

const carouselImages = [
    { 
        src: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=60',
        alt: 'Ofertas especiales', 
        title: 'Ofertas Especiales', 
        subtitle: 'Hasta 50% de descuento en accesorios'
    },
    { 
        src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=60',
        alt: 'Nuevos productos', 
        title: 'Nuevos Productos', 
        subtitle: 'Para gatos y perros'
    },
    { 
        src: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=60',
        alt: 'Envío gratis', 
        title: 'Envío Gratis', 
        subtitle: 'En compras superiores a $50.000'
    },
    { 
        src: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=60',
        alt: 'Gato naranja', 
        title: 'Alimentos Premium', 
        subtitle: 'Para tu felino consentido'
    },
    { 
        src: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=60',
        alt: 'Perro sonriente',
        title: 'Juguetes y Accesorios',
        subtitle: 'Para la diversión de tu mascota'
    },
    { 
        src: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=60',
        alt: 'Gato mirando', 
        title: 'Cuidado Especial',
        subtitle: 'Todo para su bienestar'
    },
    { 
        src: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=60',
        alt: 'Perro golden',
        title: 'Productos de Calidad',
        subtitle: 'Las mejores marcas'
    },
    { 
        src: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=60',
        alt: 'Gato elegante',
        title: 'Higiene y Cuidado',
        subtitle: 'Mantén a tu mascota feliz'
    }
];


const TiendaCliente = () => {
    // Estado para todos los productos cargados, agrupados por categoría desde el backend
    const [productosPorCategoria, setProductosPorCategoria] = useState({});
    const [productosNormales, setProductosNormales] = useState([]); // Nuevo estado para productos normales
    // Estado para las categorías disponibles (los nombres/claves del objeto anterior)
    const [categorias, setCategorias] = useState([]);
    
    const [selectedCategoria, setSelectedCategoria] = useState('TODAS');
    // Estado para los productos que se muestran actualmente (filtrados por selectedCategoria)
    const [filteredProductos, setFilteredProductos] = useState([]);
    
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [viewMode, setViewMode] = useState('browsing');
    const [checkoutInfo, setCheckoutInfo] = useState({
        nombreCompleto: '', telefono: '', direccion: '', ciudad: '', notasAdicionales: '',
        tipoDocumento: 'CC', numeroDocumento: '', email: '', tipoPersona: 'natural'
    });
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [ordenCompletada, setOrdenCompletada] = useState(null);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = () => !!localStorage.getItem('token');

    const loadUserDetails = async () => { // No necesita userData como argumento si lo toma de localStorage
        const userDataString = localStorage.getItem('user');
        if (!userDataString) return;

        try {
            const storedUser = JSON.parse(userDataString);
            if (storedUser && storedUser.userId) { // Asegúrate que `userId` esté en el objeto 'user' guardado
                const userDetails = await UsuariosService.getUserDetails(storedUser.userId);
                console.log("Datos completos del usuario cargados:", userDetails);
                
                const nombreCompleto = [userDetails.nombre_usuario, userDetails.apellido].filter(Boolean).join(' ').trim();
                
                setCheckoutInfo(prev => ({
                    ...prev,
                    nombreCompleto: nombreCompleto || prev.nombreCompleto,
                    email: userDetails.correo || prev.email,
                    telefono: userDetails.telefono || prev.telefono,
                    numeroDocumento: userDetails.documento || prev.numeroDocumento,
                    // No sobrescribir dirección/ciudad si ya están llenos por el usuario y no vienen del perfil
                    direccion: prev.direccion || userDetails.direccion_cliente || '', // Asume que puede venir de 'direccion_cliente'
                    ciudad: prev.ciudad || userDetails.ciudad_cliente || '',       // Asume que puede venir de 'ciudad_cliente'
                }));
            }
        } catch (error) {
            console.error("Error al cargar detalles del usuario:", error);
            // No mostrar Swal aquí para no interrumpir, solo loguear.
        }
    };
    
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart from localStorage", e);
                localStorage.removeItem('cart');
            }
        }
        
        if (isAuthenticated()) {
            const pendingOrder = sessionStorage.getItem('pendingOrder');
            if (pendingOrder) {
                try {
                    const { cart: pendingCart, checkoutInfo: pendingCheckoutInfo } = JSON.parse(pendingOrder);
                    setCart(pendingCart); 
                    setCheckoutInfo(pendingCheckoutInfo);
                    setViewMode('checkoutInfo');
                    sessionStorage.removeItem('pendingOrder');
                } catch (e) {
                    console.error("Error parsing pendingOrder from sessionStorage", e);
                    sessionStorage.removeItem('pendingOrder');
                }
            } else {
                // Si no hay pending order, intentar cargar datos del usuario logueado
                loadUserDetails();
            }
        }
    }, []); // Solo al montar

    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('cart', JSON.stringify(cart));
        } else if (localStorage.getItem('cart')) { // Solo remover si existe
            localStorage.removeItem('cart');
        }
    }, [cart]);

    const fetchTodosLosProductos = useCallback(async () => {
        try {
            const response = await ProductosService.getAllProductos();
            if (response && response.productos) {
                // Aplicar el mismo filtro que usamos para los otros productos
                const productosFiltrados = response.productos.filter(p => {
                    const precio = parseFloat(p.precioVenta);
                    const cumpleFiltros = p.estado === 'Activo' && 
                           !isNaN(precio) && 
                           precio > 0 && 
                           parseInt(p.stock) > 0;
                    
                    if (!cumpleFiltros) {
                        console.log('Producto filtrado (getAllProductos):', p.nombre, {
                            activo: p.estado === 'Activo',
                            precioValido: !isNaN(precio) && precio > 0,
                            stockValido: parseInt(p.stock) > 0
                        });
                    }
                    return cumpleFiltros;
                });
                
                console.log('Productos filtrados (getAllProductos):', productosFiltrados);
                setProductosNormales(productosFiltrados);
            }
        } catch (error) {
            console.error('Error al obtener todos los productos:', error);
        }
    }, []);

    const fetchProductosYCategorias = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await ProductosService.getProductosFromImagenesByCategoria();
            console.log('Productos recibidos:', responseData);
            
            if (responseData && responseData.success && typeof responseData.productos === 'object') {
                setProductosPorCategoria(responseData.productos);
                
                const categoriasObtenidas = Object.keys(responseData.productos);
                console.log('Categorías obtenidas:', categoriasObtenidas);
                
                const categoriasValidas = categoriasObtenidas.filter(catKey => 
                    Array.isArray(responseData.productos[catKey]) && 
                    responseData.productos[catKey].length > 0
                );
                console.log('Categorías válidas:', categoriasValidas);

                const categoriasFormateadas = ['TODAS', ...categoriasValidas].map(catKey => ({
                    value: catKey,
                    label: catKey === 'TODAS' ? 'Todas las Categorías' : (catKey.charAt(0).toUpperCase() + catKey.slice(1).toLowerCase().replace(/_/g, ' '))
                }));
                
                setCategorias(categoriasFormateadas);
                setSelectedCategoria('TODAS');
            } else {
                throw new Error(responseData.error || 'No se pudieron cargar los productos.');
            }
        } catch (err) {
            setError(err.message || "Error al cargar productos.");
            setProductosPorCategoria({});
            setCategorias([{ value: 'TODAS', label: 'Todas las Categorías' }]);
            console.error("Error en fetchProductosYCategorias:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductosYCategorias();
        fetchTodosLosProductos(); // Llamar a la nueva función
    }, [fetchProductosYCategorias, fetchTodosLosProductos]);

    useEffect(() => {
        if (loading || (Object.keys(productosPorCategoria).length === 0 && productosNormales.length === 0)) {
            setFilteredProductos([]);
            return;
        }
        
        let results = [];
        if (selectedCategoria === 'TODAS') {
            // Combinar productos de ambas fuentes
            const productosDesdeImagenes = Object.values(productosPorCategoria).flat();
            results = [...productosDesdeImagenes, ...productosNormales]
                .filter(p => {
                    const precio = parseFloat(p.precioVenta);
                    const cumpleFiltros = p.estado === 'Activo' && 
                           !isNaN(precio) && 
                           precio > 0 && 
                           parseInt(p.stock) > 0;
                    
                    if (!cumpleFiltros) {
                        console.log('Producto filtrado:', p.nombre, {
                            activo: p.estado === 'Activo',
                            precioValido: !isNaN(precio) && precio > 0,
                            stockValido: parseInt(p.stock) > 0
                        });
                    }
                    return cumpleFiltros;
                });
        } else {
            // Combinar productos de la categoría seleccionada de ambas fuentes
            const productosDesdeImagenes = productosPorCategoria[selectedCategoria] || [];
            const productosDesdeNormal = productosNormales.filter(p => p.categoria === selectedCategoria);
            results = [...productosDesdeImagenes, ...productosDesdeNormal]
                .filter(p => {
                    const precio = parseFloat(p.precioVenta);
                    const cumpleFiltros = p.estado === 'Activo' && 
                           !isNaN(precio) && 
                           precio > 0 && 
                           parseInt(p.stock) > 0;
                    
                    if (!cumpleFiltros) {
                        console.log('Producto filtrado en categoría específica:', p.nombre, {
                            activo: p.estado === 'Activo',
                            precioValido: !isNaN(precio) && precio > 0,
                            stockValido: parseInt(p.stock) > 0
                        });
                    }
                    return cumpleFiltros;
                });
        }
        
        // Eliminar duplicados basados en id_producto
        results = results.filter((producto, index, self) =>
            index === self.findIndex((p) => p.id_producto === producto.id_producto)
        );
        
        console.log('Productos filtrados:', results);
        setFilteredProductos(results);
    }, [selectedCategoria, productosPorCategoria, productosNormales, loading]);

    const formatCurrency = (value) => { /* ... sin cambios ... */ 
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numericValue) || numericValue === null || numericValue === undefined) return '$ 0';
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numericValue);
    };
    const showToast = (message, icon = 'success') => { /* ... sin cambios ... */ 
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true, didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); } });
        Toast.fire({ icon: icon, title: message });
    };
    
    const addToCart = (producto) => {
        if (producto.stock <= 0) {
            Swal.fire({ icon: 'warning', title: 'Agotado', text: 'Este producto no tiene stock disponible.', timer: 2000, showConfirmButton: false });
            return;
        }

        // Validar que el precio sea mayor que 0
        const precio = parseFloat(producto.precioVenta);
        if (!precio || precio <= 0) {
            Swal.fire({ icon: 'warning', title: 'Producto no disponible', text: 'Este producto no está disponible para la venta en este momento.', timer: 2000, showConfirmButton: false });
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
                    precioVenta: precio,
                    quantity: 1,
                    stockAvailable: producto.stock,
                    categoria: producto.categoria
                });
                showToast(`${producto.nombre} añadido al carrito`);
            }
            return newCart;
        });
    };
    const removeFromCart = (productId) => { /* ... sin cambios ... */ 
        setCart(prevCart => prevCart.filter(item => item.id_producto !== productId));
        showToast('Producto eliminado', 'info');
    };
    const updateCartQuantity = (productId, amount) => { /* ... sin cambios ... */ 
        setCart(prevCart => {
            let itemToRemove = false;
            const newCart = prevCart.map(item => {
                if (item.id_producto === productId) {
                    const newQuantity = item.quantity + amount;
                    if (newQuantity <= 0) { itemToRemove = true; return null; }
                    if (newQuantity <= item.stockAvailable) return { ...item, quantity: newQuantity };
                    Swal.fire({ icon: 'warning', title: 'Límite alcanzado', text: `Stock disponible: ${item.stockAvailable}.`, timer: 2000, showConfirmButton: false });
                    return item;
                }
                return item;
            }).filter(item => item !== null);
            if (itemToRemove) showToast('Producto eliminado del carrito', 'info');
            return newCart;
        });
    };
    const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.precioVenta * item.quantity || 0), 0), [cart]);
    const cartItemCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
    const handleCheckoutInfoChange = (e) => { /* ... sin cambios ... */ 
        const { name, value } = e.target;
        setCheckoutInfo(prev => ({ ...prev, [name]: value }));
    };
    
    const handleProceedToPaymentFromCheckout = () => { /* ... sin cambios ... */ 
        if (!checkoutInfo.nombreCompleto || !checkoutInfo.telefono || !checkoutInfo.direccion || !checkoutInfo.ciudad) {
            Swal.fire('Campos Requeridos', 'Completa todos los campos de envío (*).', 'warning'); return;
        }
        if (!/^\d+$/.test(checkoutInfo.telefono)) {
            Swal.fire('Teléfono Inválido', 'Ingresa solo números.', 'warning'); return;
        }
        if (!checkoutInfo.email || !checkoutInfo.numeroDocumento) {
            Swal.fire('Campos Adicionales Requeridos', 'Email y Número de Documento son necesarios para el pago.', 'warning'); return;
        }
        const nombreParts = checkoutInfo.nombreCompleto.trim().split(/\s+/);
        if (nombreParts.length < 2) {
            Swal.fire('Nombre Incompleto', 'Por favor ingresa nombre y apellido.', 'warning'); return;
        }
        if (isAuthenticated()) {
            setViewMode('payment');
        } else {
            const pendingOrderData = { cart, checkoutInfo: {...checkoutInfo, nombreCompleto: checkoutInfo.nombreCompleto.trim()}, timestamp: Date.now() };
            sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrderData));
            navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
            Swal.fire({ title: 'Inicia Sesión para Continuar', text: 'Necesitas iniciar sesión o registrarte para completar tu compra.', icon: 'info', confirmButtonText: 'Entendido' });
        }
    };
    
    const handleFinalizeOrder = async (paymentResult) => {
        setIsPlacingOrder(true);
        const { success, data, paymentMethod, isRedirect, redirectUrl } = paymentResult;

        if (isRedirect && redirectUrl) {
            window.location.href = redirectUrl;
            setIsPlacingOrder(false);
            return;
        }
        if (success) {
            const orderDataToSave = {
                cliente: checkoutInfo,
                items: data.items || cart.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.quantity,
                    precioUnitario: item.precioVenta,
                    nombre: item.nombre
                })),
                total: cartTotal,
                metodoPago: paymentMethod,
                estadoPago: 'PAGADO',
                referenciaPago: data.referenciaPago || `REF-${Date.now()}`
            };
            try {
                setOrdenCompletada({...orderDataToSave, fecha: new Date()});
                setViewMode('success');
                setCart([]);
                localStorage.removeItem('cart');
            } catch (error) {
                console.error("Error finalizando orden:", error);
                Swal.fire('Error', error.message || 'Hubo un problema al finalizar la orden.', 'error');
                setViewMode('payment');
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error en el Pago',
                text: data.errorMessage || 'Tu transacción no pudo ser completada.',
                confirmButtonText: 'Intentar de nuevo'
            });
            setViewMode('payment');
        }
        setIsPlacingOrder(false);
    };

    // Lógica de carrusel (sin cambios)
    useEffect(() => {
        let interval;
        if (isAutoPlaying && carouselImages.length > 0) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
            }, 5000); // Cambiado a 5 segundos para el carrusel
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, carouselImages.length]);

    const nextSlide = () => { /* ... sin cambios ... */ 
        setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
        setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 10000);
    };
    const prevSlide = () => { /* ... sin cambios ... */ 
        setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
        setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const renderCategoryBar = () => (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200 sticky top-0 z-30">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center sm:text-left">
                <FaStore className="inline mr-2 text-indigo-600" /> Explora Nuestras Categorías
            </h2>
            <Link
                to={isAuthenticated() ? "/perfil" : "/login"} // Cambia a /perfil si está logueado
                className="fixed top-4 right-4 bg-white text-indigo-600 p-3 rounded-full shadow-lg hover:bg-indigo-100 hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center"
                title={isAuthenticated() ? "Mi Cuenta" : "Iniciar Sesión"}
            >
                <FaUserCircle size={24} />
            </Link>
            {categorias.length > 1 ? ( // Solo mostrar si hay más que 'TODAS'
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
            ) : (
                !loading && <p className="text-center text-gray-500">No hay categorías definidas o productos cargados.</p>
            )}
        </div>
    );

    const renderCarousel = () => ( /* ... sin cambios ... */ 
        <div className="mb-8 relative overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-48 md:h-64 lg:h-72 w-full bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden">
                <div className="h-full w-full relative">
                    {carouselImages.map((image, index) => (
                        <div key={index} className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <img src={image.src} alt={image.alt} className="object-cover w-full h-full" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                                <h2 className="text-xl md:text-2xl font-bold">{image.title}</h2><p className="text-sm md:text-base mt-1">{image.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={prevSlide} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-20"><FaAngleLeft size={20} /></button>
                <button onClick={nextSlide} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-20"><FaAngleRight size={20} /></button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {carouselImages.map((_, index) => ( <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2 w-6 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/40'}`} /> ))}
                </div>
            </div>
        </div>
    );

    const renderProductCard = (producto) => { /* ... sin cambios, pero se asegura que `producto.foto` use la URL completa si es necesario */
        // Construir URL completa para la imagen si `producto.foto` es una ruta relativa del backend
        const imageUrl = producto.foto 
            ? (producto.foto.startsWith('http') ? producto.foto : `${process.env.REACT_APP_API_URL}${producto.foto}`) 
            : defaultProductImage;

        const isInCart = cart.some(item => item.id_producto === producto.id_producto);
        const currentCartItem = cart.find(item => item.id_producto === producto.id_producto);
        const canAddToCart = producto.stock > (currentCartItem?.quantity || 0);
        const showStockWarning = producto.stock > 0 && producto.stock <= STOCK_THRESHOLD;
        const isOutOfStock = producto.stock <= 0;

        return (
            <div key={producto.id_producto} className="bg-white rounded-xl overflow-hidden shadow-lg border flex flex-col transform transition duration-300 hover:shadow-xl hover:-translate-y-1.5">
                <div className="relative h-52 w-full bg-gray-50 group">
                    <img src={imageUrl} alt={producto.nombre} className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.src = defaultProductImage; }} />
                    <div className="absolute top-2 right-2 space-y-1">
                        {showStockWarning && !isOutOfStock && (<span className="block bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow animate-pulse"><FaExclamationTriangle className="inline mr-1" />¡{producto.stock} Últimas!</span>)}
                        {isOutOfStock && (<span className="block bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">Agotado</span>)}
                    </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                    <span className="text-xs font-semibold text-indigo-500 uppercase mb-1">{producto.categoria || 'General'}</span>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 truncate h-7" title={producto.nombre}>{producto.nombre}</h3>
                    <p className="text-2xl font-extrabold text-gray-900 mb-5">{formatCurrency(producto.precioVenta)}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button
                            onClick={() => addToCart(producto)} disabled={isOutOfStock || !canAddToCart}
                            className={`w-full text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : (isInCart && !canAddToCart ? 'bg-yellow-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700')} disabled:opacity-60`}
                        >
                            {isOutOfStock ? 'Agotado' : (isInCart && !canAddToCart ? 'Máximo en Carrito' : (isInCart ? 'Añadir Otro' : 'Añadir al Carrito'))}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderProductsGrid = () => { /* ... sin cambios ... */ 
        if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div></div>;
        if (error) return <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center my-10"><FaExclamationTriangle size={30} className="mx-auto mb-3" /><h3 className="text-lg font-bold">Error: {error}</h3><button onClick={fetchProductosYCategorias} className="mt-3 bg-red-600 text-white px-4 py-2 rounded">Reintentar</button></div>;
        if (filteredProductos.length === 0 && !loading) return <div className="text-center py-16"><p className="text-gray-600 text-lg">No hay productos disponibles en esta categoría en este momento.</p></div>;
        return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{filteredProductos.map(producto => renderProductCard(producto))}</div>;
    };
    
    const renderCartFloatingButton = () => ( /* ... sin cambios ... */ 
        <button onClick={() => setViewMode('cart')} className={`fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg z-50 ${cart.length > 0 ? 'animate-bounce' : ''}`} aria-label="Ver carrito">
            <div className="relative"><FaShoppingCart size={24} />{cartItemCount > 0 && (<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{cartItemCount}</span>)}</div>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            {viewMode === 'browsing' && cart.length > 0 && renderCartFloatingButton()}
            
            <div className="container mx-auto">
                {viewMode !== 'success' && (
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-800">Manchas y Pecas</h1>
                        <p className="text-gray-600 mt-2">Los mejores productos al alcance de un clic</p>
                    </div>
                )}

                {viewMode === 'browsing' && (
                    <>
                        {renderCategoryBar()}
                        {carouselImages.length > 0 && renderCarousel()}
                        {renderProductsGrid()}
                    </>
                )}

                {viewMode === 'cart' && (
                    <CarritoCompras
                        items={cart} cartTotal={cartTotal} formatCurrency={formatCurrency}
                        onUpdateQuantity={updateCartQuantity} onRemoveItem={removeFromCart}
                        onClose={() => setViewMode('browsing')}
                        onProceedToCheckout={() => {
                            if (cart.length === 0) { Swal.fire('Carrito Vacío', 'Añade productos para continuar.', 'info'); return; }
                            setViewMode('checkoutInfo');
                        }}
                    />
                )}

                {viewMode === 'checkoutInfo' && (
                    <FormularioCheckout
                        checkoutInfo={checkoutInfo} onInputChange={handleCheckoutInfoChange}
                        cartTotal={cartTotal} cartItemCount={cartItemCount} formatCurrency={formatCurrency}
                        onBackToCart={() => setViewMode('cart')}
                        onProceedToPayment={handleProceedToPaymentFromCheckout}
                    />
                )}
                
                {viewMode === 'payment' && (
                     <MetodosDePago
                        cart={cart} cartTotal={cartTotal} cartItemCount={cartItemCount}
                        checkoutInfo={checkoutInfo} formatCurrency={formatCurrency}
                        onPaymentProcess={handleFinalizeOrder}
                        onBackToCheckoutInfo={() => setViewMode('checkoutInfo')}
                        isPlacingOrder={isPlacingOrder} VentasService={VentasService}
                    />
                )}

                {viewMode === 'success' && ordenCompletada && (
                    <ResumenCompra
                        datosCompra={ordenCompletada}
                        onClose={() => {
                            setOrdenCompletada(null);
                            setCheckoutInfo({ nombreCompleto: '', telefono: '', direccion: '', ciudad: '', notasAdicionales: '', tipoDocumento: 'CC', numeroDocumento: '', email: '', tipoPersona: 'natural'});
                            setViewMode('browsing');
                            fetchProductosYCategorias(); // Recargar productos y categorías
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default TiendaCliente;