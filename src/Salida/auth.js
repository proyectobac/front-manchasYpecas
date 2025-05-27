import Swal from 'sweetalert2';

// auth.js

export const getToken = () => {
  return localStorage.getItem('token') || '';
};

export const isAuthenticated = () => {
  try {
    const token = getToken();
    const expirationDate = localStorage.getItem('tokenExpiration');

    if (!token || !expirationDate) {
      return false;
    }

    const currentDateTime = new Date();
    const tokenExpirationDateTime = new Date(expirationDate);

    if (currentDateTime < tokenExpirationDateTime) {
      return true;
    } else {
      // Si el token ha expirado, eliminar el token y refrescar la página
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      window.location.reload(); // Refrescar la página
      return false;
    }
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
};

export const setSession = (token, expirationDate, userInfo) => {
  const userInfoWithId = {
    ...userInfo,
    id_usuario: userInfo.userId,
  };

  localStorage.setItem('token', token);
  localStorage.setItem('tokenExpiration', expirationDate);
  localStorage.setItem('userInfo', JSON.stringify(userInfoWithId));


  // Redirigir según el rol del usuario
  if (userInfo.rol.nombre === 'Cliente') {
    window.location.href = '/cliente';
  } else if (userInfo.rol.nombre === 'Empleado') {
    window.location.href = '/permisoDasboardEmpleado';
  } else {
    window.location.href = '/inicio';
  }
};

export const removeSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('userInfo');
};

export const getUserInfo = () => {
  const userInfoString = localStorage.getItem('userInfo');
  return userInfoString ? JSON.parse(userInfoString) : null;
};

export const logout = () => {
  removeSession();
  // Redirigir al login solo si es necesario
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
