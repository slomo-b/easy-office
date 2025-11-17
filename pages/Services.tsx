import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ServiceData } from '../types';
import { getServices, deleteService } from '../services/serviceService';

const Services = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = useCallback(async () => {
    setLoading(true);
    const fetchedServices = await getServices();
    setServices(fetchedServices);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Leistung löschen möchten? Sie wird aus allen Zeiteinträgen entfernt.')) {
      await deleteService(id);
      await loadServices();
    }
  };

  if (loading) {
    return <div className="text-center p-10">Lade Leistungen...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Leistungen / Kostenstellen</h2>
        <Link to="/service/new" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Neue Leistung anlegen
        </Link>
      </div>
      
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Preis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Einheit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {services.length > 0 ? services.map(service => (
              <tr key={service.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">CHF {Number(service.price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{service.unit}</td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/service/edit/${service.id}`} className="text-emerald-400 hover:text-emerald-300 mr-4">
                    Bearbeiten
                  </Link>
                  <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-400">
                    Löschen
                  </button>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400">
                        Keine Leistungen gefunden.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Services;