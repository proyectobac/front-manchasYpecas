import { useState, useEffect } from 'react';
import EmpleadoService from '../services/empleadosService';

const useEmpleado = (id) => {
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmpleado = async () => {
      try {
        setLoading(true);
        const data = await EmpleadoService.getEmpleadoById(id);
        setEmpleado(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmpleado();
    }
  }, [id]);

  return { empleado, loading, error };
};

export default useEmpleado; 