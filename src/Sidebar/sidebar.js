// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBoxes,
  faTruckLoading,
  faShoppingCart,
  faStore,
  faList,
  faChevronRight,
  faChevronDown,
  faCog,
  faUsers,
  faUserTag,
  faUserPlus
} from "@fortawesome/free-solid-svg-icons";
import '../assets/css/Sidebar.css';
import logo from "../assets/images/login1.jpg";
import { getUserInfo } from '../Salida/auth';

const CheckPermission = ({ route }) => {
  const userInfo = getUserInfo();
  if (!userInfo?.rol?.permisos) {
    console.log('No se encontraron permisos:', userInfo);
    return false;
  }
  const permisosRutas = userInfo.rol.permisos.map((p) => p.ruta);
  const hasPermission = permisosRutas.includes(route);
  console.log(`Checking permission for route ${route}:`, hasPermission);
  return hasPermission;
};

const FilteredNav = (navItems) => {
  return navItems
    .map(item => {
      if (item.subItems) {
        const filteredSubItems = FilteredNav(item.subItems);
        if (filteredSubItems.length > 0) {
          return { ...item, subItems: filteredSubItems };
        }
        return null;
      } else if (item.path) {
        return CheckPermission({ route: item.path }) ? item : null;
      }
      return item.path === undefined && item.subItems === undefined ? item : null;
    })
    .filter(item => item !== null);
};

// --- Definición de ítems del menú con iconos mejorados ---
const menuItems = [
  { name: "Inicio", path: "/inicio", icon: faHome },
  {
    name: "Productos",
    icon: faBoxes,
    subItems: [
      { name: "Lista Productos", path: "/productos/lista", icon: faList },
      { name: "Crear Producto", path: "/productos/crear", icon: faList },
    ],
  },
  {
    name: "Proveedores",
    icon: faTruckLoading,
    subItems: [
      { name: "Lista Proveedores", path: "/proveedor/lista", icon: faList },
      { name: "Crear Proveedor", path: "/proveedor/crear", icon: faList },
    ],
  },
  {
    name: "Compras",
    icon: faShoppingCart,
    subItems: [
      { name: "Lista Compras", path: "/compras/lista", icon: faList },
      { name: "Crear Compra", path: "/compras/crear", icon: faList },
    ],
  },
  {
    name: "Empleados",
    icon: faUsers,
    subItems: [
      { name: "Lista Empleados", path: "/empleados/lista", icon: faList },
      { name: "Crear Empleado", path: "/empleados/crear", icon: faUserPlus },
      { name: "Mi Portal", path: "/permisoDasboardEmpleado", icon: faUserPlus },
    ],
  },
  {
    name: "Tienda",
    icon: faStore,
    subItems: [
      { name: "Tienda", path: "/tienda", icon: faStore },
    ],
  },
  {
    name: "Configuracion",
    icon: faCog,
    subItems: [
      { name: "Usuarios", path: "/usuarios", icon: faUsers },
      { name: "Roles", path: "/usuarios", icon: faUserTag },
    ],
  },
];

// --- Componente Sidebar ---
const Sidebar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    let parentMenuName = null;
    for (const item of menuItems) {
      if (item.subItems) {
        if (item.subItems.some(sub => sub.path && currentPath.startsWith(sub.path))) {
          parentMenuName = item.name;
          break;
        }
      }
    }
    setActiveMenu(parentMenuName);
  }, [location.pathname]);

  const toggleMenu = (menuName) => {
    setActiveMenu((prevActiveMenu) => (prevActiveMenu === menuName ? null : menuName));
  };

  const filteredMenuItems = FilteredNav(menuItems);

  return (
    <aside className="sidebar-container">
      <div className="flex justify-center items-center p-6 border-b border-gray-200">
        <img
          src={logo}
          alt="Logo"
          className="w-48 h-48 object-contain rounded-lg"
        />
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item, index) => (
            <div key={item.name || index} className="sidebar-menu-item">
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`sidebar-button ${activeMenu === item.name ? 'active' : ''}`}
                    aria-expanded={activeMenu === item.name}
                    aria-controls={`submenu-${item.name}`}
                  >
                    <div className="sidebar-item-content">
                      {item.icon && <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />}
                      <span className="sidebar-item-name">{item.name}</span>
                    </div>
                    <FontAwesomeIcon
                      icon={activeMenu === item.name ? faChevronDown : faChevronRight}
                      className="sidebar-arrow-icon"
                    />
                  </button>

                  <div className={`sidebar-submenu ${activeMenu === item.name ? 'block' : 'hidden'}`} id={`submenu-${item.name}`}>
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subItem.name || subIndex}
                        to={subItem.path || "#"}
                        className={`sidebar-submenu-link ${location.pathname === subItem.path ? 'active' : ''}`}
                      >
                        {subItem.icon && <FontAwesomeIcon icon={subItem.icon} className="sidebar-submenu-icon" />}
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                item.path ? (
                  <Link
                    to={item.path}
                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <div className="sidebar-item-content">
                      {item.icon && <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />}
                      <span className="sidebar-item-name">{item.name}</span>
                    </div>
                  </Link>
                ) : (
                  <div className="sidebar-item-content sidebar-title-item">
                    {item.icon && <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />}
                    <span className="sidebar-item-name">{item.name}</span>
                  </div>
                )
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--sidebar-text)' }}>
            No tienes módulos asignados.
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;