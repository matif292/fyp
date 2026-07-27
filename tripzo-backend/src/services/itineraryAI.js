const pool = require('../config/database');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const CACHE_DAYS = 14;

class ItineraryAI {
    static async getItinerary(hostel, durationDays, interests = '') {
        const cacheKey = interests.trim().toLowerCase();

        try {
            const [cached] = await pool.execute(
                `SELECT * FROM hostel_itineraries
                 WHERE hostel_id = ? AND duration_days = ? AND interests = ?
                 ORDER BY created_at DESC LIMIT 1`,
                [hostel.id, durationDays, cacheKey]
            );

            if (cached.length > 0) {
                const ageDays = (Date.now() - new Date(cached[0].created_at)) / (1000 * 60 * 60 * 24);
                if (ageDays < CACHE_DAYS) {
                    return JSON.parse(cached[0].itinerary);
                }
            }
        } catch (error) {
            console.error('Itinerary cache lookup failed:', error.message);
        }

        let itinerary;
        try {
            itinerary = await this.generateWithGemini(hostel, durationDays, interests);
        } catch (error) {
            console.error('Itinerary AI error:', error.message);
            itinerary = this.getFallbackItinerary(hostel, durationDays);
        }

        try {
            await pool.execute(
                `INSERT INTO hostel_itineraries (hostel_id, duration_days, interests, itinerary)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE itinerary = VALUES(itinerary), created_at = NOW()`,
                [hostel.id, durationDays, cacheKey, JSON.stringify(itinerary)]
            );
        } catch (error) {
            console.error('Itinerary cache write failed:', error.message);
        }

        return itinerary;
    }

    static async generateWithGemini(hostel, durationDays, interests) {
        const location = [hostel.name, hostel.city, hostel.state, hostel.country].filter(Boolean).join(', ');
        const interestLine = interests ? `The traveler is especially interested in: ${interests}.` : '';

        const prompt = `You are a local travel guide for ${location}.
Suggest 5-8 famous attractions/places to visit near this location, and a ${durationDays}-day itinerary that visits them.
${interestLine}

Respond with ONLY valid JSON, no markdown fences, matching exactly this shape:
{
  "attractions": [
    { "name": string, "category": string, "description": string, "distance_km": number, "suggested_duration": string }
  ],
  "itinerary": [
    { "day": number, "title": string, "activities": [string] }
  ]
}`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { timeout: 20000 }
        );

        const text = response.data.candidates[0].content.parts[0].text;
        const cleaned = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (!Array.isArray(parsed.attractions) || !Array.isArray(parsed.itinerary)) {
            throw new Error('Malformed AI response');
        }
        return parsed;
    }

    static getFallbackItinerary(hostel, durationDays) {
        const city = hostel.city || 'the area';
        const attractions = [
            { name: `${city} Old Bazaar`, category: 'culture', description: `Wander the local market streets of ${city}.`, distance_km: 1, suggested_duration: '2 hours' },
            { name: `${city} Viewpoint`, category: 'nature', description: `A well-known scenic lookout near ${city}.`, distance_km: 5, suggested_duration: 'Half day' },
            { name: `${city} Heritage Site`, category: 'history', description: `A notable historic landmark in the ${city} region.`, distance_km: 8, suggested_duration: '2-3 hours' },
        ];
        const itinerary = Array.from({ length: durationDays }, (_, i) => ({
            day: i + 1,
            title: i === 0 ? `Arrival and settle in ${city}` : `Explore around ${city} — day ${i + 1}`,
            activities: i === 0
                ? [`Check in`, `Short walk around ${city}`, `Local dinner`]
                : [attractions[i % attractions.length]?.name || `Free day in ${city}`, 'Local food tasting', 'Rest / optional activities'],
        }));

        return { attractions, itinerary, source: 'fallback' };
    }
}

module.exports = ItineraryAI;
