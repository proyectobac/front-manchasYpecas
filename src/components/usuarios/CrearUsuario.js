import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import UsuariosService from '../../services/usuariosService';
import RolesService from '../../services/rolesService';

const CrearUsuario = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        id_rol: '',
        estado: 'Activo'
    });

    useEffect(() => {
        cargarRoles();
    }, []);

    const cargarRoles = async () => {
        try {
            const response = await RolesService.getAllRoles();
            setRoles(response.listaRoles || []);
        } catch (error) {
            console.error('Error cargando roles:', error);
            Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
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

    const validarFormulario = () => {
        if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
            Swal.fire('Error', 'Todos los campos marcados con * son obligatorios', 'error');
            return false;
        }

        if (!formData.id_rol) {
            Swal.fire('Error', 'Debe seleccionar un rol', 'error');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Swal.fire('Error', 'El correo electrónico no es válido', 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        try {
            const userData = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                password: formData.password,
                id_rol: formData.id_rol,
                estado: formData.estado
            };

            await UsuariosService.createUsuario(userData);
            
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Usuario creado correctamente',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/usuarios/lista');
            });
        } catch (error) {
            console.error('Error creando usuario:', error);
            Swal.fire('Error', 'No se pudo crear el usuario', 'error');
        }
    };

    if (loading) {
        return <div className="text-center p-4">Cargando...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Crear Nuevo Usuario</h2>
                <button
                    onClick={() => navigate('/usuarios/lista')}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    <FaArrowLeft className="mr-2" /> Volver
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información personal */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre*
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                className="form-input w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Apellido*
                            </label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleInputChange}
                                className="form-input w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico*
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-input w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* Información de acceso */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña*
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="form-input w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Contraseña*
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="form-input w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rol*
                            </label>
                            <select
                                name="id_rol"
                                value={formData.id_rol}
                                onChange={handleInputChange}
                                className="form-select w-full"
                                required
                            >
                                <option value="">Seleccione un rol...</option>
                                {roles.map(rol => (
                                    <option key={rol.id_rol} value={rol.id_rol}>
                                        {rol.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleInputChange}
                                className="form-select w-full"
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <FaSave className="mr-2" /> Guardar Usuario
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CrearUsuario; 