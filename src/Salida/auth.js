import Swal from 'sweetalert2';

// auth.js

export const getToken = () => {
  return localStorage.getItem('token') || '';
};

export const isAuthenticated = () => {
  try {
    const token = getToken();
    const userInfo = localStorage.getItem('user');

    if (!token || !userInfo) {
      return false;
    }

    // Decodificar el token para obtener la fecha de expiración
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    const expirationDate = new Date(exp * 1000);
    const currentDateTime = new Date();

    if (currentDateTime < expirationDate) {
      return true;
    } else {
      // Si el token ha expirado, limpiar todo
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
};

export const setSession = (token, userInfo) => {
  if (!token || !userInfo) {
    console.error('Token o información de usuario faltante');
    return;
  }

  // Guardar token y datos del usuario
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userInfo));

  // Redirigir según el rol del usuario
  if (userInfo.rol && userInfo.rol.nombre) {
    switch (userInfo.rol.nombre.toLowerCase()) {
      case 'cliente':
        window.location.href = '/tienda';
        break;
      case 'empleado':
        window.location.href = '/permisoDasboardEmpleado';
        break;
      case 'superadmin':
      case 'administrador':
      default:
        window.location.href = '/inicio';
        break;
    }
  } else {
    window.location.href = '/inicio';
  }
};

export const removeSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('profileImage');
};

export const getUserInfo = () => {
  const userInfoString = localStorage.getItem('user');
  return userInfoString ? JSON.parse(userInfoString) : null;
};

export const logout = () => {
  removeSession();
  window.location.href = '/login';
};

// Inactividad: Redirigir si el usuario está inactivo más de 30 segundos
let inactivityTimeout;
let inactivityLimit = 30 * 60 * 1000; // 5 minutos en milisegundos
let warningTimeout;
let warningDuration = 30 * 1000; // 30 segundos para que responda


const resetInactivityTimer = () => {
  clearTimeout(inactivityTimeout);
  clearTimeout(warningTimeout);
  
  // Reiniciar el temporizador de inactividad
  inactivityTimeout = setTimeout(() => {
    // Mostrar mensaje de advertencia al usuario
    showInactivityWarning();
  }, inactivityLimit);
};

const showInactivityWarning = () => {
  Swal.fire({
    title: 'Inactividad detectada',
    text: '¿Sigues activo? Si no respondes en los próximos 30 segundos, se cerrará tu sesión.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, sigo activo',
    cancelButtonText: 'No, cerrar sesión',
    timer: warningDuration, // 30 segundos
    timerProgressBar: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    willOpen: () => {
      Swal.showLoading(); // Mostrar el loading
      const timerInterval = setInterval(() => {
        const timerProgress = Swal.getTimerProgressBar();
        if (timerProgress) {
          timerProgress.style.backgroundColor = 'green'; // Cambiar color de la barra de progreso a verde
        }
      }, 100);
      Swal.getCancelButton().addEventListener('click', () => {
        clearInterval(timerInterval);
      });
    }
  }).then((result) => {
    if (result.isConfirmed) {
      resetInactivityTimer(); // El usuario confirmó que sigue activo, reiniciamos el temporizador
    } else {
      logout(); // Cerrar sesión si el usuario decide no seguir activo
    }
  });

  // Si no hay respuesta dentro del tiempo de advertencia, cerrar sesión automáticamente
  warningTimeout = setTimeout(() => {
    logout();
    // Hacer reload después de 3000 milisegundos
    setTimeout(() => {
      window.location.reload();
    }, 1);
  }, warningDuration);
};

const setupInactivityDetection = () => {
  // Detectar cualquier interacción del usuario y resetear el temporizador
  window.addEventListener('mousemove', resetInactivityTimer);
  window.addEventListener('keypress', resetInactivityTimer);
  window.addEventListener('click', resetInactivityTimer);
  window.addEventListener('scroll', resetInactivityTimer);
  
  // Iniciar el temporizador cuando se cargue la página
  resetInactivityTimer();
};

// Iniciar la detección de inactividad cuando el usuario esté autenticado
if (isAuthenticated()) {
  setupInactivityDetection();
}

// Cerrar sesión si el usuario cierra la pestaña o el navegador no se aplica aquí
