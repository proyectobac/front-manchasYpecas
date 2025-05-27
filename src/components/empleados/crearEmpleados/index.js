import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaSave, FaArrowLeft, FaImage } from "react-icons/fa";
import EmpleadoService from "../../../services/empleadosService";
import defaultUserImage from "../../../assets/images/login1.jpg";

const CrearEmpleados = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    documento: "",
    telefono: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Estado para manejar enfoque de los campos (floating labels)
  const [focusedFields, setFocusedFields] = useState({
    nombre: false,
    apellido: false,
    correo: false,
    documento: false,
    telefono: false,
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    }

    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "El correo no es válido";
    }

    if (!formData.documento.trim()) {
      newErrors.documento = "El documento es requerido";
    } else if (!/^\d{8,10}$/.test(formData.documento)) {
      newErrors.documento = "El documento debe tener entre 8 y 10 dígitos";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono debe tener 10 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const submitFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitFormData.append(key, formData[key]);
    });

    if (fileInputRef.current.files[0]) {
      submitFormData.append("foto", fileInputRef.current.files[0]);
    }

    try {
      const validacionDocumento = await EmpleadoService.validarDocumento(formData.documento);
      if (validacionDocumento.documento === "El documento ya existe") {
        setErrors((prev) => ({
          ...prev,
          documento: "Este documento ya está registrado",
        }));
        setLoading(false);
        return;
      }

      await EmpleadoService.createEmpleado(submitFormData);
      Swal.fire({
        icon: "success",
        title: "¡Empleado creado exitosamente!",
        text: "El empleado ha sido registrado en el sistema",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate("/empleados/lista");
      });
    } catch (error) {
      console.error("Error al crear el empleado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear el empleado",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="form-container">
        <h2 className="form-title">Crear Nuevo Empleado</h2>

        {/* Foto - Movida al encabezado */}
        <div className="flex justify-center mb-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center items-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-full overflow-hidden bg-gray-100">
              <img
                src={previewImage || defaultUserImage}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaImage className="mr-2" />
              Seleccionar Foto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-6 items-end">
          {/* Nombre */}
          <div className="form-field md:col-span-1">
            <label
              htmlFor="nombre"
              className={`floating-label ${
                shouldFloatLabel("nombre", formData.nombre) ? "label-floated" : ""
              }`}
            >
              Nombre*
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              onFocus={() => handleFocus("nombre")}
              onBlur={() => handleBlur("nombre")}
              className={`form-input ${errors.nombre ? "input-error" : ""}`}
              required
            />
            {errors.nombre && <p className="error-message">{errors.nombre}</p>}
          </div>

          {/* Apellido */}
          <div className="form-field md:col-span-1">
            <label
              htmlFor="apellido"
              className={`floating-label ${
                shouldFloatLabel("apellido", formData.apellido)
                  ? "label-floated"
                  : ""
              }`}
            >
              Apellido*
            </label>
            <input
              id="apellido"
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              onFocus={() => handleFocus("apellido")}
              onBlur={() => handleBlur("apellido")}
              className={`form-input ${errors.apellido ? "input-error" : ""}`}
              required
            />
            {errors.apellido && (
              <p className="error-message">{errors.apellido}</p>
            )}
          </div>

          {/* Documento */}
          <div className="form-field md:col-span-1">
            <label
              htmlFor="documento"
              className={`floating-label ${
                shouldFloatLabel("documento", formData.documento)
                  ? "label-floated"
                  : ""
              }`}
            >
              Documento*
            </label>
            <input
              id="documento"
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleInputChange}
              onFocus={() => handleFocus("documento")}
              onBlur={() => handleBlur("documento")}
              className={`form-input ${errors.documento ? "input-error" : ""}`}
              required
            />
            {errors.documento && (
              <p className="error-message">{errors.documento}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="form-field md:col-span-1">
            <label
              htmlFor="telefono"
              className={`floating-label ${
                shouldFloatLabel("telefono", formData.telefono)
                  ? "label-floated"
                  : ""
              }`}
            >
              Teléfono*
            </label>
            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              onFocus={() => handleFocus("telefono")}
              onBlur={() => handleBlur("telefono")}
              className={`form-input ${errors.telefono ? "input-error" : ""}`}
              required
            />
            {errors.telefono && (
              <p className="error-message">{errors.telefono}</p>
            )}
          </div>

          {/* Correo */}
          <div className="form-field md:col-span-1">
            <label
              htmlFor="correo"
              className={`floating-label ${
                shouldFloatLabel("correo", formData.correo) ? "label-floated" : ""
              }`}
            >
              Correo Electrónico*
            </label>
            <input
              id="correo"
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              onFocus={() => handleFocus("correo")}
              onBlur={() => handleBlur("correo")}
              className={`form-input ${errors.correo ? "input-error" : ""}`}
              required
            />
            {errors.correo && <p className="error-message">{errors.correo}</p>}
          </div>
        </div>

        {/* Botones */}
        <div className="button-container">
          <button
            type="submit"
            className={`button button-primary ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            <FaSave className="mr-2" />
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/empleados/lista")}
            className="button button-secondary"
          >
            <FaArrowLeft className="mr-2" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearEmpleados;