import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate que estas rutas sean correctas para tu proyecto
import { setSession, isAuthenticated } from '../../Salida/auth'; // Tu helper de autenticación
import logoBarberia from '../../assets/images/login1.jpg'; // Tu logo
import '../../assets/css/login.css'; // El CSS NUEVO que acabamos de crear

import axios from 'axios';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importa los iconos que necesitas (ajusta si usas otros)
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // --- Validaciones (sin cambios) ---
  const validateUsername = (username) => {
    if (!username.trim()) throw new Error('El campo de usuario no puede estar vacío');
    if (!/^[a-zA-Z0-9]+$/.test(username)) throw new Error('El nombre de usuario solo puede contener letras y números');
    if (username.length < 3 || username.length > 20) throw new Error('El nombre de usuario debe tener entre 4 y 20 caracteres');
  };

  const validatePassword = (password) => {
    if (!password.trim()) throw new Error('El campo de contraseña no puede estar vacío');
    if (password.length < 6 || password.length > 20) throw new Error('La contraseña debe tener entre 6 y 20 caracteres');
    // Considera si necesitas validar caracteres específicos aquí
  };

  // --- Manejador de Login (sin cambios en la lógica central) ---
  const handleLogin = async () => {
    try {
      setError(null); // Limpiar error previo
      validateUsername(nombreUsuario);
      validatePassword(contrasena);

      // Llamada API
      const response = await axios.post(`http://localhost:3001/api/login`, {
        nombre_usuario: nombreUsuario,
        contrasena,
      });

      // Procesar respuesta
      const { token } = response.data;
      const decodedToken = jwt_decode(token);
      // Asegúrate que setSession maneje el usuario correctamente
      setSession(token, new Date(decodedToken.exp * 1000), response.data.usuario);

      // Redireccionar si está autenticado
      if (isAuthenticated()) {
        navigate('/dashboard'); // O a donde necesites ir
      } else {
        // Este caso es raro si setSession funciona bien
        setError('Error inesperado: La sesión no se estableció correctamente.');
      }
    } catch (error) {
      // Manejo de errores mejorado
      let errorMessage = 'Ocurrió un error al intentar iniciar sesión.';
      if (error.response) {
        // Errores del servidor (respuesta recibida)
        switch (error.response.status) {
          case 400: errorMessage = 'Datos incorrectos. Por favor, verifica tu usuario y contraseña.'; break;
          case 401: errorMessage = 'Usuario o Contraseña Incorrectos.'; break;
          case 403: errorMessage = error.response.data?.mensaje || 'No tienes permiso para acceder.'; break; // Usar ?. para seguridad
          case 404: errorMessage = 'Servicio no encontrado. Contacta a soporte.'; break;
          case 500: errorMessage = 'Error interno del servidor. Inténtalo más tarde.'; break;
          default: errorMessage = `Error ${error.response.status}: ${error.response.data?.mensaje || 'Error desconocido.'}`; break;
        }
      } else if (error.request) {
        // Error de red (no hubo respuesta)
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else if (error.message.includes('vacío') || error.message.includes('caracteres') || error.message.includes('letras y números')) {
         // Error de validación local
         errorMessage = error.message;
      } else {
        // Otros errores (configuración, etc.)
        errorMessage = `Error: ${error.message}`;
      }
      setError(errorMessage);
    }
  };

  // --- Manejador para el submit del formulario ---
  const handleFormSubmit = (event) => {
    event.preventDefault(); // Prevenir recarga de página
    handleLogin(); // Llamar a la lógica de login
  };

  // --- Toggle para mostrar/ocultar contraseña ---
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // --- Renderizado del Componente ---
  return (
    <div className="login-page-container">
      <div className="login-card">

        {/* Título */}
        <h1 className="login-title">Iniciar sesión</h1>

        {/* Logo */}
        <div className="login-logo-container">
          <img src={logoBarberia} alt="Logo de la Empresa" className="login-logo" />
        </div>

        {/* Mensaje de Error (si existe) */}
        {error && (
          <div className="login-error-message">
            {error}
            {/* Podrías añadir un botón para cerrar el error si quieres */}
            {/* <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button> */}
          </div>
        )}

        {/* Formulario */}
        <form className="login-form" onSubmit={handleFormSubmit}>

          {/* Campo Usuario */}
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faUser} className="input-icon input-icon-left" />
              <input
                type="text"
                id="username"
                className="input-field"
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                required // Validación básica HTML5
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faLock} className="input-icon input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field"
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required // Validación básica HTML5
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="input-icon input-icon-right"
                onClick={togglePasswordVisibility}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} // Tooltip útil
              />
            </div>
          </div>

          {/* Botón de Ingresar */}
          <button type="submit" className="login-submit-button">
            INGRESAR
          </button>

          {/* Opciones Adicionales */}
          <div className="login-options">
            <button
              type="button" // Importante para que no haga submit del form
              className="forgot-password-link"
              onClick={() => navigate('/resetPassword')} // Asegúrate que esta ruta exista en tu Router
            >
              ¿Olvidó su contraseña?
            </button>

            <button
              type="button" // Importante para que no haga submit del form
              className="register-link-button"
              onClick={() => navigate('/register')} // Asegúrate que esta ruta exista en tu Router
            >
              NUEVA CUENTA
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;