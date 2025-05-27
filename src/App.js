// src/App.jsx
import "./assets/css/global.css"; 
import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Componentes
import Login from "./components/login/Login";
import Layout from "./Layout/layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"; // <-- Importa el nuevo componente
import { ProfileImageProvider } from './components/perfilAdmin/ProfileImageContext';


// Tus vistas/páginas
import CrearProductos from "./components/productos/crearProductos/index";
import ListaProductos from "./components/productos/listaProductos/index";
import CrearProveedor from "./components/proveedores/crearProveedor/index";
import ListaProveedores from "./components/proveedores/listaProveedores/index";
import CrearCompras from "./components/compras/crearCompras/index";
import ListaCompras from "./components/compras/listaCompras/index";
import CrearEmpleados from "./components/empleados/crearEmpleados/index";
import ListaEmpleados from "./components/empleados/listaEmpleados/index";
import PermisoDasboardEmpleado from "./components/empleados/PerfilEmpleado/index";
import Tienda from "./components/tienda/tienda";
// AppHeaderDropdown se usa DENTRO de Layout, no necesita ruta propia aquí normalmente

const App = () => {
  return (
    <ProfileImageProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            {/* Ruta Pública: Login */}
            <Route path="/login" element={<Login />} />
            <Route path="/tienda" element={<Tienda />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}> {/* <-- Envuelve las rutas protegidas */}
              {/* Layout actúa como contenedor para las rutas hijas protegidas */}
              <Route path="/" element={<Layout />}> {/* Layout se renderiza si estás autenticado */}
                 {/* Ruta por defecto DENTRO del layout */}
                 {/* 'index' se usa para la ruta padre ('/') */}
                 <Route index element={<Navigate to="/tienda" replace />} />
                 <Route path="inicio" element={<h1>Bienvenido</h1>} />

                 {/* Otras rutas protegidas que se renderizan DENTRO de Layout */}
                 <Route path="productos/crear" element={<CrearProductos />} />
                 <Route path="productos/lista" element={<ListaProductos />} />
                 <Route path="proveedor/crear" element={<CrearProveedor />} />
                 <Route path="proveedor/lista" element={<ListaProveedores />} />
                 <Route path="compras/crear" element={<CrearCompras />} />
                 <Route path="compras/lista" element={<ListaCompras />} />
                 <Route path="empleados/crear" element={<CrearEmpleados />} />
                 <Route path="empleados/lista" element={<ListaEmpleados />} />
                 <Route path="permisoDasboardEmpleado" element={<PermisoDasboardEmpleado />} />

                 {/* Puedes añadir más rutas protegidas aquí */}
                 {/* <Route path="otra-ruta" element={<OtroComponente />} /> */}

              </Route> {/* Fin de las rutas dentro de Layout */}
            </Route> {/* <-- Fin de las rutas protegidas */}

            {/* Colócala al final si quieres redirigir todo lo demás a login o a una página 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            {/* O a una página 404 dedicada: <Route path="*" element={<NotFoundPage />} /> */}

          </Routes>
        </Suspense>
      </BrowserRouter>
    </ProfileImageProvider>
  );
};

export default App;