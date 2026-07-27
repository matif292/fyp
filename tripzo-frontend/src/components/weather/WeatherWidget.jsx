import React, { useState, useEffect } from 'react';
import { getWeatherForDates } from '../../api/weather';
import {
  Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer,
  Droplets, MapPin, Sunrise, Sunset, Calendar,
} from 'lucide-react';

/**
 * Weather widget — Figure 5.13 style.
 * Blue gradient "live conditions" hero card + a hoverable multi-day forecast strip.
 */
const WeatherWidget = ({ city, checkInDate, checkOutDate }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      if (!city || !checkInDate) return;
      setLoading(true);
      try {
        const response = await getWeatherForDates(city, checkInDate, checkOutDate);
        setWeather(response.data.data);
      } catch (err) {
        setError('Could not load weather');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [city, checkInDate, checkOutDate]);

  const iconFor = (condition, size = 28) => {
    const text = condition?.toLowerCase() || '';
    if (text.includes('rain')) return <CloudRain size={size} />;
    if (text.includes('snow')) return <CloudSnow size={size} />;
    if (text.includes('cloud')) return <Cloud size={size} />;
    if (text.includes('wind')) return <Wind size={size} />;
    return <Sun size={size} />;
  };

  if (loading)
    return (
      <div className="center-loader">
        <div className="spinner" style={{ width: 24, height: 24 }} />
      </div>
    );
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!weather) return null;

  const days = weather.forecast?.forecastday || [];
  const first = days[0];
  const current = weather.current || {};
  const temp = current.temp_c ?? first?.day?.avgtemp_c;
  const condText = current.condition?.text || first?.day?.condition?.text || '';
  const feels = current.feelslike_c;
  const humidity = current.humidity ?? first?.day?.avghumidity;
  const wind = current.wind_kph ?? first?.day?.maxwind_kph;
  const astro = first?.astro;

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="wx-hero">
        <div className="wx-top">
          <span className="wx-loc"><MapPin size={14} /> {weather.location?.name || city}{weather.location?.country ? `, ${weather.location.country}` : ''}</span>
          <span className="wx-live">Live</span>
        </div>

        <div className="wx-main">
          {iconFor(condText, 44)}
          <div>
            <div className="wx-temp">{temp != null ? `${Math.round(temp)}°C` : '—'}</div>
            <div className="wx-cond">{condText}</div>
          </div>
        </div>

        <div className="wx-chips">
          {feels != null && (
            <div className="wx-chip"><Thermometer size={14} /> Feels like <strong>{Math.round(feels)}°C</strong></div>
          )}
          {humidity != null && (
            <div className="wx-chip"><Droplets size={14} /> Humidity <strong>{humidity}%</strong></div>
          )}
          {wind != null && (
            <div className="wx-chip"><Wind size={14} /> Wind speed <strong>{Math.round(wind)} km/h</strong></div>
          )}
        </div>

        {astro && (
          <div className="wx-sun">
            <span><Sunrise size={13} style={{ verticalAlign: -2 }} /> Sunrise <strong>{astro.sunrise}</strong></span>
            <span><Sunset size={13} style={{ verticalAlign: -2 }} /> Sunset <strong>{astro.sunset}</strong></span>
          </div>
        )}
      </div>

      {days.length > 0 && (
        <div className="card card-pad">
          <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5 }}>
            <Calendar size={16} /> {days.length}-day forecast for your stay
          </h4>
          <div className="wx-forecast">
            {days.map((day) => (
              <div key={day.date} className="wx-day">
                <div className="d">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                <div className="dt">{new Date(day.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</div>
                <div className="ic">{iconFor(day.day.condition.text, 26)}</div>
                <div className="t">{Math.round(day.day.avgtemp_c)}°C</div>
                <div className="hl">↑{Math.round(day.day.maxtemp_c)}° ↓{Math.round(day.day.mintemp_c)}°</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
