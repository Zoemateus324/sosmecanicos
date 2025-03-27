import React, { useState, useEffect } from 'react';
import { useGeolocation, LocationData } from '../hooks/useGeolocation';
import { useAuth } from '../hooks/useAuth';

export function GeolocationDemo() {
  const { user } = useAuth();
  const {
    currentLocation,
    locationHistory,
    loading,
    error,
    permissionDenied,
    isTracking,
    getCurrentLocation,
    startTracking,
    stopTracking,
    fetchLocationHistory
  } = useGeolocation();

  const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Carregar histórico inicial se o usuário estiver logado
    if (user?.id && showHistory) {
      loadLocationHistory();
    }
  }, [user, showHistory]);

  const loadLocationHistory = async () => {
    if (!user?.id) return;
    
    const history = await fetchLocationHistory(user.id, 10);
    setSavedLocations(history);
  };

  const handleGetCurrentLocation = async () => {
    await getCurrentLocation(user?.id);
  };

  const handleStartTracking = () => {
    startTracking(user?.id);
  };

  const handleStopTracking = () => {
    stopTracking();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Demonstração de Geolocalização</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
          {permissionDenied && (
            <p className="mt-2 text-sm">
              Você precisa permitir o acesso à sua localização nas configurações do navegador.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGetCurrentLocation}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Obtendo...' : 'Obter Localização Atual'}
          </button>

          {!isTracking ? (
            <button
              onClick={handleStartTracking}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Iniciar Rastreamento
            </button>
          ) : (
            <button
              onClick={handleStopTracking}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Parar Rastreamento
            </button>
          )}

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {showHistory ? 'Ocultar Histórico' : 'Mostrar Histórico'}
          </button>
        </div>

        {currentLocation && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Localização Atual</h3>
            <div className="space-y-1">
              <p><span className="font-medium">Latitude:</span> {currentLocation.latitude}</p>
              <p><span className="font-medium">Longitude:</span> {currentLocation.longitude}</p>
              {currentLocation.accuracy && (
                <p><span className="font-medium">Precisão:</span> {currentLocation.accuracy.toFixed(2)} metros</p>
              )}
              <p><span className="font-medium">Atualizado em:</span> {formatDate(currentLocation.timestamp)}</p>
            </div>
          </div>
        )}

        {isTracking && (
          <div className="flex items-center">
            <div className="animate-ping h-3 w-3 bg-green-500 rounded-full mr-2"></div>
            <p className="text-sm text-green-600">Rastreamento ativo</p>
          </div>
        )}

        {showHistory && (
          <div>
            <h3 className="font-semibold mb-2">Histórico de Localizações</h3>
            {user?.id ? (
              <div>
                <button
                  onClick={loadLocationHistory}
                  className="mb-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Atualizar histórico
                </button>
                
                {savedLocations.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precisão</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {savedLocations.map((location: any, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(location.created_at)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{location.latitude}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{location.longitude}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {location.accuracy ? `${location.accuracy.toFixed(2)} m` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum histórico de localização encontrado.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Faça login para ver seu histórico de localizações.</p>
            )}
          </div>
        )}

        {locationHistory.length > 0 && !showHistory && (
          <div>
            <h3 className="font-semibold mb-2">Localizações desta sessão ({locationHistory.length})</h3>
            <div className="max-h-40 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locationHistory.map((location, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(location.timestamp)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{location.latitude}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{location.longitude}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}