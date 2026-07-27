const express = require('express');
const router = express.Router();
const { getWeather, getWeatherAlerts } = require('../controllers/weatherController');

router.get('/', getWeather);
router.get('/alerts', getWeatherAlerts);

module.exports = router;