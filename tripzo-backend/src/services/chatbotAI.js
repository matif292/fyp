const pool = require('../config/database');
const axios = require('axios');
const BudgetAI = require('./budgetAI');
const WeatherService = require('./weather');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

const SYSTEM_PROMPT = `You are Tripzo AI, a friendly travel assistant for a hostel-booking platform in Pakistan. You understand both English and Roman Urdu.
Given the user's latest message plus the session context and recent conversation, classify intent, extract entities, and write a reply.
Return ONLY valid JSON, no markdown fences, in exactly this shape:
{
  "intent": "findHostel" | "budget" | "weather" | "greet" | "help" | "thanks" | "bye" | "general_chat",
  "city": "lowercase city name mentioned in this message, or null",
  "max_price": integer (PKR per night ceiling) or null,
  "days": integer (trip length) or null,
  "reply": "a short, friendly, conversational reply (max 3 sentences)"
}
Rules:
- findHostel: user wants a place to stay / accommodation / hostel recommendations.
- budget: user asks about cost, kharcha, price estimate for a trip.
- weather: user asks about mausam / weather / temperature for a destination.
- help: user asks what you can do.
- If city or budget aren't mentioned in THIS message, set them to null — session context will be merged separately, don't guess.`;

class ChatbotAI {
    static async getSession(userId) {
        const [rows] = await pool.execute('SELECT * FROM chatbot_sessions WHERE user_id = ?', [userId]);
        return rows[0] || { last_city: null, last_budget: null };
    }

    static async saveSession(userId, { city, budget }) {
        await pool.execute(
            `INSERT INTO chatbot_sessions (user_id, last_city, last_budget) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE last_city = VALUES(last_city), last_budget = VALUES(last_budget)`,
            [userId, city || null, budget || null]
        );
    }

    static async getHistory(userId, limit = 20) {
        const [rows] = await pool.execute(
            'SELECT role, message, created_at FROM chatbot_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT ?',
            [userId, limit]
        );
        return rows;
    }

    static async saveMessage(userId, role, message) {
        await pool.execute(
            'INSERT INTO chatbot_messages (user_id, role, message) VALUES (?, ?, ?)',
            [userId, role, message]
        );
    }

    static async clearSession(userId) {
        await pool.execute('DELETE FROM chatbot_messages WHERE user_id = ?', [userId]);
        await pool.execute('DELETE FROM chatbot_sessions WHERE user_id = ?', [userId]);
    }

    static async searchHostels(city, maxPrice, limit = 5) {
        let query = `
            SELECT h.id, h.name, h.city, h.rating,
                   (SELECT MIN(price_per_night) FROM room_types WHERE hostel_id = h.id) as min_price
            FROM hostels h
            WHERE h.is_active = TRUE AND LOWER(h.city) LIKE LOWER(?)
        `;
        const params = [`%${city}%`];
        if (maxPrice) {
            query += ' AND EXISTS (SELECT 1 FROM room_types rt WHERE rt.hostel_id = h.id AND rt.price_per_night <= ?)';
            params.push(maxPrice);
        }
        query += ' ORDER BY h.rating DESC LIMIT ?';
        params.push(limit);
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async callGemini(message, session, history) {
        const contextLine = `Known session context: city=${session.last_city || 'none'}, budget=${session.last_budget || 'none'}.`;
        const recentTurns = history.slice(-6).map((h) => `${h.role}: ${h.message}`).join('\n');
        const prompt = `${contextLine}\n\nRecent conversation:\n${recentTurns}\n\nUser: ${message}`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                generationConfig: { responseMimeType: 'application/json' }
            }
        );

        let text = response.data.candidates[0].content.parts[0].text;
        text = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        return JSON.parse(text);
    }

    static async processMessage(userId, message) {
        await this.saveMessage(userId, 'user', message);

        const session = await this.getSession(userId);
        const history = await this.getHistory(userId, 8);

        let parsed;
        try {
            parsed = await this.callGemini(message, session, history);
        } catch (firstError) {
            console.error('Chatbot Gemini error (attempt 1):', firstError.response?.data || firstError.message);
            try {
                await new Promise((resolve) => setTimeout(resolve, 800));
                parsed = await this.callGemini(message, session, history);
            } catch (secondError) {
                console.error('Chatbot Gemini error (attempt 2):', secondError.response?.data || secondError.message);
                parsed = null;
            }
        }
        if (!parsed) {
            parsed = {
                intent: 'general_chat',
                city: null,
                max_price: null,
                days: null,
                reply: "Sorry, I'm having trouble thinking right now — please try again in a moment!"
            };
        }

        const city = parsed.city || session.last_city;
        const maxPrice = parsed.max_price || session.last_budget;
        if (city || maxPrice) {
            await this.saveSession(userId, { city, budget: maxPrice });
        }

        let hostels = [];
        let extra = null;
        let reply = parsed.reply;

        if (parsed.intent === 'findHostel' && city) {
            hostels = await this.searchHostels(city, maxPrice, 5);
            reply = hostels.length
                ? `${parsed.reply} I found ${hostels.length} option${hostels.length === 1 ? '' : 's'} in ${city}.`
                : `${parsed.reply} I couldn't find any listed hostels in ${city} right now.`;
        } else if (parsed.intent === 'budget' && city) {
            try {
                extra = await BudgetAI.getRecommendations(city, parsed.days || 3, 'mid-range');
            } catch (error) {
                console.error('Chatbot budget lookup failed:', error.message);
            }
        } else if (parsed.intent === 'weather' && city) {
            try {
                const forecast = await WeatherService.getForecast(city, 3);
                extra = { current: forecast.current, location: forecast.location };
            } catch (error) {
                console.error('Chatbot weather lookup failed:', error.message);
            }
        }

        await this.saveMessage(userId, 'assistant', reply);

        return { intent: parsed.intent, reply, city, hostels, extra };
    }
}

module.exports = ChatbotAI;
