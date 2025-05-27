import React, { useState, useEffect } from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardHeader, CInputGroup, CCardFooter, CInputGroupText, CFormInput, CButton } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faUserEdit, faEdit, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { getUserInfo } from '../../../components/auht'; // Corregí el nombre del archivo
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const EditProfilePage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [isProfileUpdated, setIsProfileUpdated] = useState(false);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userInfo = await getUserInfo();
                setName(userInfo.nombre_usuario || '');
                setEmail(userInfo.correo || '');
                setUserData(userInfo);
            } catch (error) {
                console.error('Error al obtener datos del usuario', error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        setIsProfileUpdated(name || email || newPassword || confirmPassword);
    }, [name, email, newPassword, confirmPassword]);

    const handleEdit = (field) => {
        setEditingField(field);
    }

    const validateName = (value) => {
        return /^[a-zA-Z0-9_-]*$/.test(value);
    }

    const validateEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    const validatePassword = (value) => {
        return value.length >= 8;
    }

    const handleUpdateProfile = async () => {
        try {
            if (!isProfileUpdated) {
                setUpdateError('Debes actualizar al menos un campo');
                return;
            }

            if (newPassword && newPassword !== confirmPassword) {
                setUpdateError('Las contraseñas no coinciden');
                return;
            }

            if (name && !validateName(name)) {
                setUpdateError('El nombre solo puede contener letras y espacios');
                return;
            }

            if (email && !validateEmail(email)) {
                setUpdateError('Ingrese un correo electrónico válido');
                return;
            }

            if (newPassword && !validatePassword(newPassword)) {
                setUpdateError('La contraseña debe tener al menos 8 caracteres');
                return;
            }

            Swal.fire({
                icon: 'question',
                title: '¿Estás seguro de que deseas actualizar tus datos?',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    confirmUpdate();
                }
            });
        } catch (error) {
            console.error('Error al realizar la actualización', error);
            setUpdateSuccess(false);
            setUpdateError('Error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    const confirmUpdate = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/actualizarPerfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    nombre: name,
                    correo: email,
                    nuevaContrasena: newPassword || null,
                }),
            });
    
            if (response.ok) {
                setUpdateSuccess(true);
                setTimeout(() => {
                    navigate('/login'); // Redireccionar al login después de actualizar el perfil
                }, 3000);
            } else {
                const data = await response.json();
                let errorMessage = '';
                if (data.error && data.error.sqlMessage) {
                    if (data.error.sqlMessage.includes('nombre_usuario')) {
                        errorMessage = 'El nombre de usuario ya está en uso';
                    } else if (data.error.sqlMessage.includes('correo')) {
                        errorMessage = 'El correo electrónico ya está en uso';
                    } else {
                        errorMessage = 'Error al actualizar el perfil. Por favor, inténtalo de nuevo.';
                    }
                } else {
                    errorMessage = 'Error al actualizar el perfil. Por favor, inténtalo de nuevo.';
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el perfil',
                    text: errorMessage,
                });
            }
        } catch (error) {
            console.error('Error al realizar la actualización', error);
            setUpdateError('Error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.');
        }
    }
    

};

export default EditProfilePage;
