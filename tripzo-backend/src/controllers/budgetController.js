const BudgetAI = require('../services/budgetAI');

// Get budget recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const { destination, duration_days, budget_type = 'mid-range' } = req.query;

        if (!destination || !duration_days) {
            return res.status(400).json({
                success: false,
                message: 'Destination and duration are required'
            });
        }

        const recommendations = await BudgetAI.getRecommendations(
            destination,
            parseInt(duration_days),
            budget_type
        );

        res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error('Get budget recommendations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Save budget preference
exports.saveBudgetPreference = async (req, res) => {
    try {
        const { destination, duration_days, budget_type, recommendations } = req.body;

        const query = `
            INSERT INTO budget_recommendations 
            (user_id, destination, duration_days, budget_type, recommendations)
            VALUES (?, ?, ?, ?, ?)
        `;
        const pool = require('../config/database');
        await pool.execute(query, [
            req.userId,
            destination,
            duration_days,
            budget_type,
            JSON.stringify(recommendations)
        ]);

        res.json({ success: true, message: 'Budget saved' });
    } catch (error) {
        console.error('Save budget error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};