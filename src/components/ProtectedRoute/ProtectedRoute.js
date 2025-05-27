// src/ProtectedRoute.jsx (Crea este nuevo archivo)
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../Salida/auth'; // Ajusta la ruta a tu archivo auth.js

const ProtectedRoute = () => {
  const isAuth = isAuthenticated(); // Llama a tu función de verificación
  console.log("ProtectedRoute Check - Is Authenticated:", isAuth); // Log para depurar

  // Si está autenticado, permite el acceso a las rutas anidadas (Outlet)
  // Si NO está autenticado, redirige a la página de login
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;