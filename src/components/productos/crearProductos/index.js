// src/components/productos/crearProductos/index.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import ProductosService from "../../../services/productosService"; // Asegúrate que la ruta sea correcta

// Asegúrate que los VALORES ('SNACKS', 'HIGIENE', etc.) coincidan EXACTAMENTE
// con los valores definidos en tu ENUM del modelo Producto y en CATEGORIAS_MAP del backend.
const categoriasList = [
  { value: "SNACKS", label: "Snacks" },
  { value: "HIGIENE", label: "Higiene" },
  { value: "JUGUETERIA", label: "Juguetería" },
  { value: "ACCESORIOS", label: "Accesorios" },
  { value: "COMEDEROS", label: "Comederos" }, // AÑADIDO COMEDEROS
];

const CrearProductos = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estado] = useState("Activo");
  const [foto, setFoto] = useState(null);

  const [nombreValido, setNombreValido] = useState(true);
  const [descripcionValida, setDescripcionValida] = useState(true);
  const [categoriaValida, setCategoriaValida] = useState(true);

  const navigate = useNavigate();

  const [focusedFields, setFocusedFields] = useState({
    nombre: false, descripcion: false, categoria: false
  });

  const handleFocus = (field) => setFocusedFields((prev) => ({ ...prev, [field]: true }));
  const handleBlur = (field) => setFocusedFields((prev) => ({ ...prev, [field]: false }));
  const shouldFloatLabel = (field, value) => focusedFields[field] || value !== "";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "nombre": setNombre(value); validarNombre(value); break;
      case "descripcion": setDescripcion(value); validarDescripcion(value); break;
      case "categoria": setCategoria(value); validarCategoria(value); break;
      default: break;
    }
  };

  const handleFileChange = (e) => setFoto(e.target.files[0] || null);

  const validarNombre = (valor) => {
    const nombreRegex = /^[a-zA-Z0-9\sñáéíóúÁÉÍÓÚüÜ]+$/;
    const esValido = nombreRegex.test(valor) && valor.length >= 3 && valor.length <= 50;
    setNombreValido(esValido);
    return esValido;
  };

  const validarDescripcion = (valor) => {
    const descripcionRegex = /^[a-zA-Z0-9\sñáéíóúÁÉÍÓÚüÜ.,_%\-()/#@!?¡¿ M²mlLKg]+$/;
    const esValida = valor === "" || (descripcionRegex.test(valor) && valor.length <= 150);
    setDescripcionValida(esValida);
    return esValida;
  };

  const validarCategoria = (valor) => {
    const esValida = valor !== "";
    setCategoriaValida(esValida);
    return esValida;
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    const esNombreValido = validarNombre(nombre);
    const esDescripcionValida = validarDescripcion(descripcion);
    const esCategoriaValida = validarCategoria(categoria);

    if (!esNombreValido || !esCategoriaValida || 
        (descripcion !== "" && !esDescripcionValida)
    ) {
      let errorText = "Por favor, corrija los errores en el formulario.";
      Swal.fire({ icon: "error", title: "Error de Validación", text: errorText, timer: 3500 });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("nombre", nombre.trim());
    formDataToSend.append("descripcion", descripcion.trim());
    formDataToSend.append("categoria", categoria);
    formDataToSend.append("estado", estado);

    if (foto) formDataToSend.append("foto", foto);

    try {
      await ProductosService.createProducto(formDataToSend); 
      Swal.fire({
        icon: "success", title: "¡Éxito!", text: "Producto creado exitosamente.",
        timer: 2000, showConfirmButton: false,
      }).then(() => navigate("/productos/lista"));
    } catch (error) {
      console.error("Error al crear el producto:", error);
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || error.message || "Hubo un error al crear el producto.";
      Swal.fire({ icon: "error", title: "Error", text: errorMsg });
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleGuardarProducto} className="form-container">
        <h2 className="form-title">Crear Nuevo Producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 items-end">
          {/* Nombre */}
          <div className="form-field">
            <label htmlFor="nombre" className={`floating-label ${shouldFloatLabel("nombre", nombre) ? "label-floated" : ""}`}>Nombre*</label>
            <input id="nombre" type="text" name="nombre" value={nombre} onChange={handleInputChange} onFocus={() => handleFocus("nombre")} onBlur={() => handleBlur("nombre")} className={`form-input ${!nombreValido ? "input-error" : ""}`} required />
            {!nombreValido && <p className="error-message">De 3 a 50 caracteres, sin símbolos especiales.</p>}
          </div>

          {/* Categoría */}
          <div className="form-field">
            <label htmlFor="categoria" className={`floating-label ${shouldFloatLabel("categoria", categoria) ? "label-floated" : ""}`}>Categoría*</label>
            <select id="categoria" name="categoria" value={categoria} onChange={handleInputChange} onFocus={() => handleFocus("categoria")} onBlur={() => handleBlur("categoria")} className={`form-select ${!categoriaValida ? "input-error" : ""}`} required>
              <option value="" disabled></option>
              {categoriasList.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
            </select>
            {!categoriaValida && <p className="error-message">Seleccione una categoría.</p>}
          </div>

          {/* Foto */}
          <div className="form-field">
            <label htmlFor="foto" className="file-label">Foto (Opcional)</label>
            <input id="foto" type="file" name="foto" accept="image/*" onChange={handleFileChange} className="form-input-file" />
            {foto && <span className="file-name-display">{foto.name}</span>}
          </div>

          {/* Descripción */}
          <div className="form-field md:col-span-2">
            <label htmlFor="descripcion" className={`floating-label ${shouldFloatLabel("descripcion", descripcion) ? "label-floated" : ""}`}>Descripción (Opcional)</label>
            <textarea id="descripcion" name="descripcion" value={descripcion} onChange={handleInputChange} onFocus={() => handleFocus("descripcion")} onBlur={() => handleBlur("descripcion")} className={`form-textarea ${!descripcionValida ? "input-error" : ""}`} rows={3} />
            {!descripcionValida && descripcion !== "" && <p className="error-message">Máximo 150 caracteres.</p>}
          </div>
        </div>

        <div className="button-container">
          <button type="submit" className="button button-primary" disabled={!nombreValido || !categoriaValida || (descripcion !== "" && !descripcionValida)}>
            <FaSave /> Guardar Producto
          </button>
          <Link to="/productos/lista" className="button button-secondary"><FaArrowLeft /> Cancelar</Link>
        </div>
      </form>
    </div>
  );
};

export default CrearProductos;