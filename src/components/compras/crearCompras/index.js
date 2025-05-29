import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaPlus, FaTrashAlt, FaFilter } from 'react-icons/fa';
import Swal from 'sweetalert2';
import ComprasService from '../../../services/comprasService';
import ProveedoresService from '../../../services/proveedoresService';
import ProductosService from '../../../services/productosService';

// Define los estados iniciales permitidos al crear
const estadosInicialesCompra = [
    { value: 'Pendiente de Pago', label: 'Pendiente de Pago' },
    { value: 'Pagada', label: 'Pagada' },
];

const CrearCompra = () => {
    const navigate = useNavigate();

    // --- Estados del Formulario ---
    const [id_proveedor, setIdProveedor] = useState('');
    const [numero_referencia, setNumeroReferencia] = useState('');
    const [estado_compra, setEstadoCompra] = useState(estadosInicialesCompra[0].value);
    const [detalles, setDetalles] = useState([
        { id_producto: '', cantidad: '', precio_costo_unitario: '', margen_aplicado: '', categoria_filtro: '' },
    ]);
    const [ultimaReferencia, setUltimaReferencia] = useState(0);

    // --- Estados para datos de Selects ---
    const [proveedoresList, setProveedoresList] = useState([]);
    const [productosList, setProductosList] = useState([]);
    const [categoriasList, setCategoriasList] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // --- Estado de Guardado ---
    const [isSaving, setIsSaving] = useState(false);

    // --- Estados para manejo de enfoque (Floating Labels) ---
    const [focusedFields, setFocusedFields] = useState({
        id_proveedor: false,
        numero_referencia: false,
        estado_compra: false,
    });

    const handleFocus = (field) => {
        setFocusedFields((prev) => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => {
        setFocusedFields((prev) => ({ ...prev, [field]: false }));
    };

    const shouldFloatLabel = (field, value) => {
        return focusedFields[field] || (value !== "" && value !== null && value !== undefined);
    };

    // Función para generar el siguiente número de referencia
    const generarSiguienteReferencia = (ultimoNumero) => {
        const siguiente = ultimoNumero + 1;
        return `FACT-PROV-${String(siguiente).padStart(3, '0')}`;
    };

    // --- Cargar Proveedores y Productos al Montar ---
    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                // Obtener la última compra para extraer el último número de referencia
                const comprasResponse = await ComprasService.getAllCompras();
                if (comprasResponse && Array.isArray(comprasResponse.compras)) {
                    const referencias = comprasResponse.compras
                        .map(compra => compra.numero_referencia)
                        .filter(ref => ref && ref.startsWith('FACT-PROV-'))
                        .map(ref => parseInt(ref.split('-')[2]));
                    
                    const ultimoNumero = referencias.length > 0 ? Math.max(...referencias) : 0;
                    setUltimaReferencia(ultimoNumero);
                    setNumeroReferencia(generarSiguienteReferencia(ultimoNumero));
                }

                const [provRes, prodRes] = await Promise.all([
                    ProveedoresService.getAll(),
                    ProductosService.getAllProductos(),
                ]);
    
                // Procesar Proveedores
                if (provRes && provRes.data && Array.isArray(provRes.data.listProveedores)) {
                    setProveedoresList(provRes.data.listProveedores);
                } else {
                    console.warn("Respuesta inesperada de proveedores:", provRes);
                    setProveedoresList([]);
                }
    
                // Procesar Productos
                if (prodRes && Array.isArray(prodRes.productos)) {
                    setProductosList(prodRes.productos);
                    
                    // Extraer categorías únicas de los productos
                    const categoriasUnicas = [...new Set(
                        prodRes.productos
                            .filter(producto => producto.categoria && producto.categoria.trim() !== '')
                            .map(producto => producto.categoria.trim())
                    )].sort();
                    
                    setCategoriasList(categoriasUnicas);
                } else {
                    console.warn("Respuesta inesperada de productos:", prodRes);
                    setProductosList([]);
                    setCategoriasList([]);
                }
    
            } catch (error) {
                console.error('Error cargando datos iniciales:', error);
                Swal.fire('Error', 'No se pudieron cargar los datos iniciales.', 'error');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    // --- Manejadores de Cambio ---
    const handleProveedorChange = (e) => setIdProveedor(e.target.value);
    const handleReferenciaChange = (e) => setNumeroReferencia(e.target.value);
    const handleEstadoChange = (e) => setEstadoCompra(e.target.value);

    // --- Función para filtrar productos por categoría ---
    const getProductosFiltrados = (categoriaSeleccionada) => {
        if (!categoriaSeleccionada || categoriaSeleccionada === '') {
            return productosList;
        }
        return productosList.filter(producto => 
            producto.categoria && 
            producto.categoria.trim().toLowerCase() === categoriaSeleccionada.toLowerCase()
        );
    };

    // --- Manejadores de Detalles ---
    const handleAddDetalle = () => {
        setDetalles([
            ...detalles,
            { id_producto: '', cantidad: '', precio_costo_unitario: '', margen_aplicado: '', categoria_filtro: '' },
        ]);
    };

    const handleRemoveDetalle = (index) => {
        if (detalles.length <= 1) {
            Swal.fire('Aviso', 'Debe haber al menos una línea de detalle.', 'info');
            return;
        }
        const newDetalles = detalles.filter((_, i) => i !== index);
        setDetalles(newDetalles);
    };

    const handleDetalleChange = (index, e) => {
        const { name, value } = e.target;
        const newDetalles = detalles.map((detalle, i) => {
            if (i === index) {
                // Si cambia la categoría, resetear el producto seleccionado
                if (name === 'categoria_filtro') {
                    return { 
                        ...detalle, 
                        [name]: value,
                        id_producto: '' // Resetear producto cuando cambia categoría
                    };
                }
                
                if ((name === 'cantidad' || name === 'precio_costo_unitario' || name === 'margen_aplicado') && value !== '') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) return detalle;
                    if (name === 'cantidad' && !Number.isInteger(numValue)) {
                        return {...detalle, [name]: Math.floor(numValue)};
                    }
                    return { ...detalle, [name]: numValue };
                }
                return { ...detalle, [name]: value };
            }
            return detalle;
        });
        setDetalles(newDetalles);
    };

    // --- Validación antes de Guardar ---
    const validarFormulario = () => {
        if (!id_proveedor) {
            Swal.fire('Error', 'Debe seleccionar un proveedor.', 'error'); 
            return false;
        }
        if (!estado_compra) {
            Swal.fire('Error', 'Debe seleccionar un estado inicial para la compra.', 'error'); 
            return false;
        }
        if (detalles.length === 0) {
            Swal.fire('Error', 'Debe añadir al menos un producto.', 'error'); 
            return false;
        }
        for (let i = 0; i < detalles.length; i++) {
            const d = detalles[i];
            if (!d.id_producto || !d.cantidad || d.cantidad <= 0 || d.precio_costo_unitario === '' || d.precio_costo_unitario < 0) {
                Swal.fire('Error', `Error en línea ${i + 1}: Producto, cantidad (>0) y costo (>=0) obligatorios.`, 'error'); 
                return false;
            }
            if (d.margen_aplicado !== '' && d.margen_aplicado < 0) {
                Swal.fire('Error', `Error en línea ${i + 1}: El margen no puede ser negativo.`, 'error'); 
                return false;
            }
        }
        return true;
    };

    // --- Guardar Compra ---
    const handleGuardarCompra = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        setIsSaving(true);

        const compraData = {
            id_proveedor: parseInt(id_proveedor),
            numero_referencia: numero_referencia || null,
            estado_compra: estado_compra,
            detalles: detalles.map(d => ({
                id_producto: parseInt(d.id_producto),
                cantidad: parseInt(d.cantidad),
                precio_costo_unitario: parseFloat(d.precio_costo_unitario),
                margen_aplicado: d.margen_aplicado !== '' ? parseFloat(d.margen_aplicado) : null,
            }))
        };

        try {
            const response = await ComprasService.createCompra(compraData);
            if (response && response.ok) {
                Swal.fire({
                    icon: 'success', 
                    title: '¡Éxito!',
                    text: response.msg || 'Compra creada exitosamente.',
                    timer: 2000, 
                    showConfirmButton: false,
                }).then(() => {
                    navigate('/compras/lista');
                });
            } else {
                throw new Error(response?.msg || "La creación de la compra falló.");
            }
        } catch (error) {
            console.error('Error al crear la compra:', error);
            const errorMsg = error.response?.data?.msg || error.message || 'Hubo un error.';
            Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingData) {
        return <div className="page-container text-center"><p>Cargando datos...</p></div>;
    }

    // --- Renderizado ---
    return (
        <div className="page-container">
            <form onSubmit={handleGuardarCompra} className="form-container">
                <h2 className="form-title">Registrar Nueva Compra</h2>

                {/* Fila 1: Proveedor, Referencia y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-6 items-end">
                    {/* Proveedor */}
                    <div className="form-field">
                        <label htmlFor="id_proveedor" className={`floating-label ${shouldFloatLabel("id_proveedor", id_proveedor) ? "label-floated" : ""}`}>
                            Proveedor*
                        </label>
                        <select 
                            id="id_proveedor" 
                            name="id_proveedor" 
                            value={id_proveedor} 
                            onChange={handleProveedorChange} 
                            onFocus={() => handleFocus("id_proveedor")} 
                            onBlur={() => handleBlur("id_proveedor")} 
                            className="form-select" 
                            required
                        >
                            <option value="" disabled></option>
                            {proveedoresList.map((prov) => (
                                <option key={prov.id_proveedor} value={prov.id_proveedor}>
                                    {prov.nombre} ({prov.num_documento})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Referencia */}
                    <div className="form-field">
                        <label htmlFor="numero_referencia" className={`floating-label ${shouldFloatLabel("numero_referencia", numero_referencia) ? "label-floated" : ""}`}>
                            Nº Referencia
                        </label>
                        <input 
                            id="numero_referencia" 
                            type="text" 
                            name="numero_referencia" 
                            value={numero_referencia} 
                            className="form-input bg-gray-100" 
                            readOnly 
                        />
                    </div>

                    {/* Estado Inicial */}
                    <div className="form-field">
                        <label htmlFor="estado_compra" className={`floating-label ${shouldFloatLabel("estado_compra", estado_compra) ? "label-floated" : ""}`}>
                            Estado Inicial*
                        </label>
                        <select 
                            id="estado_compra" 
                            name="estado_compra" 
                            value={estado_compra} 
                            onChange={handleEstadoChange} 
                            onFocus={() => handleFocus("estado_compra")} 
                            onBlur={() => handleBlur("estado_compra")} 
                            className="form-select" 
                            required
                        >
                            {estadosInicialesCompra.map((estado) => (
                                <option key={estado.value} value={estado.value}>
                                    {estado.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sección de Detalles con Filtro por Categoría */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                        <FaFilter className="inline mr-2" />
                        Detalles de la Compra
                    </h3>
                    {detalles.map((detalle, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-10 gap-x-4 gap-y-3 items-center mb-4 p-3 border rounded bg-gray-50 relative">
                            
                            {/* Selector Principal: Categoría o Producto */}
                            <div className="form-field md:col-span-4">
                                <label htmlFor={`selector-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                                    Producto* <span className="text-gray-400">(Primero categoría, luego producto)</span>
                                </label>
                                
                                {/* Si no hay categoría seleccionada, mostrar selector de categorías */}
                                {!detalle.categoria_filtro ? (
                                    <select 
                                        id={`selector-${index}`} 
                                        name="categoria_filtro" 
                                        value={detalle.categoria_filtro} 
                                        onChange={(e) => handleDetalleChange(index, e)} 
                                        className="form-select text-sm"
                                    >
                                        <option value="" disabled>1. Seleccione una categoría...</option>
                                        {categoriasList.map((categoria) => (
                                            <option key={categoria} value={categoria}>
                                                📁 {categoria}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    /* Si hay categoría seleccionada, mostrar productos de esa categoría */
                                    <div className="space-y-2">
                                        {/* Mostrar categoría seleccionada con botón para cambiar */}
                                        <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded border">
                                            <span className="text-sm text-blue-800">
                                                📁 <strong>{detalle.categoria_filtro}</strong>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleDetalleChange(index, { 
                                                    target: { name: 'categoria_filtro', value: '' } 
                                                })}
                                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                title="Cambiar categoría"
                                            >
                                                Cambiar
                                            </button>
                                        </div>
                                        
                                        {/* Selector de productos filtrados */}
                                        <select 
                                            id={`producto-${index}`} 
                                            name="id_producto" 
                                            value={detalle.id_producto} 
                                            onChange={(e) => handleDetalleChange(index, e)} 
                                            className="form-select text-sm" 
                                            required
                                        >
                                            <option value="" disabled>2. Seleccione el producto...</option>
                                            {getProductosFiltrados(detalle.categoria_filtro).map((prod) => (
                                                <option key={prod.id_producto} value={prod.id_producto}>
                                                    🏷️ {prod.nombre} (Stock actual: {prod.stock})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            
                            {/* Cantidad y Stock Actual */}
                            <div className="form-field md:col-span-2">
                                <label htmlFor={`cantidad-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                                    Cantidad*
                                </label>
                                <div className="space-y-1">
                                    <input 
                                        id={`cantidad-${index}`} 
                                        type="number" 
                                        name="cantidad" 
                                        value={detalle.cantidad} 
                                        onChange={(e) => handleDetalleChange(index, e)} 
                                        className="form-input text-sm" 
                                        min="1" 
                                        step="1" 
                                        required
                                    />
                                    {detalle.id_producto && (
                                        <div className="text-xs text-gray-600">
                                            Stock actual: {
                                                productosList.find(p => p.id_producto.toString() === detalle.id_producto.toString())?.stock || 0
                                            } unidades
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Precio Costo */}
                            <div className="form-field md:col-span-2">
                                <label htmlFor={`costo-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                                    P. Costo U.*
                                </label>
                                <input 
                                    id={`costo-${index}`} 
                                    type="number" 
                                    name="precio_costo_unitario" 
                                    value={detalle.precio_costo_unitario} 
                                    onChange={(e) => handleDetalleChange(index, e)} 
                                    className="form-input text-sm" 
                                    min="0" 
                                    step="0.01" 
                                    required
                                />
                            </div>
                            
                            {/* Margen */}
                            <div className="form-field md:col-span-1">
                                <label htmlFor={`margen-${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                                    Margen (%)
                                </label>
                                <input 
                                    id={`margen-${index}`} 
                                    type="number" 
                                    name="margen_aplicado" 
                                    value={detalle.margen_aplicado} 
                                    onChange={(e) => handleDetalleChange(index, e)} 
                                    className="form-input text-sm" 
                                    min="0" 
                                    step="0.01" 
                                    placeholder='8'
                                />
                            </div>
                            
                            {/* Botón Eliminar Línea */}
                            <div className="md:col-span-1 flex items-end justify-center md:justify-end mt-2 md:mt-0">
                                {detalles.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveDetalle(index)} 
                                        className="button button-danger button-small p-2" 
                                        title="Eliminar línea"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        type="button" 
                        onClick={handleAddDetalle} 
                        className="button button-secondary button-small mt-2" 
                        disabled={isSaving}
                    >
                        <FaPlus /> Añadir Producto
                    </button>
                    
                  
                </div>

                {/* Botones Principales */}
                <div className="button-container mt-8">
                    <button 
                        type="submit" 
                        className="button button-primary" 
                        disabled={isSaving || loadingData}
                    >
                        {isSaving ? 'Guardando...' : <><FaSave /> Guardar Compra</>}
                    </button>
                    <Link to="/compras/lista" className="button button-secondary">
                        <FaArrowLeft /> Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default CrearCompra;