const pool = require('../config/database');
const { analyzeSentiment } = require('../services/sentimentAnalysis');

class Review {
    // Create review
    static async create(reviewData) {
        try {
            console.log('📝 Creating review with data:', reviewData);

            const {
                booking_id,
                user_id,
                hostel_id,
                rating,
                comment
            } = reviewData;

            const sentiment = analyzeSentiment(comment);

            const query = `
                INSERT INTO reviews
                (booking_id, user_id, hostel_id, rating, comment, sentiment_label, sentiment_score, sentiment_confidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                booking_id,
                user_id,
                hostel_id,
                rating,
                comment || null,
                sentiment.label,
                sentiment.score,
                sentiment.confidence
            ];

            console.log('📤 Executing query with values:', values);
            
            const [result] = await pool.execute(query, values);
            console.log('✅ Review inserted, ID:', result.insertId);

            // Update hostel rating
            await this.updateHostelRating(hostel_id);

            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating review:', error);
            console.error('SQL Error:', error.sqlMessage);
            throw error;
        }
    }

    // Get review by ID
    static async findById(id) {
        try {
            const query = `
                SELECT r.*, 
                       u.full_name as user_name,
                       u.profile_photo as user_photo,
                       h.name as hostel_name
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN hostels h ON r.hostel_id = h.id
                WHERE r.id = ?
            `;
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding review:', error);
            throw error;
        }
    }

    // Get reviews by hostel
    static async findByHostel(hostelId) {
        try {
            const query = `
                SELECT r.*, 
                       u.full_name as user_name,
                       u.profile_photo as user_photo
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.hostel_id = ?
                ORDER BY r.created_at DESC
            `;
            const [rows] = await pool.execute(query, [hostelId]);
            return rows;
        } catch (error) {
            console.error('Error finding reviews by hostel:', error);
            return [];
        }
    }

    // Get reviews by user
    static async findByUser(userId) {
        try {
            const query = `
                SELECT r.*, 
                       h.name as hostel_name
                FROM reviews r
                LEFT JOIN hostels h ON r.hostel_id = h.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
            `;
            const [rows] = await pool.execute(query, [userId]);
            return rows;
        } catch (error) {
            console.error('Error finding reviews by user:', error);
            return [];
        }
    }

    // Update review
    static async update(id, data) {
        try {
            if (data.comment !== undefined) {
                const sentiment = analyzeSentiment(data.comment);
                data.sentiment_label = sentiment.label;
                data.sentiment_score = sentiment.score;
                data.sentiment_confidence = sentiment.confidence;
            }

            const fields = [];
            const values = [];

            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    fields.push(`${key} = ?`);
                    values.push(data[key]);
                }
            });

            if (fields.length === 0) return null;

            values.push(id);
            const query = `UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`;
            const [result] = await pool.execute(query, values);
            
            // Update hostel rating after update
            if (data.hostel_id || data.rating) {
                const review = await this.findById(id);
                if (review) {
                    await this.updateHostelRating(review.hostel_id);
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error updating review:', error);
            throw error;
        }
    }

    // Delete review
    static async delete(id) {
        try {
            // Get hostel_id before deleting
            const review = await this.findById(id);
            const hostelId = review ? review.hostel_id : null;
            
            const query = 'DELETE FROM reviews WHERE id = ?';
            const [result] = await pool.execute(query, [id]);
            
            // Update hostel rating after deletion
            if (hostelId) {
                await this.updateHostelRating(hostelId);
            }
            
            return result;
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }

    // Update hostel average rating
    static async updateHostelRating(hostelId) {
        try {
            // Calculate average rating
            const query = `
                SELECT 
                    AVG(rating) as avg_rating,
                    COUNT(*) as total_reviews
                FROM reviews
                WHERE hostel_id = ?
            `;
            const [rows] = await pool.execute(query, [hostelId]);
            
            const avgRating = rows[0].avg_rating || 0;
            const totalReviews = rows[0].total_reviews || 0;
            
            // Update hostel
            const updateQuery = `
                UPDATE hostels 
                SET rating = ?, total_reviews = ?
                WHERE id = ?
            `;
            await pool.execute(updateQuery, [avgRating, totalReviews, hostelId]);
            
            console.log(`✅ Hostel ${hostelId} rating updated: ${avgRating} (${totalReviews} reviews)`);
        } catch (error) {
            console.error('Error updating hostel rating:', error);
            throw error;
        }
    }

    // Check if user has reviewed a booking
    static async hasReviewed(bookingId, userId) {
        try {
            const query = 'SELECT id FROM reviews WHERE booking_id = ? AND user_id = ?';
            const [rows] = await pool.execute(query, [bookingId, userId]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking review existence:', error);
            return false;
        }
    }

    // Get hostel rating stats
    static async getHostelStats(hostelId) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_reviews,
                    AVG(rating) as average_rating,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
                FROM reviews
                WHERE hostel_id = ?
            `;
            const [rows] = await pool.execute(query, [hostelId]);
            return rows[0] || {
                total_reviews: 0,
                average_rating: 0,
                rating_5: 0,
                rating_4: 0,
                rating_3: 0,
                rating_2: 0,
                rating_1: 0
            };
        } catch (error) {
            console.error('Error getting hostel stats:', error);
            return null;
        }
    }
    // Sentiment breakdown for a single hostel's reviews
    static async getHostelSentiment(hostelId) {
        try {
            const query = `
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN sentiment_label = 'Positive' THEN 1 ELSE 0 END) as positive,
                    SUM(CASE WHEN sentiment_label = 'Negative' THEN 1 ELSE 0 END) as negative,
                    SUM(CASE WHEN sentiment_label = 'Neutral' THEN 1 ELSE 0 END) as neutral,
                    AVG(sentiment_score) as avg_score
                FROM reviews
                WHERE hostel_id = ? AND sentiment_label IS NOT NULL
            `;
            const [rows] = await pool.execute(query, [hostelId]);
            const row = rows[0] || {};
            const total = Number(row.total) || 0;
            return {
                total,
                positive: Number(row.positive) || 0,
                negative: Number(row.negative) || 0,
                neutral: Number(row.neutral) || 0,
                avg_score: row.avg_score ? Math.round(Number(row.avg_score)) : null,
                positive_pct: total ? Math.round((Number(row.positive) / total) * 100) : 0,
            };
        } catch (error) {
            console.error('Error getting hostel sentiment:', error);
            return { total: 0, positive: 0, negative: 0, neutral: 0, avg_score: null, positive_pct: 0 };
        }
    }

    // Platform-wide sentiment overview (admin)
    static async getSentimentOverview() {
        try {
            const [totals] = await pool.execute(`
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN sentiment_label = 'Positive' THEN 1 ELSE 0 END) as positive,
                    SUM(CASE WHEN sentiment_label = 'Negative' THEN 1 ELSE 0 END) as negative,
                    SUM(CASE WHEN sentiment_label = 'Neutral' THEN 1 ELSE 0 END) as neutral,
                    AVG(sentiment_score) as avg_score
                FROM reviews
                WHERE sentiment_label IS NOT NULL
            `);

            const [byHostel] = await pool.execute(`
                SELECT h.id as hostel_id, h.name as hostel_name,
                    COUNT(*) as total,
                    SUM(CASE WHEN r.sentiment_label = 'Negative' THEN 1 ELSE 0 END) as negative,
                    AVG(r.sentiment_score) as avg_score
                FROM reviews r
                JOIN hostels h ON r.hostel_id = h.id
                WHERE r.sentiment_label IS NOT NULL
                GROUP BY h.id, h.name
                ORDER BY avg_score ASC
                LIMIT 5
            `);

            const row = totals[0] || {};
            const total = Number(row.total) || 0;
            return {
                total,
                positive: Number(row.positive) || 0,
                negative: Number(row.negative) || 0,
                neutral: Number(row.neutral) || 0,
                avg_score: row.avg_score ? Math.round(Number(row.avg_score)) : null,
                positive_pct: total ? Math.round((Number(row.positive) / total) * 100) : 0,
                lowest_rated_hostels: byHostel.map((h) => ({
                    ...h,
                    avg_score: h.avg_score ? Math.round(Number(h.avg_score)) : null,
                })),
            };
        } catch (error) {
            console.error('Error getting sentiment overview:', error);
            return { total: 0, positive: 0, negative: 0, neutral: 0, avg_score: null, positive_pct: 0, lowest_rated_hostels: [] };
        }
    }
}

module.exports = Review;