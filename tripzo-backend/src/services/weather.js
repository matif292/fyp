const pool = require('../config/database');
const axios = require('axios');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = 'http://api.weatherapi.com/v1';

class WeatherService {
    static async getForecast(city, days = 5) {
        // Check cache
        const cacheQuery = `
            SELECT * FROM weather_cache 
            WHERE city = ? AND date >= CURDATE() 
            ORDER BY date DESC LIMIT 1
        `;
        const [cached] = await pool.execute(cacheQuery, [city]);

        if (cached.length > 0) {
            const cachedDate = new Date(cached[0].created_at);
            const now = new Date();
            const hoursDiff = (now - cachedDate) / (1000 * 60 * 60);
            if (hoursDiff < 6) {
                return JSON.parse(cached[0].forecast_data);
            }
        }

        try {
            const response = await axios.get(`${WEATHER_API_URL}/forecast.json`, {
                params: {
                    key: WEATHER_API_KEY,
                    q: city,
                    days: days,
                    aqi: 'no',
                    alerts: 'no'
                }
            });

            const forecastData = response.data;

            const insertQuery = `
                INSERT INTO weather_cache (city, date, forecast_data, expires_at)
                VALUES (?, CURDATE(), ?, DATE_ADD(NOW(), INTERVAL 6 HOUR))
                ON DUPLICATE KEY UPDATE 
                forecast_data = VALUES(forecast_data),
                expires_at = VALUES(expires_at),
                created_at = NOW()
            `;
            await pool.execute(insertQuery, [city, JSON.stringify(forecastData)]);

            return forecastData;
        } catch (error) {
            console.error('Weather API error:', error);
            throw error;
        }
    }

    static async getWeatherForDates(city, startDate, endDate) {
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const forecast = await this.getForecast(city, Math.min(days + 2, 10));
        
        const filtered = forecast.forecast.forecastday.filter(day => {
            const date = new Date(day.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        return {
            ...forecast,
            forecast: {
                ...forecast.forecast,
                forecastday: filtered
            }
        };
    }

    static async getAlerts(city) {
        try {
            const response = await axios.get(`${WEATHER_API_URL}/forecast.json`, {
                params: {
                    key: WEATHER_API_KEY,
                    q: city,
                    days: 3,
                    alerts: 'yes'
                }
            });
            return response.data.alerts || [];
        } catch (error) {
            console.error('Weather alerts error:', error);
            return [];
        }
    }
}

module.exports = WeatherService;