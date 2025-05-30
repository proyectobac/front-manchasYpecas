import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaCrown } from 'react-icons/fa';
import Swal from 'sweetalert2';
import RolesService from '../../services/rolesService';
import { getUserInfo } from '../../Salida/auth';

const ListaRoles = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRol, setEditingRol] = useState(null);
    const [todosLosPermisos, setTodosLosPermisos] = useState([]);
    const currentUser = getUserInfo();

    // Función para verificar si un rol tiene todos los permisos
    const tienePermisosAdmin = (rol) => {
        if (!rol || !todosLosPermisos.length) return false;
        const permisosRol = new Set(rol.permisos.map(p => p.id_permiso));
        return todosLosPermisos.every(p => permisosRol.has(p.id_permiso));
    };

    // Función para verificar si es el rol restringido (ID 3)
    const esRolRestringido = (rolId) => {
        return rolId === 3;
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const rolesResponse = await RolesService.getAllRoles();
            
            // Extraer todos los permisos únicos de todos los roles
            const permisosSet = new Set();
            const permisosArray = [];
            
            rolesResponse.listaRoles.forEach(rol => {
                rol.permisos.forEach(permiso => {
                    const permisoKey = permiso.id_permiso.toString();
                    if (!permisosSet.has(permisoKey)) {
                        permisosSet.add(permisoKey);
                        permisosArray.push(permiso);
                    }
                });
            });
            
            setRoles(rolesResponse.listaRoles || []);
            setTodosLosPermisos(permisosArray);
        } catch (error) {
            console.error('Error cargando datos:', error);
            Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditRol = (rol) => {
        setEditingRol({
            ...rol,
            permisosSeleccionados: new Set(rol.permisos.map(p => p.id_permiso))
        });
    };

    const handleTogglePermiso = (idPermiso) => {
        setEditingRol(prev => {
            const nuevosPermisos = new Set(prev.permisosSeleccionados);
            if (nuevosPermisos.has(idPermiso)) {
                nuevosPermisos.delete(idPermiso);
            } else {
                nuevosPermisos.add(idPermiso);
            }
            return {
                ...prev,
                permisosSeleccionados: nuevosPermisos
            };
        });
    };

    const handleGuardarPermisos = async () => {
        try {
            const permisosArray = Array.from(editingRol.permisosSeleccionados);
            console.log('Enviando permisos:', {
                id_rol: editingRol.id_rol,
                id_permisos: permisosArray
            });
            
            await RolesService.updateRolPermisos(
                editingRol.id_rol,
                permisosArray
            );
            
            Swal.fire('¡Éxito!', 'Permisos actualizados correctamente', 'success');
            cargarDatos();
            setEditingRol(null);
        } catch (error) {
            console.error('Error actualizando permisos:', error);
            Swal.fire('Error', 'No se pudieron actualizar los permisos', 'error');
        }
    };

    const handleDeleteRol = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                await RolesService.deleteRol(id);
                Swal.fire('¡Eliminado!', 'El rol ha sido eliminado.', 'success');
                cargarDatos();
            }
        } catch (error) {
            console.error('Error eliminando rol:', error);
            Swal.fire('Error', 'No se pudo eliminar el rol', 'error');
        }
    };

    const handleToggleAdmin = async (rol) => {
        const isAdmin = tienePermisosAdmin(rol);
        try {
            const result = await Swal.fire({
                title: isAdmin ? '¿Quitar permisos de Administrador?' : '¿Convertir en Administrador?',
                text: isAdmin 
                    ? `Se restaurarán los permisos anteriores del rol "${rol.nombre}"`
                    : `Se otorgarán todos los permisos al rol "${rol.nombre}"`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: isAdmin ? 'Sí, quitar permisos' : 'Sí, convertir',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    if (!isAdmin) {
                        // Guardar los permisos actuales antes de convertir en admin
                        const permisosAnteriores = rol.permisos.map(p => p.id_permiso);
                        localStorage.setItem(`permisos_anteriores_${rol.id_rol}`, JSON.stringify(permisosAnteriores));
                        
                        // Dar todos los permisos
                        const todosLosPermisosIds = todosLosPermisos.map(p => p.id_permiso);
                        await RolesService.updateRolPermisos(rol.id_rol, todosLosPermisosIds);
                        Swal.fire('¡Éxito!', 'El rol ha sido convertido en Administrador.', 'success');
                    } else {
                        // Restaurar los permisos anteriores
                        const permisosAnteriores = JSON.parse(localStorage.getItem(`permisos_anteriores_${rol.id_rol}`) || '[]');
                        if (permisosAnteriores.length === 0) {
                            throw new Error('No se encontraron los permisos anteriores');
                        }
                        await RolesService.updateRolPermisos(rol.id_rol, permisosAnteriores);
                        localStorage.removeItem(`permisos_anteriores_${rol.id_rol}`);
                        Swal.fire('¡Éxito!', 'Se han restaurado los permisos anteriores.', 'success');
                    }
                    await cargarDatos();
                } catch (error) {
                    console.error('Error actualizando permisos:', error);
                    let mensajeError = 'No se pudieron actualizar los permisos';
                    if (error.message === 'No se encontraron los permisos anteriores') {
                        mensajeError = 'No se encontraron los permisos anteriores guardados. No se pueden restaurar los permisos.';
                    } else if (error.response) {
                        mensajeError = `Error del servidor: ${error.response.data.message || error.response.statusText}`;
                    }
                    Swal.fire('Error', mensajeError, 'error');
                }
            }
        } catch (error) {
            console.error('Error en el diálogo:', error);
            Swal.fire('Error', 'Ocurrió un error inesperado', 'error');
        }
    };

    if (loading) {
        return <div className="text-center p-4">Cargando...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestión de Roles</h2>
                <button
                    onClick={() => navigate('/roles/crear')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Crear Rol
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {roles.map(rol => {
                    const isAdmin = tienePermisosAdmin(rol);
                    return (
                        <div key={rol.id_rol} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{rol.nombre}</h3>
                                    <span className={`mt-1 px-2 py-1 text-sm rounded-full ${
                                        rol.estado === 'Activo' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {rol.estado}
                                    </span>
                                    {isAdmin && (
                                        <span className="ml-2 px-2 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                                            Administrador
                                        </span>
                                    )}
                                </div>
                                <div className="flex space-x-3">
                                    {/* Botón de corona */}
                                    {!esRolRestringido(rol.id_rol) && (rol.nombre === 'SuperAdmin' || 
                                      (currentUser?.rol?.nombre === 'SuperAdmin' && 
                                       currentUser?.rol?.id_rol === 1)) && (
                                        <button
                                            onClick={() => rol.nombre !== 'SuperAdmin' && handleToggleAdmin(rol)}
                                            className={`text-xl ${
                                                rol.nombre === 'SuperAdmin'
                                                    ? 'text-yellow-400 cursor-not-allowed'
                                                    : isAdmin
                                                        ? 'text-yellow-400 hover:text-yellow-600'
                                                        : 'text-gray-400 hover:text-yellow-600'
                                            }`}
                                            title={
                                                rol.nombre === 'SuperAdmin'
                                                    ? 'Este rol es SuperAdmin'
                                                    : isAdmin
                                                        ? 'Quitar permisos de Administrador'
                                                        : 'Convertir en Administrador'
                                            }
                                            disabled={rol.nombre === 'SuperAdmin'}
                                        >
                                            <FaCrown />
                                        </button>
                                    )}

                                    {/* Solo mostrar editar si no es SuperAdmin y no es rol restringido */}
                                    {rol.nombre !== 'SuperAdmin' && !esRolRestringido(rol.id_rol) && (
                                        <button
                                            onClick={() => handleEditRol(rol)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <FaEdit className="text-xl" />
                                        </button>
                                    )}

                                    {/* Solo mostrar eliminar si no es SuperAdmin, no es Admin y no es rol restringido */}
                                    {rol.nombre !== 'SuperAdmin' && !isAdmin && !esRolRestringido(rol.id_rol) && (
                                        <button
                                            onClick={() => handleDeleteRol(rol.id_rol)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FaTrash className="text-xl" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Permisos ({rol.permisos.length})</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {rol.permisos.map(permiso => (
                                        <div key={`${rol.id_rol}-${permiso.id_permiso}`} 
                                             className="bg-gray-50 p-2 rounded text-sm">
                                            {permiso.nombre_permiso}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Edición de Permisos */}
            {editingRol && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                    Editar Permisos - {editingRol.nombre}
                                </h3>
                                <button
                                    onClick={() => setEditingRol(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="mt-4 max-h-[400px] overflow-y-auto">
                                <div className="grid grid-cols-1 gap-2">
                                    {todosLosPermisos.map(permiso => (
                                        <div key={`edit-${editingRol.id_rol}-${permiso.id_permiso}`} 
                                             className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium">{permiso.nombre_permiso}</p>
                                                <p className="text-sm text-gray-500">{permiso.ruta}</p>
                                            </div>
                                            <button
                                                onClick={() => handleTogglePermiso(permiso.id_permiso)}
                                                className={`p-2 rounded ${
                                                    editingRol.permisosSeleccionados.has(permiso.id_permiso)
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}
                                            >
                                                {editingRol.permisosSeleccionados.has(permiso.id_permiso) 
                                                    ? <FaCheck /> 
                                                    : <FaPlus />
                                                }
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={() => setEditingRol(null)}
                                className="bg-gray-200 px-4 py-2 rounded text-gray-800 hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGuardarPermisos}
                                className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaRoles; 