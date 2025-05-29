// src/App.jsx
import "./assets/css/global.css"; 
import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Componentes
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Layout from "./Layout/layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { ProfileImageProvider } from './components/perfilAdmin/ProfileImageContext';
import Dashboard from './components/dashboard/Dashboard';

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
import PaymentStatusPage from './components/PaymentStatusPage';

// Nuevos componentes de usuarios y roles
import ListaUsuarios from "./components/usuarios/ListaUsuarios";
import CrearUsuario from "./components/usuarios/CrearUsuario";
import ListaRoles from "./components/roles/ListaRoles";
import CrearRol from "./components/roles/CrearRol";

// AppHeaderDropdown se usa DENTRO de Layout, no necesita ruta propia aquí normalmente

const App = () => {
  return (
    <ProfileImageProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/payment-status" element={<PaymentStatusPage />} /> {/* Movida fuera de las rutas protegidas */}

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/inicio" replace />} />
                <Route path="inicio" element={<Dashboard />} />

                {/* Rutas protegidas que requieren autenticación */}
                <Route path="productos/crear" element={<CrearProductos />} />
                <Route path="productos/lista" element={<ListaProductos />} />
                <Route path="proveedor/crear" element={<CrearProveedor />} />
                <Route path="proveedor/lista" element={<ListaProveedores />} />
                <Route path="compras/crear" element={<CrearCompras />} />
                <Route path="compras/lista" element={<ListaCompras />} />
                <Route path="empleados/crear" element={<CrearEmpleados />} />
                <Route path="empleados/lista" element={<ListaEmpleados />} />
                <Route path="permisoDasboardEmpleado" element={<PermisoDasboardEmpleado />} />

                {/* Nuevas rutas de usuarios y roles */}
                <Route path="usuarios/lista" element={<ListaUsuarios />} />
                <Route path="usuarios/crear" element={<CrearUsuario />} />
                <Route path="roles/lista" element={<ListaRoles />} />
                <Route path="roles/crear" element={<CrearRol />} />
              </Route>
            </Route>

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ProfileImageProvider>
  );
};

export default App;