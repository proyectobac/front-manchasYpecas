import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faPhone, 
  faIdCard,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import logoBarberia from '../../assets/images/login1.jpg';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: '',
    documento: '',
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones específicas por campo
    let isValid = true;
    let errorMessage = '';
    let finalValue = value;

    switch(name) {
      case 'nombre_usuario':
        // Solo letras y máximo 10 caracteres
        if (!/^[a-zA-Z\s]*$/.test(value)) {
          isValid = false;
          errorMessage = 'Solo se permiten letras';
        } else if (value.length > 10) {
          isValid = false;
          errorMessage = 'Máximo 10 caracteres';
        }
        break;

      case 'telefono':
        // Solo permitir números y limitar a 10 dígitos
        finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
        break;

      case 'documento':
        // Solo permitir números y limitar a 10 dígitos
        finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
        break;

      case 'contrasena':
        if (value.length > 10) {
          isValid = false;
          errorMessage = 'Máximo 10 caracteres';
        }
        // Verificar si ya existe una contraseña de confirmación
        if (formData.confirmarContrasena) {
          if (value !== formData.confirmarContrasena) {
            setFieldErrors(prev => ({
              ...prev,
              confirmarContrasena: 'Las contraseñas no coinciden'
            }));
          } else {
            setFieldErrors(prev => ({
              ...prev,
              confirmarContrasena: ''
            }));
          }
        }
        break;

      case 'confirmarContrasena':
        if (value.length > 10) {
          isValid = false;
          errorMessage = 'Máximo 10 caracteres';
        }
        // Verificar en tiempo real si las contraseñas coinciden
        if (value !== formData.contrasena) {
          isValid = false;
          errorMessage = 'Las contraseñas no coinciden';
        }
        break;

      default:
        break;
    }

    // Actualizar errores del campo
    setFieldErrors(prev => ({
      ...prev,
      [name]: !isValid ? errorMessage : ''
    }));

    // Actualizar el valor del campo
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const validateForm = () => {
    if (!formData.nombre_usuario.trim()) {
      throw new Error('El nombre de usuario es requerido');
    }
    if (!/^[a-zA-Z\s]*$/.test(formData.nombre_usuario)) {
      throw new Error('El nombre de usuario solo puede contener letras y espacios');
    }
    if (!formData.correo.trim()) {
      throw new Error('El correo electrónico es requerido');
    }
    if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      throw new Error('Por favor ingrese un correo electrónico válido');
    }
    if (formData.contrasena.length < 7) {
      throw new Error('La contraseña debe tener al menos 7 caracteres');
    }
    if (formData.contrasena !== formData.confirmarContrasena) {
      throw new Error('Las contraseñas no coinciden');
    }
    if (formData.telefono && formData.telefono.length !== 10) {
      throw new Error('El teléfono debe tener 10 dígitos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      validateForm();

      // Mostrar loading
      Swal.fire({
        title: 'Registrando usuario',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const userData = {
        ...formData,
        id_rol: 3, // Rol de cliente
        estado: 'Activo',
      };
      delete userData.confirmarContrasena;

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/usuarios/usuario`, userData);

      if (response.data) {
        // Mostrar mensaje de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente',
          timer: 1500,
          showConfirmButton: false
        });
        
        navigate('/login');
      }
    } catch (error) {
      let errorMessage = 'Error al registrar usuario.';
      
      if (error.response) {
        errorMessage = error.response.data.error || error.response.data.mensaje || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar mensaje de error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-24 w-auto rounded-full"
          src={logoBarberia}
          alt="Logo"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crear nueva cuenta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nombre de Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre de Usuario *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={handleChange}
                  required
                  className={`pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                    fieldErrors.nombre_usuario ? 'border-red-500' : ''
                  }`}
                  placeholder="Usuario (solo letras, máx. 10)"
                />
              </div>
              {fieldErrors.nombre_usuario && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.nombre_usuario}</p>
              )}
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo Electrónico *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                  className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mínimo 7 caracteres"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  required
                  className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirma tu contraseña"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Solo números (máx. 10)"
                />
              </div>
            </div>

            {/* Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Documento de Identidad
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faIdCard} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Solo números (máx. 10)"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Registrarse
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 