// ProfileImageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getUserInfo } from '../../Salida/auth';

const ProfileImageContext = createContext(null);

export const ProfileImageProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserProfileImage = async () => {
      try {
        const userInfo = await getUserInfo();
        if (userInfo && userInfo.foto) {
          setProfileImage(`/uploads/${userInfo.foto}`);
        } else {
          setProfileImage('defaultAvatar');  // Establecer la imagen predeterminada si no hay una imagen de perfil
        }
      } catch (error) {
        console.error('Error fetching user profile image', error);
      }
    };

    fetchUserProfileImage();
  }, []);

  return (
    <ProfileImageContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </ProfileImageContext.Provider>
  );
};

ProfileImageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProfileImage = () => useContext(ProfileImageContext);
