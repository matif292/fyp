const WaitingList = require('../models/WaitingList');
const { sendEmail } = require('../utils/email');

// Called whenever a booking frees up (cancelled) so anyone waitlisted for
// an overlapping date range on that room can be told a spot opened up.
async function notifyWaitingList(hostelId, roomTypeId, checkIn, checkOut) {
    try {
        const matches = await WaitingList.findMatching(hostelId, roomTypeId, checkIn, checkOut);
        for (const entry of matches) {
            await WaitingList.markNotified(entry.id);
            await sendEmail({
                to: entry.email,
                subject: 'A room just opened up on Tripzo!',
                html: `<p>Hi ${entry.full_name},</p><p>A room you were waitlisted for is now available for ${entry.check_in_date} → ${entry.check_out_date}. Book it before it's gone!</p>`,
            });
        }
        return matches.length;
    } catch (error) {
        console.error('❌ Waiting list notify error:', error);
        return 0;
    }
}

module.exports = { notifyWaitingList };
