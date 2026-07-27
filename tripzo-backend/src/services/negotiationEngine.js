// Rule-based offer evaluator. No external API — a hostel's configured
// thresholds decide whether an offer is auto-accepted, auto-countered,
// or left for the owner to handle manually.

const DEFAULTS = {
    AUTO_ACCEPT_THRESHOLD: 90,
    AUTO_COUNTER_THRESHOLD: 75,
    COUNTER_OFFER_PERCENTAGE: 85,
    MIN_OFFER_PERCENTAGE: 30,
};

function evaluateOffer(systemPrice, offeredPrice, rules = {}) {
    if (!systemPrice || systemPrice <= 0) {
        return { status: 'rejected', counterOffer: null, reason: 'Invalid system price' };
    }
    if (!offeredPrice || offeredPrice <= 0) {
        return { status: 'rejected', counterOffer: null, reason: 'Invalid offer amount' };
    }

    const autoNegotiationEnabled = rules.auto_negotiation_enabled ?? true;
    const autoAcceptThreshold = rules.auto_accept_threshold ?? DEFAULTS.AUTO_ACCEPT_THRESHOLD;
    const autoCounterThreshold = rules.auto_counter_threshold ?? DEFAULTS.AUTO_COUNTER_THRESHOLD;
    const counterOfferPercentage = rules.counter_offer_percentage ?? DEFAULTS.COUNTER_OFFER_PERCENTAGE;
    const counterMinPrice = rules.counter_min_price ?? null;
    const counterMaxPrice = rules.counter_max_price ?? null;
    const manualOnly = rules.manual_only ?? false;

    const minAcceptablePrice = systemPrice * (DEFAULTS.MIN_OFFER_PERCENTAGE / 100);
    if (offeredPrice < minAcceptablePrice) {
        return { status: 'rejected', counterOffer: null, reason: 'Offer below minimum acceptable price' };
    }

    if (manualOnly || !autoNegotiationEnabled) {
        return { status: 'pending', counterOffer: null };
    }

    const percentage = (offeredPrice / systemPrice) * 100;

    if (percentage >= autoAcceptThreshold) {
        return { status: 'accepted', counterOffer: null };
    }

    if (percentage >= autoCounterThreshold) {
        let counter = Math.round(systemPrice * (counterOfferPercentage / 100));
        if (counterMinPrice !== null) counter = Math.max(counter, Number(counterMinPrice));
        if (counterMaxPrice !== null) counter = Math.min(counter, Number(counterMaxPrice));
        return { status: 'counter', counterOffer: counter };
    }

    return { status: 'rejected', counterOffer: null, reason: 'Offer too far below asking price' };
}

module.exports = { evaluateOffer, DEFAULTS };
