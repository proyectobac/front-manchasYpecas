import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CButton, CCard, CCardBody, CForm, CFormInput, CAlert } from '@coreui/react';
import Swal from 'sweetalert2';
import fondo from '../../../assets/images/ftos/mk.png';
import 'src/scss/css/global.css'; 
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  

  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token');

  useEffect(() => {
    // Log para verificar que el token se obtiene correctamente
    console.log('Token obtenido:', token);
  }, [token]);

  
  const handleResetPassword = async () => {
    try {
      setError(null);
      setSuccess(null);
  
      if (!password.trim() || !confirmPassword.trim()) {
        setError(' P004 - E004 Por favor, complete todos los campos.');
        return;
      }
  
      if (password !== confirmPassword) {
        setError('P004 - E005 Las contraseñas no coinciden. Por favor, inténtelo de nuevo.');
        return;
      }
  
      if (password.length < 8 || password.length > 20) {
        setError(' P004 - E006 La contraseña debe tener entre 8 y 20 caracteres.');
        return;
      }
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cambiar-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ token, nuevaContrasena: password }),
      });
  
      const responseBody = await response.json();
  
      if (response.ok) {
        setSuccess(responseBody.mensaje);
  
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: responseBody.mensaje,
        }).then(() => {
          navigate('/login');
        });
      } else {
        setError(responseBody.mensaje || ' P004 - E005 Hubo un problema al procesar su solicitud. Por favor, inténtelo nuevamente.');
      }
    } catch (error) {
      console.error(' P004 - E006 Error al procesar el restablecimiento de contraseña:', error);
  
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          setError(' P004 - E006 Hubo un problema de conexión. Por favor, revise su conexión a Internet e inténtelo nuevamente.');
        } else {
          setError(' P004 - E007 Hubo un problema al procesar su solicitud. Por favor, inténtelo nuevamente.');
        }
      } else {
        setError(' P004 - E008 Hubo un error inesperado. Por favor, inténtelo nuevamente.');
      }
    }
  };
  
  

  
  return (
    <div
      className="min-vh-100 d-flex flex-row align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <CCard className="p-4">
        <CCardBody>
          <CForm>
            <h3 className="text-center mb-4">Restablecer Contraseña</h3>
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}
            <CFormInput
              type="password"
              placeholder="Nueva Contraseña"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <CFormInput
              type="password"
              placeholder="Confirmar Contraseña"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <CButton color="primary" className="w-100 mt-3" onClick={handleResetPassword}>
              Restablecer Contraseña
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
};


export default ResetPassword;
