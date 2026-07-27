const WeatherService = require('../services/weather');

// Get weather forecast
exports.getWeather = async (req, res) => {
    try {
        const { city, startDate, endDate } = req.query;

        if (!city) {
            return res.status(400).json({ success: false, message: 'City is required' });
        }

        let weatherData;
        if (startDate && endDate) {
            weatherData = await WeatherService.getWeatherForDates(city, startDate, endDate);
        } else {
            weatherData = await WeatherService.getForecast(city);
        }

        res.json({ success: true, data: weatherData });
    } catch (error) {
        console.error('Get weather error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch weather' });
    }
};

// Get weather alerts
exports.getWeatherAlerts = async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ success: false, message: 'City is required' });
        }

        const alerts = await WeatherService.getAlerts(city);
        res.json({ success: true, data: alerts });
    } catch (error) {
        console.error('Get weather alerts error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
    }
};