// src/Layout/Layout.jsx
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
// Ajusta las rutas según tu estructura de carpetas
import Sidebar from "../Sidebar/sidebar";
import AppHeaderDropdown from "../components/perfilAdmin/AppHeaderDropdown";
// Importa el archivo CSS compartido
import '../assets/css/Layout.css';

const Layout = () => {
  const navigate = useNavigate();

  // Efecto para verificar autenticación al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    if (!isAuthenticated) {
      console.log("Layout: Usuario no autenticado, redirigiendo a /login");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Si no está autenticado, retorna null para evitar mostrar el layout
  if (!localStorage.getItem("token")) {
    console.log("Layout: Render inicial sin token, no se muestra layout.");
    return null;
  }

  // Si está autenticado, renderiza el layout
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="main-content-area">
        {/* Encabezado */}
        <header className="layout-header">
          <AppHeaderDropdown />
        </header>

        {/* Área de Contenido Principal */}
        <main className="layout-main">
          <Outlet /> {/* Usa Outlet en lugar de children para Router v6 */}
        </main>

        {/* Pie de página */}
        <footer className="layout-footer">
          {/* Hecho por <strong>Feliciano Mosquera</strong> © 2025 */}
        </footer>
      </div>
    </div>
  );
};

export default Layout;