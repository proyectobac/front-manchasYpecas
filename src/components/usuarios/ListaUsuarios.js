import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Swal from 'sweetalert2';
import UsuariosService from '../../services/usuariosService';

const ListaUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const response = await UsuariosService.getAllUsuarios();
            console.log('Usuarios cargados:', response.usuarios);
            setUsuarios(response.usuarios || []);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEstado = async (usuario) => {
        // Verificar que no sea SuperAdmin (rol id 1)
        if (usuario.id_rol === 1) {
            Swal.fire('Error', 'No se puede cambiar el estado de un SuperAdmin', 'error');
            return;
        }

        const nuevoEstado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';
        
        try {
            await UsuariosService.updateUsuario(usuario.id_usuario, {
                estado: nuevoEstado
            });
            
            Swal.fire(
                '¡Actualizado!', 
                `El usuario ahora está ${nuevoEstado.toLowerCase()}`, 
                'success'
            );
            
            cargarUsuarios();
        } catch (error) {
            console.error('Error actualizando estado:', error);
            Swal.fire('Error', 'No se pudo actualizar el estado del usuario', 'error');
        }
    };

    const handleEditUser = async (usuario) => {
        // Verificar que no sea SuperAdmin (rol id 1)
        if (usuario.id_rol === 1) {
            Swal.fire('Error', 'No se puede editar un SuperAdmin', 'error');
            return;
        }
        
        const { value: formValues } = await Swal.fire({
            title: 'Editar Usuario',
            html: `
                <div style="text-align: left;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre:</label>
                    <input id="swal-input-nombre" class="swal2-input" placeholder="Nombre" value="${usuario.nombre || usuario.nombre_usuario || ''}" style="margin-bottom: 10px;">
                    
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Apellido:</label>
                    <input id="swal-input-apellido" class="swal2-input" placeholder="Apellido" value="${usuario.apellido || ''}" style="margin-bottom: 10px;">
                    
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Correo:</label>
                    <input id="swal-input-correo" class="swal2-input" placeholder="Correo" value="${usuario.correo || ''}" type="email" style="margin-bottom: 10px;">
                    
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Teléfono:</label>
                    <input id="swal-input-telefono" class="swal2-input" placeholder="Teléfono" value="${usuario.telefono || ''}" style="margin-bottom: 10px;">
                    
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Rol:</label>
                    <select id="swal-input-rol" class="swal2-input" style="margin-bottom: 10px;">
                        <option value="2" ${usuario.id_rol === 2 ? 'selected' : ''}>Empleado</option>
                        <option value="3" ${usuario.id_rol === 3 ? 'selected' : ''}>Cliente</option>
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            width: '500px',
            preConfirm: () => {
                const nombre = document.getElementById('swal-input-nombre').value;
                const apellido = document.getElementById('swal-input-apellido').value;
                const correo = document.getElementById('swal-input-correo').value;
                const telefono = document.getElementById('swal-input-telefono').value;
                const rol = document.getElementById('swal-input-rol').value;
                
                // Validaciones básicas
                if (!nombre || !correo) {
                    Swal.showValidationMessage('El nombre y correo son obligatorios');
                    return false;
                }
                
                // Validar formato de correo
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(correo)) {
                    Swal.showValidationMessage('El formato del correo no es válido');
                    return false;
                }
                
                return {
                    nombre: nombre,
                    apellido: apellido,
                    correo: correo,
                    telefono: telefono,
                    id_rol: parseInt(rol)
                };
            }
        });

        if (formValues) {
            try {
                // Llamar al servicio para actualizar el usuario
                await UsuariosService.updateUsuario(usuario.id_usuario, formValues);
                
                Swal.fire(
                    '¡Actualizado!',
                    'Los datos del usuario han sido actualizados correctamente',
                    'success'
                );
                
                // Recargar la lista de usuarios
                cargarUsuarios();
                
            } catch (error) {
                console.error('Error actualizando usuario:', error);
                Swal.fire(
                    'Error',
                    'No se pudieron actualizar los datos del usuario',
                    'error'
                );
            }
        }
    };

    const handleDeleteUser = async (usuario) => {
        // Verificar que no sea SuperAdmin (rol id 1)
        if (usuario.id_rol === 1) {
            Swal.fire('Error', 'No se puede eliminar un SuperAdmin', 'error');
            return;
        }

        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `¿Deseas eliminar al usuario ${usuario.nombre_usuario}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                await UsuariosService.deleteUsuario(usuario.id_usuario);
                Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
                cargarUsuarios();
            }
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            Swal.fire('Error', 'Este Uario no se puede eliminar porque tiene pagos asociados ', 'error');
        }
    };

    const getRoleName = (usuario) => {
        // Acceder al rol usando la estructura correcta
        if (usuario.Rol && usuario.Rol.nombre) {
            return usuario.Rol.nombre;
        }
        // Fallback basado en id_rol
        switch (usuario.id_rol) {
            case 1: return 'SuperAdmin';
            case 2: return 'Empleado';
            case 3: return 'Cliente';
            default: return 'Sin rol';
        }
    };

    const getRoleColor = (usuario) => {
        const roleName = getRoleName(usuario);
        switch (roleName) {
            case 'SuperAdmin':
                return 'bg-purple-100 text-purple-800';
            case 'Empleado':
                return 'bg-blue-100 text-blue-800';
            case 'Cliente':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Cargando usuarios...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Lista de Usuarios</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    NOMBRE
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CORREO
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    TELÉFONO
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ROL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ESTADO
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ACCIONES
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id_usuario} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {usuario.nombre || usuario.nombre_usuario}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {usuario.apellido}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {usuario.correo}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {usuario.telefono || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(usuario)}`}>
                                            {getRoleName(usuario)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            usuario.estado === 'Activo' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {usuario.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {/* Toggle Estado - Deshabilitado para SuperAdmin */}
                                            <button
                                                onClick={() => handleToggleEstado(usuario)}
                                                disabled={usuario.id_rol === 1}
                                                className={`p-2 rounded-full ${
                                                    usuario.id_rol === 1
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : usuario.estado === 'Activo'
                                                        ? 'text-green-600 hover:bg-green-100'
                                                        : 'text-gray-400 hover:bg-gray-100'
                                                }`}
                                                title={
                                                    usuario.id_rol === 1 
                                                        ? 'No se puede modificar SuperAdmin'
                                                        : `${usuario.estado === 'Activo' ? 'Desactivar' : 'Activar'} usuario`
                                                }
                                            >
                                                {usuario.estado === 'Activo' ? (
                                                    <FaToggleOn className="text-xl" />
                                                ) : (
                                                    <FaToggleOff className="text-xl" />
                                                )}
                                            </button>

                                            {/* Editar - Deshabilitado para SuperAdmin */}
                                            <button
                                                onClick={() => handleEditUser(usuario)}
                                                disabled={usuario.id_rol === 1}
                                                className={`p-2 rounded-full ${
                                                    usuario.id_rol === 1
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-blue-600 hover:bg-blue-100'
                                                }`}
                                                title={
                                                    usuario.id_rol === 1
                                                        ? 'No se puede editar SuperAdmin'
                                                        : 'Editar usuario'
                                                }
                                            >
                                                <FaEdit className="text-lg" />
                                            </button>

                                            {/* Eliminar - Solo visible si no es SuperAdmin */}
                                            {usuario.id_rol !== 1 && (
                                                <button
                                                    onClick={() => handleDeleteUser(usuario)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                                                    title="Eliminar usuario"
                                                >
                                                    <FaTrash className="text-lg" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {usuarios.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No hay usuarios registrados</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListaUsuarios;