// CameraCapture.js
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        openCamera();
        return () => closeCamera(); // Limpia la cámara al desmontar el componente
    }, []);

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            onCapture(blob);
        });

        closeCamera();
    };

    const closeCamera = () => {
        const stream = videoRef.current?.srcObject;
        const tracks = stream?.getTracks();
        tracks?.forEach((track) => track.stop());
        onClose(); // Cierra la cámara
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>
                <video ref={videoRef} autoPlay style={{ width: '50%', height: 'auto', borderRadius: '8px', marginBottom: '20px' }}></video>
            </div>

            <div style={{ marginTop: '05px', display: 'flex', gap: '10px', justifyContent: 'flex-start', width: '95%' }}>
                <button
                    onClick={capturePhoto}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                >
                    Capturar Foto
                </button>

                <button
                    onClick={closeCamera}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#d32f2f'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
                >
                    Cancelar
                </button>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

CameraCapture.propTypes = {
    onCapture: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default CameraCapture;
