// Logger version - logs OTP to console instead of sending emails
const sendEmail = async ({ to, subject, html, text }) => {
    console.log('\n📧 ===== EMAIL (DEV MODE) =====');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`\nContent:\n${html || text}`);
    console.log('==============================\n');
    
    return { messageId: `dev-${Date.now()}` };
};

module.exports = { sendEmail };