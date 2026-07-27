// Keyword-based sentiment scorer (English + Roman Urdu). No external API —
// deterministic and fast, safe to run synchronously on every review.

const POSITIVE_WORDS = [
    // English
    'excellent', 'amazing', 'great', 'good', 'wonderful', 'fantastic', 'perfect', 'best',
    'clean', 'comfortable', 'friendly', 'helpful', 'nice', 'beautiful', 'awesome', 'love',
    'recommend', 'outstanding', 'superb', 'brilliant', 'pleasant', 'enjoy', 'enjoyed',
    'satisfied', 'happy', 'worth', 'value', 'spacious', 'quiet', 'peaceful', 'cozy',
    // Roman Urdu
    'acha', 'accha', 'bahut acha', 'bohot acha', 'zabardast', 'kamaal', 'shandar',
    'behtareen', 'mast', 'khubsoorat', 'saaf', 'aram', 'pasand', 'mushkoor', 'khush',
    'shukriya', 'mazedaar', 'lajawab', 'badhiya', 'umda', 'khoob', 'dilchasp',
];

const NEGATIVE_WORDS = [
    // English
    'bad', 'terrible', 'horrible', 'awful', 'worst', 'dirty', 'noisy', 'expensive',
    'uncomfortable', 'rude', 'unfriendly', 'disappointing', 'poor', 'broken', 'smelly',
    'small', 'cramped', 'dark', 'cold', 'hot', 'bugs', 'insects', 'cockroach', 'rat',
    'leak', 'waste', 'avoid', 'never', 'regret', 'disgusting', 'pathetic',
    // Roman Urdu
    'bura', 'ganda', 'kharab', 'bekar', 'faltu', 'bakwaas', 'barbaad', 'galat',
    'mushkil', 'problem', 'naraaz', 'pareshan', 'dukhi', 'afsos', 'nikamma',
    'bekaar', 'ghatia', 'sasta nahi', 'waqt barbaad', 'dobara nahi', 'form nahi',
];

const INTENSIFIERS = ['very', 'bohot', 'bahut', 'too', 'extremely', 'so', 'quite', 'zyada', 'ziyadah', 'itna'];
const NEGATORS = ['not', 'no', 'never', 'nahi', 'nahin', 'na', 'mat', 'bhi', 'bilkul'];

function analyzeSentiment(text) {
    if (!text || text.trim().length < 3) {
        return { label: 'Neutral', emoji: '😐', score: 50, confidence: 0, keyPhrases: [], posScore: 0, negScore: 0 };
    }

    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);

    let posScore = 0;
    let negScore = 0;
    const keyPhrases = [];

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const prev = i > 0 ? words[i - 1] : '';

        const isNegated = NEGATORS.includes(prev);
        const isIntensified = INTENSIFIERS.includes(prev);
        const multiplier = isIntensified ? 1.5 : 1.0;

        if (POSITIVE_WORDS.includes(word)) {
            if (isNegated) {
                negScore += 1.5 * multiplier;
                keyPhrases.push({ word: `${prev} ${word}`, sentiment: 'negative' });
            } else {
                posScore += 1.5 * multiplier;
                keyPhrases.push({ word, sentiment: 'positive' });
            }
        } else if (NEGATIVE_WORDS.includes(word)) {
            if (isNegated) {
                posScore += 1.0 * multiplier;
                keyPhrases.push({ word: `${prev} ${word}`, sentiment: 'positive' });
            } else {
                negScore += 1.5 * multiplier;
                keyPhrases.push({ word, sentiment: 'negative' });
            }
        }

        const nextWord = i + 1 < words.length ? words[i + 1] : '';
        const bigram = `${word} ${nextWord}`.trim();
        if (POSITIVE_WORDS.includes(bigram)) {
            posScore += 2;
            keyPhrases.push({ word: bigram, sentiment: 'positive' });
        }
        if (NEGATIVE_WORDS.includes(bigram)) {
            negScore += 2;
            keyPhrases.push({ word: bigram, sentiment: 'negative' });
        }
    }

    const total = posScore + negScore;
    let label, score, confidence;

    if (total === 0) {
        label = 'Neutral';
        score = 50;
        confidence = 30;
    } else {
        const posRatio = posScore / total;
        if (posRatio >= 0.65) {
            label = 'Positive';
            score = Math.min(95, Math.round(50 + posRatio * 50));
            confidence = Math.min(95, Math.round(posRatio * 100));
        } else if (posRatio <= 0.35) {
            label = 'Negative';
            score = Math.max(5, Math.round(50 - (1 - posRatio) * 50));
            confidence = Math.min(95, Math.round((1 - posRatio) * 100));
        } else {
            label = 'Neutral';
            score = Math.round(50 + (posRatio - 0.5) * 30);
            confidence = Math.round(Math.abs(posRatio - 0.5) * 200);
        }
    }

    const emoji = label === 'Positive' ? '😊' : label === 'Negative' ? '😞' : '😐';

    return {
        label,
        emoji,
        score,
        confidence,
        keyPhrases: keyPhrases.slice(0, 5),
        posScore: Math.round(posScore * 10) / 10,
        negScore: Math.round(negScore * 10) / 10,
    };
}

module.exports = { analyzeSentiment };
