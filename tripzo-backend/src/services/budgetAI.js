const pool = require('../config/database');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

class BudgetAI {
    static async getRecommendations(destination, durationDays, budgetType = 'mid-range') {
        try {
            // Check cache
            const cacheQuery = `
                SELECT * FROM budget_recommendations 
                WHERE destination = ? AND duration_days = ? AND budget_type = ?
                ORDER BY created_at DESC LIMIT 1
            `;
            const [cached] = await pool.execute(cacheQuery, [destination, durationDays, budgetType]);

            if (cached.length > 0) {
                const cacheDate = new Date(cached[0].created_at);
                const now = new Date();
                const daysDiff = (now - cacheDate) / (1000 * 60 * 60 * 24);
                if (daysDiff < 7) {
                    return JSON.parse(cached[0].recommendations);
                }
            }

            // Use Gemini API
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{
                            text: `Generate a detailed budget breakdown for a ${durationDays}-day trip to ${destination} with ${budgetType} budget. 
                                    Include:
                                    1. Accommodation per night
                                    2. Food per day
                                    3. Transportation
                                    4. Activities
                                    5. Total estimated budget
                                    6. Cost-saving tips
                                    Format as JSON.`
                        }]
                    }]
                }
            );

            let recommendations;
            try {
                const text = response.data.candidates[0].content.parts[0].text;
                recommendations = JSON.parse(text);
            } catch {
                recommendations = this.getFallbackRecommendations(destination, durationDays, budgetType);
            }

            // Cache
            const insertQuery = `
                INSERT INTO budget_recommendations 
                (user_id, destination, duration_days, budget_type, recommendations)
                VALUES (?, ?, ?, ?, ?)
            `;
            await pool.execute(insertQuery, [
                1, // system user
                destination,
                durationDays,
                budgetType,
                JSON.stringify(recommendations)
            ]);

            return recommendations;
        } catch (error) {
            console.error('AI Budget error:', error);
            return this.getFallbackRecommendations(destination, durationDays, budgetType);
        }
    }

    static getFallbackRecommendations(destination, durationDays, budgetType) {
        const baseCosts = {
            budget: { accommodation: 2000, food: 800, transport: 500, activities: 300 },
            'mid-range': { accommodation: 5000, food: 1500, transport: 1000, activities: 800 },
            luxury: { accommodation: 12000, food: 4000, transport: 2500, activities: 2000 }
        };

        const costs = baseCosts[budgetType] || baseCosts['mid-range'];
        const total = (costs.accommodation + costs.food + costs.transport + costs.activities) * durationDays;

        return {
            destination,
            duration_days: durationDays,
            budget_type: budgetType,
            breakdown: costs,
            total_estimated: total,
            currency: 'PKR',
            tips: [
                'Book accommodations in advance for better rates',
                'Consider staying slightly outside the city center',
                'Use local transportation options',
                'Look for combo deals on activities'
            ]
        };
    }
}

module.exports = BudgetAI;