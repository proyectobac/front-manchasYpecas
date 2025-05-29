import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import RolesService from '../../services/rolesService';

const CrearRol = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nombre: '',
        estado: 'Activo',
        permisosSeleccionados: new Set()
    });
    const [todosLosPermisos, setTodosLosPermisos] = useState([]);

    useEffect(() => {
        cargarPermisos();
    }, []);

    const cargarPermisos = async () => {
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
            
            setTodosLosPermisos(permisosArray);
        } catch (error) {
            console.error('Error cargando permisos:', error);
            Swal.fire('Error', 'No se pudieron cargar los permisos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTogglePermiso = (idPermiso) => {
        setFormData(prev => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nombre.trim()) {
            Swal.fire('Error', 'El nombre del rol es obligatorio', 'error');
            return;
        }

        if (formData.permisosSeleccionados.size === 0) {
            Swal.fire('Error', 'Debe seleccionar al menos un permiso', 'error');
            return;
        }

        try {
            const rolData = {
                nombre: formData.nombre,
                estado: formData.estado,
                permisos: Array.from(formData.permisosSeleccionados)
            };

            await RolesService.createRol(rolData);
            
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Rol creado correctamente',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/roles/lista');
            });
        } catch (error) {
            console.error('Error creando rol:', error);
            Swal.fire('Error', 'No se pudo crear el rol', 'error');
        }
    };

    if (loading) {
        return <div className="text-center p-4">Cargando...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Crear Nuevo Rol</h2>
                <button
                    onClick={() => navigate('/roles/lista')}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    <FaArrowLeft className="mr-2" /> Volver
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Rol*
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className="form-input w-full rounded-md border-gray-300"
                            placeholder="Ingrese el nombre del rol"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleInputChange}
                            className="form-select w-full rounded-md border-gray-300"
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Permisos:
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {todosLosPermisos.map(permiso => (
                                <div 
                                    key={permiso.id_permiso}
                                    className="relative flex items-start"
                                >
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            id={`permiso-${permiso.id_permiso}`}
                                            checked={formData.permisosSeleccionados.has(permiso.id_permiso)}
                                            onChange={() => handleTogglePermiso(permiso.id_permiso)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label 
                                            htmlFor={`permiso-${permiso.id_permiso}`}
                                            className="font-medium text-gray-700 cursor-pointer"
                                        >
                                            {permiso.nombre_permiso}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <FaSave className="mr-2" /> Guardar Rol
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CrearRol; 