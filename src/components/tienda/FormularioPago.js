import React, { useState, useEffect } from 'react';
import { FaSpinner, FaUniversity, FaIdCard, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import VentasService from '../../services/ventasServices';

const FormularioPago = ({ total, items, onPagoCompletado, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [bancosPSE, setBancosPSE] = useState([]);
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        email: '',
        telefono: '',
        banco: '',
        tipoPersona: 'natural'
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarBancos = async () => {
            setLoading(true);
            setError(null);
            try {
                const bancos = await VentasService.obtenerBancosPSE();
                setBancosPSE(bancos);
            } catch (err) {
                setError('Error al cargar la lista de bancos. Por favor, intente nuevamente.');
                console.error('Error cargando bancos:', err);
            } finally {
                setLoading(false);
            }
        };

        cargarBancos();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await VentasService.createVenta({
                ...formData,
                total,
                items,
                banco: formData.banco
            });

            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            setError('Error al procesar el pago. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && bancosPSE.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg flex items-center">
                    <FaSpinner className="animate-spin text-4xl text-indigo-600 mr-3" />
                    <p>Cargando bancos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Información de Pago</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaUser className="inline mr-2" />
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                name="nombreCompleto"
                                value={formData.nombreCompleto}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Nombre completo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaIdCard className="inline mr-2" />
                                Tipo de Documento
                            </label>
                            <select
                                name="tipoDocumento"
                                value={formData.tipoDocumento}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="CE">Cédula de Extranjería</option>
                                <option value="NIT">NIT</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaIdCard className="inline mr-2" />
                                Número de Documento
                            </label>
                            <input
                                type="text"
                                name="numeroDocumento"
                                value={formData.numeroDocumento}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Número de documento"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaEnvelope className="inline mr-2" />
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaPhone className="inline mr-2" />
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Número de teléfono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaUniversity className="inline mr-2" />
                                Banco
                            </label>
                            <select
                                name="banco"
                                value={formData.banco}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Seleccione un banco</option>
                                {bancosPSE.map(banco => (
                                    <option key={banco.financial_institution_code} value={banco.financial_institution_code}>
                                        {banco.financial_institution_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaUser className="inline mr-2" />
                                Tipo de Persona
                            </label>
                            <select
                                name="tipoPersona"
                                value={formData.tipoPersona}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="natural">Persona Natural</option>
                                <option value="juridica">Persona Jurídica</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Volver
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Procesando...
                                </>
                            ) : (
                                'Continuar al Pago'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioPago; 