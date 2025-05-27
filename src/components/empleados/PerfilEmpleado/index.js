import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaIdCard, FaPhone } from 'react-icons/fa';
import defaultUserImage from '../../../assets/images/login1.jpg';
import { getUserInfo } from '../../../Salida/auth';

const PerfilEmpleado = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userInfo = getUserInfo();
    console.log('User Info:', userInfo); // Para debug
    if (userInfo) {
      setUserData(userInfo);
    }
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfil no encontrado</h2>
          <p className="text-gray-600">No se encontró tu información de usuario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header con foto */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white">
              <img
                src={userData.foto || defaultUserImage}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mt-4">
            {userData.nombre_usuario} {userData.apellido}
          </h2>
          {userData.id_rol && (
            <p className="text-center text-white opacity-75 mt-1">
              Rol: {userData.rol?.nombre || 'Empleado'}
            </p>
          )}
        </div>

        {/* Información del usuario */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correo */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FaEnvelope className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Correo</p>
                <p className="text-lg text-gray-900">{userData.correo}</p>
              </div>
            </div>

            {/* Documento */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FaIdCard className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Documento</p>
                <p className="text-lg text-gray-900">{userData.documento || 'No especificado'}</p>
              </div>
            </div>

            {/* Teléfono */}
            {userData.telefono && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <FaPhone className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-lg text-gray-900">{userData.telefono}</p>
                </div>
              </div>
            )}

            {/* Estado */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FaUser className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userData.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {userData.estado}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilEmpleado; 