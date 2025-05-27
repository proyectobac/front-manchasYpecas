import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Corrected import: changed cilChevronDown to cilChevronBottom
import { cilUser, cilSettings, cilLockLocked, cilChevronBottom, cilImage, cilCamera, cilZoom } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { getUserInfo, logout, getToken } from '../../Salida/auth';
import Swal from 'sweetalert2';
import { useProfileImage } from '../perfilAdmin/ProfileImageContext'; // Assuming context path is correct
import defaultAvatar from '../../assets/images/login1.jpg'; // Make sure this path is correct relative to this file
import CameraCapture from '../../components/perfilAdmin/CameraCapture'; // Assuming component path is correct
import '../../assets/css/Layout.css'; // Make sure this path is correct

// Función para obtener iniciales
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const nameParts = name.trim().split(' ').filter(part => part.length > 0);
  if (nameParts.length === 0) return '?';
  const firstInitial = nameParts[0][0];
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
  return (firstInitial + lastInitial).toUpperCase();
};

const AppHeaderDropdown = () => {
  const { profileImage, setProfileImage } = useProfileImage();
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Efecto para cargar datos del usuario
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userInfo = await getUserInfo();

        if (isMounted && userInfo) {
          setUserName(userInfo.nombre_usuario || '');
          setIsLoggedIn(true);

          const storedImage = localStorage.getItem('profileImage');
          const backendPhotoPath = userInfo.foto;
          let finalImage = defaultAvatar;

          if (storedImage) {
            finalImage = storedImage;
          } else if (backendPhotoPath && typeof backendPhotoPath === 'string') {
            let imagePath = backendPhotoPath.replace(/\\/g, '/');
             // Handle potential double 'uploads/' path issue
             if (imagePath.includes('uploads/uploads/')) {
                imagePath = imagePath.replace('uploads/uploads/', 'uploads/');
            }
            // Ensure the path is absolute if it's not already a full URL
            if (!imagePath.startsWith('http') && !imagePath.startsWith('/')) {
              const apiUrl = process.env.REACT_APP_API_URL || '';
              // Ensure API URL doesn't have trailing slash and image path doesn't have leading slash
              finalImage = `${apiUrl.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`;
            } else if (imagePath.startsWith('/')) {
                 const apiUrl = process.env.REACT_APP_API_URL || '';
                 const baseUrl = new URL(apiUrl).origin; // Get just the base URL (e.g., http://localhost:5000)
                 finalImage = `${baseUrl}${imagePath}`;
            }
             else {
              finalImage = imagePath; // It's already a full URL
            }
            // Only store in localStorage if it's not the default avatar
            if (finalImage !== defaultAvatar) {
                 localStorage.setItem('profileImage', finalImage);
            }
          }
          setProfileImage(finalImage);
        } else if (isMounted) {
          setIsLoggedIn(false);
          setProfileImage(defaultAvatar);
           localStorage.removeItem('profileImage'); // Clean up local storage if not logged in or no user info
        }
      } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        if (isMounted) {
          setIsLoggedIn(false);
          setProfileImage(defaultAvatar);
           localStorage.removeItem('profileImage'); // Clean up local storage on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [setProfileImage]); // Dependency array includes setProfileImage as it's used

  // Handler para cerrar sesión
  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar la sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('profileImage');
        localStorage.removeItem('userInfo'); // Also clear user info on logout
        logout(); // Call your logout function (clears token etc.)
        setProfileImage(defaultAvatar); // Reset profile image in context
        setIsLoggedIn(false); // Update logged-in state
        navigate('/login', { replace: true }); // Redirect to login
      }
    });
  };

  // Handler para cambio de archivo
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true); // Show loading indicator while uploading
      try {
        const formData = new FormData();
        formData.append('foto', file);

        const userInfo = await getUserInfo(); // Get fresh user info
        const userId = userInfo?.id_usuario;
        const userRole = userInfo?.rol?.nombre; // Assuming rol.nombre holds the role name

        if (!userId) throw new Error("ID de usuario no encontrado.");
        if (!userRole) throw new Error("Rol de usuario no encontrado.");

        // No need to append id_usuario if the backend gets it from the token/session
        // formData.append('id_usuario', userId); // Only include if backend explicitly requires it in the body

        let endpoint = '';
        const baseUrl = process.env.REACT_APP_API_URL || ''; // Ensure this is set in your .env

        // Define specific endpoints based on roles
        const adminEndpoint = `${baseUrl}/api/upload/admin-profile`;
        const empleadoEndpoint = `${baseUrl}/api/upload/empleado-profile`;
        const clienteEndpoint = `${baseUrl}/api/upload/cliente-profile`;

        switch (userRole.toLowerCase()) {
          case 'admin': endpoint = adminEndpoint; break;
          case 'empleado': endpoint = empleadoEndpoint; break;
          case 'cliente': endpoint = clienteEndpoint; break;
          default: throw new Error(`Rol no soportado para subida de foto: ${userRole}`);
        }

        const token = getToken();
        if (!token) throw new Error("Token de autenticación no encontrado.");

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data' // Fetch usually sets this automatically for FormData
          },
        });

        const data = await response.json();

        if (!response.ok) {
          // Try to provide a more specific error message from the backend
          throw new Error(data.message || data.error || `Error del servidor: ${response.status} ${response.statusText}`);
        }

        if (data.filePath) {
           let newImageUrl = data.filePath.replace(/\\/g, '/');
           // Handle potential double 'uploads/' path issue again after upload
           if (newImageUrl.includes('uploads/uploads/')) {
               newImageUrl = newImageUrl.replace('uploads/uploads/', 'uploads/');
           }
          // Construct the full URL if the backend returns a relative path
          if (!newImageUrl.startsWith('http') && !newImageUrl.startsWith('/')) {
             const apiUrl = process.env.REACT_APP_API_URL || '';
             newImageUrl = `${apiUrl.replace(/\/$/, '')}/${newImageUrl.replace(/^\//, '')}`;
          } else if (newImageUrl.startsWith('/')) {
             const apiUrl = process.env.REACT_APP_API_URL || '';
             const apiBaseUrl = new URL(apiUrl).origin;
             newImageUrl = `${apiBaseUrl}${newImageUrl}`;
          }


          setProfileImage(newImageUrl); // Update context/state
          localStorage.setItem('profileImage', newImageUrl); // Update local storage

          // Optionally update stored userInfo if the backend sends updated info
           if (data.userInfo) {
             // Update the specific 'foto' field in the stored userInfo
             const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
             currentUserInfo.foto = data.filePath; // Store the relative path from backend if needed elsewhere
             localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
             setUserName(currentUserInfo.nombre_usuario || ''); // Update displayed name if needed
           }


          Swal.fire('¡Éxito!', 'Foto de perfil actualizada correctamente.', 'success');
        } else {
          // If filePath is missing in a successful response, something is wrong
          throw new Error("La respuesta del servidor no incluyó la ruta del archivo (filePath).");
        }
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        Swal.fire('Error', `No se pudo actualizar la foto de perfil: ${error.message}`, 'error');
        // Optionally revert to previous image if needed, or keep the current one
        // setProfileImage(localStorage.getItem('profileImage') || defaultAvatar);
      } finally {
        setLoading(false); // Hide loading indicator
        // Clear the file input value so the same file can be selected again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
         setIsDropdownOpen(false); // Close dropdown after action
      }
    }
  };


  // Handler para captura de cámara
  const handleCameraCapture = (imageBlob) => {
    if (!imageBlob) {
        setShowCamera(false);
        return;
    }
    // Create a File object from the Blob
    const file = new File([imageBlob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

    // Create a minimal event-like object for handleFileChange
    const pseudoEvent = {
      target: {
        files: [file]
      }
    };

    // Call the existing file change handler
    handleFileChange(pseudoEvent);
    setShowCamera(false); // Close the camera modal
  };

  // Handler para tomar foto (opens camera)
  const handleTakePhoto = () => {
    setIsDropdownOpen(false); // Close dropdown first
    setShowCamera(true); // Open camera modal
  };

  // Handler para ver foto (shows in Swal)
  const handleViewPhoto = () => {
     setIsDropdownOpen(false); // Close dropdown first
    // Determine the image URL to show, prioritizing current state/localStorage over default
     const imageUrlToShow = (profileImage && profileImage !== defaultAvatar) ? profileImage : defaultAvatar;

    // Check if we are actually showing the default avatar because no custom photo exists
     if (imageUrlToShow === defaultAvatar && (!localStorage.getItem('profileImage') || localStorage.getItem('profileImage') === defaultAvatar) ) {
       Swal.fire({
           title: 'Sin Foto Personalizada',
           text: 'Aún no has subido una foto de perfil.',
           icon: 'info'
       });
       return;
     }


    Swal.fire({
      imageUrl: imageUrlToShow,
      imageAlt: 'Foto de perfil',
      imageHeight: 300, // Adjust size as needed
      imageWidth: 300,  // Adjust size as needed
      showConfirmButton: false, // No OK button needed
      showCloseButton: true, // Allow closing the modal
      customClass: {
         popup: 'swal2-view-photo-popup', // Add custom class for potential styling
         image: 'swal2-view-photo-image'  // Style the image (e.g., make it circular)
        // background: 'transparent', // Optional: transparent background
      },
       // Optional: add padding around the image
       // padding: '1em',
    });
  };


  // Navegación a páginas
  const navigateTo = (path) => {
    setIsDropdownOpen(false); // Close dropdown before navigating
    navigate(path);
  };

  // Renderizados condicionales
  if (loading && !isLoggedIn) { // Show loading only initially or if explicitly set
    return (
      <div className="header-dropdown-container flex items-center px-3 py-2">
         <div className="avatar-placeholder animate-pulse bg-gray-300 rounded-full w-8 h-8 mr-2"></div>
         <span className="text-placeholder animate-pulse bg-gray-300 h-4 w-20 rounded"></span>
      </div>
    );
  }


  if (!isLoggedIn) {
    // Don't render the dropdown if the user is not logged in
    // Optionally, render a Login button or nothing
    return null;
  }

  // Determine if using default avatar based on the *current* profileImage state
   const isUsingDefaultAvatar = !profileImage || profileImage === defaultAvatar;


  // Renderizado final
  return (
    <div className="header-dropdown-container relative" ref={dropdownRef}> {/* Added relative positioning */}
      {/* Botón del dropdown */}
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" // Adjusted styling for better appearance
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-haspopup="true" // Accessibility
        aria-expanded={isDropdownOpen} // Accessibility
      >
        <div className={`avatar-container w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${isUsingDefaultAvatar ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} > {/* Added size and styling */}
          {isUsingDefaultAvatar ? (
            <span className="avatar-initials text-sm font-semibold">{getInitials(userName)}</span>
          ) : (
            <img
              src={profileImage}
              alt="Foto de perfil"
              className="w-full h-full object-cover" // Ensure image covers the container
              onError={(e) => {
                console.warn(`Error al cargar imagen de perfil: ${profileImage}. Usando avatar por defecto.`);
                e.target.onerror = null; // Prevent infinite loop if default avatar also fails
                setProfileImage(defaultAvatar);
                localStorage.removeItem('profileImage'); // Clear broken link from storage
              }}
            />
          )}
        </div>
        {/* Hide username on smaller screens if needed, or keep it */}
        <span className="username-text text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">{userName || 'Usuario'}</span>
         {/* Corrected icon usage */}
        <CIcon icon={cilChevronBottom} className="dropdown-chevron w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {/* Menú desplegable */}
      {isDropdownOpen && (
         <div
           className="dropdown-menu-container absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
           role="menu" // Accessibility
           aria-orientation="vertical" // Accessibility
           aria-labelledby="user-menu-button" // Link to the button if it had an ID
        >
          <div className="py-1" role="none">
             {/* Header section within dropdown */}
             <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                 <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName || 'Usuario'}</p>
                 {/* You could add email or role here if available */}
                 {/* <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail || 'email@example.com'}</p> */}
             </div>

            {/* Elemento de menú: Perfil */}
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => navigateTo('/UserInfo')} // Make sure this route exists
              role="menuitem"
            >
              <CIcon icon={cilUser} className="menu-icon text-blue-500 w-5 h-5 mr-3 flex-shrink-0" />
              <span>Mi Perfil</span>
            </button>

            {/* Elemento de menú: Configuración */}
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => navigateTo('/EditProfile')} // Make sure this route exists
              role="menuitem"
            >
              <CIcon icon={cilSettings} className="menu-icon text-gray-500 w-5 h-5 mr-3 flex-shrink-0" />
              <span>Editar Perfil</span>
            </button>

            {/* Elemento de menú: Ver Foto */}
             <button
               className={`flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${isUsingDefaultAvatar ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 cursor-pointer'}`}
               onClick={isUsingDefaultAvatar ? undefined : handleViewPhoto}
               disabled={isUsingDefaultAvatar}
               role="menuitem"
            >
               <CIcon icon={cilZoom} className={`menu-icon w-5 h-5 mr-3 flex-shrink-0 ${isUsingDefaultAvatar ? 'text-gray-400 dark:text-gray-500' : 'text-purple-500'}`} />
               <span>Ver Foto {isUsingDefaultAvatar && <small className="ml-1">(N/A)</small>}</span>
             </button>


            {/* Divisor */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* Elemento de menú: Seleccionar Foto */}
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => fileInputRef.current?.click()} // Trigger hidden file input
              role="menuitem"
            >
              <CIcon icon={cilImage} className="menu-icon text-green-500 w-5 h-5 mr-3 flex-shrink-0" />
              <span>Cambiar Foto</span>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif" // Specify accepted types
              />
            </button>

            {/* Elemento de menú: Tomar Foto */}
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleTakePhoto}
              role="menuitem"
            >
              <CIcon icon={cilCamera} className="menu-icon text-orange-500 w-5 h-5 mr-3 flex-shrink-0" />
              <span>Tomar Foto</span>
            </button>

            {/* Divisor */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* Elemento de menú: Cerrar Sesión */}
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleLogout}
              role="menuitem"
            >
              <CIcon icon={cilLockLocked} className="menu-icon w-5 h-5 mr-3 flex-shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de cámara */}
       {/* Modal should be outside the dropdown structure, ideally portal'd */}
       {showCamera && (
         // Using a simple overlay and centered content div
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]"> {/* Ensure high z-index */}
           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl max-w-lg w-full"> {/* Modal container */}
             <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
           </div>
         </div>
      )}

    </div>
  );
};

export default AppHeaderDropdown;