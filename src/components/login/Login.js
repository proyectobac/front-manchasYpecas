

// src/components/login/Login.js
import React, { useState, useEffect } from 'react'; // Agrega useEffect
import { useNavigate, useSearchParams } from 'react-router-dom'; // Agrega useSearchParams
// Asegúrate que estas rutas sean correctas para tu proyecto
import { setSession, isAuthenticated } from '../../Salida/auth'; // Tu helper de autenticación
import logoBarberia from '../../assets/images/login1.jpg'; // Tu logo
import '../../assets/css/login.css'; // El CSS NUEVO que acabamos de crear

import axios from 'axios';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook para leer parámetros de la URL

  const redirectPath = searchParams.get('redirect'); // Obtener el valor del parámetro 'redirect'

  // Si el usuario ya está autenticado y trata de acceder a /login,
  // redirígelo a su dashboard o a la página de inicio.
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectPath || '/inicio'); // O '/dashboard', etc.
    }
  }, [navigate, redirectPath]);


  const validateUsername = (username) => {
    if (!username.trim()) throw new Error('El campo de usuario no puede estar vacío');
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) throw new Error('Nombre de usuario inválido. Solo letras, números, puntos, guiones y guiones bajos.'); // Ajustado para ser más flexible
    if (username.length < 3 || username.length > 30) throw new Error('El nombre de usuario debe tener entre 3 y 30 caracteres');
  };

  const validatePassword = (password) => {
    if (!password.trim()) throw new Error('El campo de contraseña no puede estar vacío');
    if (password.length < 6 || password.length > 50) throw new Error('La contraseña debe tener entre 6 y 50 caracteres');
  };

  const handleLogin = async () => {
    try {
      setError(null);
      validateUsername(nombreUsuario);
      validatePassword(contrasena);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, { // Usa variable de entorno
        nombre_usuario: nombreUsuario,
        contrasena,
      });

      const { token, usuario } = response.data; // Asume que el backend devuelve el objeto 'usuario'
      
      if (!token || !usuario) {
        throw new Error("Respuesta inválida del servidor al iniciar sesión.");
      }

      const decodedToken = jwt_decode(token);
      
      // Guarda el objeto de usuario completo en localStorage, no solo el nombre.
      // setSession debería manejar esto internamente o podrías hacerlo aquí:
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario)); // Guarda el objeto de usuario
      // setSession podría encargarse de esto de forma más robusta (manejo de expiración)
      // setSession(token, new Date(decodedToken.exp * 1000), usuario); 
      // Temporalmente, para asegurar que 'user' está en localStorage:
      if (!localStorage.getItem('user')) {
          console.warn("El objeto de usuario no se guardó correctamente en localStorage.");
      }


      // Redireccionar:
      // 1. Si hay un 'redirectPath' (vino de TiendaCliente), usa ese.
      // 2. Si no, usa la ruta por defecto basada en el rol del usuario.
      // 3. Como fallback, a '/inicio'.
      let destination = '/inicio'; // Fallback
      if (redirectPath) {
        destination = redirectPath;
      } else if (usuario && usuario.rol && usuario.rol.nombre) { // Asumiendo que el objeto usuario tiene rol.nombre
        switch (usuario.rol.nombre.toLowerCase()) {
          case 'superadmin':
          case 'administrador': // Si tienes un rol admin
            destination = '/inicio'; // O tu dashboard de admin
            break;
          case 'empleado':
            destination = '/tienda'; // Dashboard de empleado
            break;
          case 'cliente':
            destination = '/tienda'; // Los clientes suelen ir a la tienda
            break;
          default:
            destination = '/tienda'; // Por defecto para roles no especificados
        }
      }
      
      navigate(destination, { replace: true });


    } catch (error) {
      let errorMessage = 'Ocurrió un error al intentar iniciar sesión.';
      if (error.response) {
        switch (error.response.status) {
          case 400: errorMessage = error.response.data?.msg || error.response.data?.message || 'Datos incorrectos. Verifica tu usuario y contraseña.'; break;
          case 401: errorMessage = error.response.data?.msg || error.response.data?.message || 'Usuario o Contraseña Incorrectos.'; break;
          case 403: errorMessage = error.response.data?.msg || error.response.data?.message || 'No tienes permiso para acceder.'; break;
          case 404: errorMessage = 'Servicio no encontrado. Contacta a soporte.'; break;
          case 500: errorMessage = 'Error interno del servidor. Inténtalo más tarde.'; break;
          default: errorMessage = `Error ${error.response.status}: ${error.response.data?.msg || error.response.data?.message || 'Error desconocido.'}`; break;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else if (error.message.includes('vacío') || error.message.includes('caracteres') || error.message.includes('inválido')) {
         errorMessage = error.message;
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      setError(errorMessage);
      console.error("Login Error:", error); // Loguea el error completo para depuración
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleLogin();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h1 className="login-title">Iniciar sesión</h1>
        <div className="login-logo-container">
          <img src={logoBarberia} alt="Logo de la Empresa" className="login-logo" />
        </div>
        {error && (
          <div className="login-error-message">
            {error}
          </div>
        )}
        <form className="login-form" onSubmit={handleFormSubmit}>
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
                required
              />
            </div>
          </div>
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
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="input-icon input-icon-right"
                onClick={togglePasswordVisibility}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              />
            </div>
          </div>
          <button type="submit" className="login-submit-button">
            INGRESAR
          </button>
          <div className="login-options">
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate('/resetPassword')} // Asegúrate que esta ruta exista
            >
              ¿Olvidó su contraseña?
            </button>
            <button
              type="button"
              className="register-link-button"
              onClick={() => navigate('/register')} // Asegúrate que esta ruta exista
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