import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import ProductosService from "../../../services/productosService"; // Ajusta la ruta
// Make sure global.css is imported in your main App or index file
// import "../../../assets/css/global.css"; // Or import here if not globally imported

// Define categories (could come from backend in the future)
const categoriasList = [
  { value: "SNACKS", label: "Snacks" },
  { value: "HIGIENE", label: "Higiene" },
  { value: "JUGUETERIA", label: "Juguetería" },
  { value: "ACCESORIOS", label: "Accesorios" },
];

const CrearProductos = () => {
  // --- Estados del Formulario ---
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState(""); // Estado para categoría
  const [estado] = useState("Activo"); // Estado por defecto
  const [foto, setFoto] = useState(null);

  // --- Estados de Validación ---
  const [nombreValido, setNombreValido] = useState(true);
  const [descripcionValida, setDescripcionValida] = useState(true);
  const [categoriaValida, setCategoriaValida] = useState(true);

  // --- Estado de Navegación ---
  const navigate = useNavigate();

  // --- Estados para manejo de enfoque (Floating Labels) ---
  const [focusedFields, setFocusedFields] = useState({
    nombre: false,
    descripcion: false,
    categoria: false,
  });

  const handleFocus = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: false }));
  };

  const shouldFloatLabel = (field, value) => {
    return focusedFields[field] || value !== "";
  };

  // --- Manejador de Cambios en Inputs ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "nombre":
        setNombre(value);
        validarNombre(value);
        break;
      case "descripcion":
        setDescripcion(value);
        validarDescripcion(value);
        break;
      case "categoria":
        setCategoria(value);
        validarCategoria(value);
        break;
      default:
        break;
    }
  };

  // --- Manejador de Archivos ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFoto(file || null);
  };

  // --- Funciones de Validación ---
  const validarNombre = (valor) => {
    const nombreRegex = /^[a-zA-Z0-9\sñáéíóúÁÉÍÓÚüÜ]+$/;
    const esValido =
      nombreRegex.test(valor) && valor.length >= 3 && valor.length <= 50;
    setNombreValido(esValido);
    return esValido;
  };

  const validarDescripcion = (valor) => {
    const descripcionRegex = /^[a-zA-Z0-9\sñáéíóúÁÉÍÓÚüÜ.,_-]+$/;
    const esValida =
      valor === "" ||
      (descripcionRegex.test(valor) && valor.length >= 3 && valor.length <= 100);
    setDescripcionValida(esValida);
    return esValida;
  };

  const validarCategoria = (valor) => {
    const esValida = valor !== "";
    setCategoriaValida(esValida);
    return esValida;
  };

  // --- Función para Guardar Producto ---
  const handleGuardarProducto = async (e) => {
    e.preventDefault();

    const esNombreValido = validarNombre(nombre);
    const esDescripcionValida = validarDescripcion(descripcion);
    const esCategoriaValida = validarCategoria(categoria);

    if (!esNombreValido || !esCategoriaValida || (descripcion !== "" && !esDescripcionValida)) {
      let errorText = "";
      if (!esNombreValido) errorText = "El nombre debe contener entre 3 y 50 caracteres (letras, números, espacios).";
      else if (!esCategoriaValida) errorText = "Debe seleccionar una categoría.";
      else if (descripcion !== "" && !esDescripcionValida) errorText = "La descripción, si se ingresa, debe tener entre 3 y 100 caracteres (letras, números, espacios, ., _, -).";

      Swal.fire({ icon: "error", title: "Error de Validación", text: errorText, timer: 3500 });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("nombre", nombre.trim());
    formDataToSend.append("descripcion", descripcion.trim());
    formDataToSend.append("categoria", categoria);
    formDataToSend.append("estado", estado);
    if (foto) {
      formDataToSend.append("foto", foto);
    }

    try {
      const response = await ProductosService.createProducto(formDataToSend);
      if (response) { // Check if service indicates success
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Producto creado exitosamente.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/productos/lista");
        });
      } else {
        // Optional: Handle cases where service runs but doesn't return expected success indicator
        throw new Error("La creación del producto no devolvió una respuesta exitosa.");
      }
    } catch (error) {
      console.error("Error al crear el producto:", error);
      const errorMsg = error.response?.data?.message || error.message || "Hubo un error al crear el producto.";
      Swal.fire({ icon: "error", title: "Error", text: errorMsg });
    }
  };

  // --- Renderizado del Componente ---
  return (
    <div className="page-container">
      <form onSubmit={handleGuardarProducto} className="form-container">
        <h2 className="form-title">Crear Nuevo Producto</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-6 items-end">

          {/* Fila 1 - Columna 1: Nombre */}
          <div className="form-field md:col-span-1">
            <label htmlFor="nombre" className={`floating-label ${shouldFloatLabel("nombre", nombre) ? "label-floated" : ""}`}>Nombre*</label>
            <input id="nombre" type="text" name="nombre" value={nombre} onChange={handleInputChange} onFocus={() => handleFocus("nombre")} onBlur={() => handleBlur("nombre")} className={`form-input ${!nombreValido ? "input-error" : ""}`} required />
            {!nombreValido && <p className="error-message">Debe tener al menos 3 caracteres.</p>}
          </div>

          {/* Fila 1 - Columna 2: Categoría */}
          <div className="form-field md:col-span-1">
            <label htmlFor="categoria" className={`floating-label ${shouldFloatLabel("categoria", categoria) ? "label-floated" : ""}`}>Categoría*</label>
            <select id="categoria" name="categoria" value={categoria} onChange={handleInputChange} onFocus={() => handleFocus("categoria")} onBlur={() => handleBlur("categoria")} className={`form-select ${!categoriaValida ? "input-error" : ""}`} required>
              <option value="" disabled>Seleccione una categoría...</option>
              {categoriasList.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
            </select>
            {!categoriaValida && <p className="error-message">Seleccione una categoría.</p>}
          </div>

          {/* Fila 1 - Columna 3: Foto (Sin flex, usa label normal) */}
          <div className="form-field md:col-span-1">
            {/* Etiqueta normal, SIN floating label */}
            <label htmlFor="foto" className="file-label">Foto (Opcional)</label>
            <input
              id="foto"
              type="file"
              name="foto"
              accept="image/*"
              onChange={handleFileChange}
              className="form-input-file" // Usa la clase CSS global
            />
            {/* Mostrar nombre del archivo si existe */}
            {foto && <span className="file-name-display">{foto.name}</span>}
          </div>
          {/* --- FIN PRIMERA FILA --- */}


          {/* Fila 2 - Columna única: Descripción */}
          {/* 'md:col-span-3' asegura que ocupe todo el ancho en pantallas medianas+ */}
          <div className="form-field md:col-span-3">
            <label htmlFor="descripcion" className={`floating-label ${shouldFloatLabel("descripcion", descripcion) ? "label-floated" : ""}`}>Descripción</label>
            <textarea id="descripcion" name="descripcion" value={descripcion} onChange={handleInputChange} onFocus={() => handleFocus("descripcion")} onBlur={() => handleBlur("descripcion")} className={`form-textarea ${!descripcionValida ? "input-error" : ""}`} rows={4} />
            {!descripcionValida && descripcion !== "" && <p className="error-message">Error en descripción.</p>}
          </div>
        </div>


        {/* Botones */}
        <div className="button-container">
          <button
            type="submit"
            className="button button-primary"
            // Deshabilitar si hay errores de validación visibles
            disabled={!nombreValido || !categoriaValida || (descripcion !== "" && !descripcionValida)}
          >
            <FaSave />
            Guardar Producto
          </button>
          <Link to="/productos/lista" className="button button-secondary">
            <FaArrowLeft />
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CrearProductos;