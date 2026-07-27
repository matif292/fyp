import React, { useState, useEffect } from 'react';
import { getWeather } from '../api/weather';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react';

const WeatherWidget = ({ city, checkInDate, checkOutDate }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      if (!city || !checkInDate) return;
      setLoading(true);
      try {
        const response = await getWeather(city, checkInDate, checkOutDate);
        setWeather(response.data);
      } catch (err) {
        setError('Could not load weather');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [city, checkInDate, checkOutDate]);

  if (loading) return <div className="center-loader"><div className="spinner" style={{ width: 24, height: 24 }} /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!weather) return null;

  const getWeatherIcon = (condition) => {
    const text = condition?.toLowerCase() || '';
    if (text.includes('rain')) return <CloudRain size={24} />;
    if (text.includes('snow')) return <CloudSnow size={24} />;
    if (text.includes('cloud')) return <Cloud size={24} />;
    if (text.includes('wind')) return <Wind size={24} />;
    return <Sun size={24} />;
  };

  return (
    <div className="card card-pad" style={{ marginBottom: 16 }}>
      <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Cloud size={20} /> Weather Forecast
      </h4>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {weather.forecast?.forecastday?.map((day) => (
          <div key={day.date} style={{ 
            minWidth: 120, 
            textAlign: 'center',
            padding: '8px 12px',
            background: 'var(--paper-dim)',
            borderRadius: '8px',
            flex: '0 0 auto'
          }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {day.date}
            </div>
            <div style={{ fontSize: 28, margin: '4px 0' }}>
              {getWeatherIcon(day.day.condition.text)}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {day.day.avgtemp_c}°C
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {day.day.condition.text}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: 11, marginTop: 4 }}>
              <span>↑{day.day.maxtemp_c}°</span>
              <span>↓{day.day.mintemp_c}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;