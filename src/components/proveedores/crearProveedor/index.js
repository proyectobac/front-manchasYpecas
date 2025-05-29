// src/components/proveedores/CrearProveedores.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import ProveedoresService from "../../../services/proveedoresService"; // Ajusta la ruta según tu estructura
import "../../../assets/css/crearProveedores.css"; // Importa el archivo CSS

const CrearProveedores = () => {
  // --- Estados del Formulario ---
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numDocumento, setNumDocumento] = useState("");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [estado] = useState("Activo"); // Estado por defecto

  // --- Estados de Validación ---
  const [tipoDocumentoValido, setTipoDocumentoValido] = useState(true);
  const [numDocumentoValido, setNumDocumentoValido] = useState(true);
  const [nombreValido, setNombreValido] = useState(true);
  const [direccionValida, setDireccionValida] = useState(true);
  const [telefonoValido, setTelefonoValido] = useState(true);
  const [emailValido, setEmailValido] = useState(true);

  // --- Estado de Navegación ---
  const navigate = useNavigate();

  // --- Estados para manejo de enfoque (Floating Labels) ---
  const [focusedFields, setFocusedFields] = useState({
    tipoDocumento: false,
    numDocumento: false,
    nombre: false,
    direccion: false,
    telefono: false,
    email: false,
  });

  // --- Funciones de Foco/Blur ---
  const handleFocus = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: false }));
  };

  // Determina si la etiqueta debe flotar
  const shouldFloatLabel = (field, value) => {
    return focusedFields[field] || value !== "";
  };

  // --- Manejador de Cambios en Inputs ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "tipoDocumento":
        setTipoDocumento(value);
        validarTipoDocumento(value);
        break;
      case "numDocumento":
        setNumDocumento(value);
        validarNumDocumento(value);
        break;
      case "nombre":
        setNombre(value);
        validarNombre(value);
        break;
      case "direccion":
        setDireccion(value);
        validarDireccion(value);
        break;
      case "telefono":
        setTelefono(value);
        validarTelefono(value);
        break;
      case "email":
        setEmail(value);
        validarEmail(value);
        break;
      default:
        break;
    }
  };

  // --- Funciones de Validación ---
  const validarTipoDocumento = (valor) => {
    const esValido = valor.trim() !== "";
    setTipoDocumentoValido(esValido);
    return esValido;
  };

  const validarNumDocumento = (valor) => {
    // Regex para validar que solo contiene números
    const numDocumentoRegex = /^[0-9]+$/;
    const esValido = numDocumentoRegex.test(valor) && valor.length >= 5 && valor.length <= 20;
    setNumDocumentoValido(esValido);
    return esValido;
  };

  const validarNombre = (valor) => {
    // Regex permite letras (con acentos y ñ), números y espacios
    const nombreRegex = /^[a-zA-Z0-9\sñáéíóúÁÉÍÓÚüÜ.,_-]+$/;
    const esValido = nombreRegex.test(valor) && valor.length >= 3 && valor.length <= 100;
    setNombreValido(esValido);
    return esValido;
  };

  const validarDireccion = (valor) => {
    // Regex más permisivo para dirección (letras, números, espacios, .,#,-,_)
    const direccionRegex = /^[a-zA-Z0-9\sñáéíóúÁÉÍÓÚüÜ.,#_-]+$/;
    const esValida = direccionRegex.test(valor) && valor.length >= 5 && valor.length <= 150;
    setDireccionValida(esValida);
    return esValida;
  };

  const validarTelefono = (valor) => {
    // Regex para validar que solo contiene números
    const telefonoRegex = /^[0-9]+$/;
    const esValido = telefonoRegex.test(valor) && valor.length >= 7 && valor.length <= 15;
    setTelefonoValido(esValido);
    return esValido;
  };

  const validarEmail = (valor) => {
    // Regex para validar formato de email
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    const esValido = emailRegex.test(valor);
    setEmailValido(esValido);
    return esValido;
  };

  // --- Función para Guardar Proveedor ---
  const handleGuardarProveedor = async (e) => {
    e.preventDefault();

    // Re-validar todos los campos antes de enviar
    const esTipoDocumentoValido = validarTipoDocumento(tipoDocumento);
    const esNumDocumentoValido = validarNumDocumento(numDocumento);
    const esNombreValido = validarNombre(nombre);
    const esDireccionValida = validarDireccion(direccion);
    const esTelefonoValido = validarTelefono(telefono);
    const esEmailValido = validarEmail(email);

    // Validar cada campo
    if (!esTipoDocumentoValido) {
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: "Debe seleccionar un tipo de documento.",
        timer: 3000,
      });
      return;
    }

    if (!esNumDocumentoValido) {
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: "El número de documento debe contener entre 5 y 20 números (solo dígitos).",
        timer: 3000,
      });
      return;
    }

    if (!esNombreValido) {
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: "El nombre debe contener entre 3 y 100 caracteres y solo puede incluir letras, números, espacios y caracteres básicos.",
        timer: 3000,
      });
      return;
    }

    if (!esDireccionValida) {
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: "La dirección debe tener entre 5 y 150 caracteres y formato válido.",
        timer: 3000,
      });
      return;
    }

    if (!esTelefonoValido) {
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: "El teléfono debe contener entre 7 y 15 números (solo dígitos).",
        timer: 3000,
      });
      return;
    }

    if (!esEmailValido) {
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: "Debe ingresar un email con formato válido.",
        timer: 3000,
      });
      return;
    }

    // --- Preparar Datos para Enviar ---
    const proveedorData = {
      tipo_documento: tipoDocumento.trim(),
      num_documento: numDocumento.trim(),
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      estado: estado
    };

    // --- Llamada al Servicio ---
    try {
      const response = await ProveedoresService.create(proveedorData);

      if (response) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Proveedor creado exitosamente.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/proveedor/lista"); // Ajusta la ruta según tu estructura
        });
      }
    } catch (error) {
      console.error("Error al crear el proveedor:", error);
      // Mostrar error específico si está disponible
      const errorMsg = error.response?.data?.message || "Hubo un error al crear el proveedor. Intente nuevamente.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
    }
  };

  // --- Renderizado del Componente ---
  return (
    <div className="crear-proveedor-container">
      <form onSubmit={handleGuardarProveedor} className="crear-proveedor-form">
        <h2 className="form-title">Crear Nuevo Proveedor</h2>

        {/* Grid para los campos del formulario */}
        <div className="form-grid">
          
          {/* Campo Tipo Documento */}
          <div className="form-field">
            <label
              htmlFor="tipoDocumento"
              className={`floating-label ${
                shouldFloatLabel("tipoDocumento", tipoDocumento) ? "label-floated" : ""
              }`}
            >
              Tipo de Documento*
            </label>
            <select
              id="tipoDocumento"
              name="tipoDocumento"
              value={tipoDocumento}
              onChange={handleInputChange}
              onFocus={() => handleFocus("tipoDocumento")}
              onBlur={() => handleBlur("tipoDocumento")}
              className={`form-input ${!tipoDocumentoValido ? "input-error" : ""}`}
              required
            >
              <option value=""></option>
              <option value="DNI">Celuda de Ciudadanaia</option>
              <option value="RUC">RUC</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Carnet de Extranjería">Carnet de Extranjería</option>
            </select>
            {!tipoDocumentoValido && (
              <p className="error-message">
                Debe seleccionar un tipo de documento.
              </p>
            )}
          </div>

          {/* Campo Número Documento */}
          <div className="form-field">
            <label
              htmlFor="numDocumento"
              className={`floating-label ${
                shouldFloatLabel("numDocumento", numDocumento) ? "label-floated" : ""
              }`}
            >
              Número de Documento*
            </label>
            <input
              type="text"
              id="numDocumento"
              name="numDocumento"
              value={numDocumento}
              onChange={handleInputChange}
              onFocus={() => handleFocus("numDocumento")}
              onBlur={() => handleBlur("numDocumento")}
              className={`form-input ${!numDocumentoValido ? "input-error" : ""}`}
              required
            />
            {!numDocumentoValido && (
              <p className="error-message">
                Entre 5-20 dígitos (solo números).
              </p>
            )}
          </div>

          {/* Campo Nombre */}
          <div className="form-field">
            <label
              htmlFor="nombre"
              className={`floating-label ${
                shouldFloatLabel("nombre", nombre) ? "label-floated" : ""
              }`}
            >
              Nombre/Razón Social*
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={nombre}
              onChange={handleInputChange}
              onFocus={() => handleFocus("nombre")}
              onBlur={() => handleBlur("nombre")}
              className={`form-input ${!nombreValido ? "input-error" : ""}`}
              required
            />
            {!nombreValido && (
              <p className="error-message">
                Entre 3-100 caracteres (letras, números, espacios).
              </p>
            )}
          </div>

          {/* Campo Dirección */}
          <div className="form-field">
            <label
              htmlFor="direccion"
              className={`floating-label ${
                shouldFloatLabel("direccion", direccion) ? "label-floated" : ""
              }`}
            >
              Dirección*
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={direccion}
              onChange={handleInputChange}
              onFocus={() => handleFocus("direccion")}
              onBlur={() => handleBlur("direccion")}
              className={`form-input ${!direccionValida ? "input-error" : ""}`}
              required
            />
            {!direccionValida && (
              <p className="error-message">
                Entre 5-150 caracteres con formato válido.
              </p>
            )}
          </div>

          {/* Campo Teléfono */}
          <div className="form-field">
            <label
              htmlFor="telefono"
              className={`floating-label ${
                shouldFloatLabel("telefono", telefono) ? "label-floated" : ""
              }`}
            >
              Teléfono*
            </label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={telefono}
              onChange={handleInputChange}
              onFocus={() => handleFocus("telefono")}
              onBlur={() => handleBlur("telefono")}
              className={`form-input ${!telefonoValido ? "input-error" : ""}`}
              required
            />
            {!telefonoValido && (
              <p className="error-message">
                Entre 7-15 dígitos (solo números).
              </p>
            )}
          </div>

          {/* Campo Email */}
          <div className="form-field">
            <label
              htmlFor="email"
              className={`floating-label ${
                shouldFloatLabel("email", email) ? "label-floated" : ""
              }`}
            >
              Email*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              className={`form-input ${!emailValido ? "input-error" : ""}`}
              required
            />
            {!emailValido && (
              <p className="error-message">
                Debe ingresar un email con formato válido.
              </p>
            )}
          </div>
        </div> {/* Fin Form Grid */}

        {/* Botones */}
        <div className="button-container">
          <button
            type="submit"
            className="button button-primary"
            disabled={
              !tipoDocumentoValido || 
              !numDocumentoValido || 
              !nombreValido || 
              !direccionValida || 
              !telefonoValido || 
              !emailValido
            }
          >
            <FaSave />
            Guardar Proveedor
          </button>
          <Link
            to="/proveedor/lista" // Ajusta la ruta según tu estructura
            className="button button-secondary"
          >
            <FaArrowLeft />
            Volver
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CrearProveedores;