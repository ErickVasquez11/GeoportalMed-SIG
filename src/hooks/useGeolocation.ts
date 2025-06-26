import { useState, useEffect } from 'react';
import { UserLocation } from '../types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por este navegador');
      setLoading(false);
      return;
    }

    const success = (position: GeolocationPosition) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
      setLoading(false);
    };

    const error = (error: GeolocationPositionError) => {
      setError(error.message);
      setLoading(false);
    };

    const watchId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error, loading };
};