import client from './client';

export const getWeather = (city, days = 5) => 
  client.get('/weather', { params: { city, days } });
export const getWeatherForDates = (city, startDate, endDate) => 
  client.get('/weather', { params: { city, startDate, endDate } });
export const getWeatherAlerts = (city) => 
  client.get('/weather/alerts', { params: { city } });