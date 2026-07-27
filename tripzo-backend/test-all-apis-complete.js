const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let userToken = '';
let ownerToken = '';
let hostelId = '';
let bookingId = '';
let reviewId = '';
let ownerUserId = '';
let travelerUserId = '';
let roomTypeId = '';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function logSuccess(message) {
    console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
    console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
    console.log(`${colors.blue}📝 ${message}${colors.reset}`);
}

function logTest(message) {
    console.log(`\n${colors.cyan}🧪 ${message}${colors.reset}`);
    console.log('─'.repeat(60));
}

function logWarning(message) {
    console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logHeader(message) {
    console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.magenta}${message}${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
}

// Helper to create dummy file
function createDummyFile() {
    const filePath = path.join(__dirname, 'test-dummy.jpg');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'dummy image content');
    }
    return filePath;
}

// Helper to sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// PHASE 1: AUTHENTICATION APIS
// ============================================

async function testHealthCheck() {
    logTest('1. Health Check');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        if (response.data.success) {
            logSuccess('Health check passed');
            console.log('  Message:', response.data.message);
            return true;
        }
        return false;
    } catch (error) {
        logError('Health check failed: ' + error.message);
        return false;
    }
}

async function testRegisterTraveler() {
    logTest('2. Register Traveler');
    try {
        const timestamp = Date.now();
        const userData = {
            full_name: 'Test Traveler',
            email: `traveler_${timestamp}@example.com`,
            phone: '+923001234567',
            password: 'Test123!',
            date_of_birth: '1990-01-01',
            preferred_language: 'en'
        };

        const response = await axios.post(`${BASE_URL}/auth/register`, userData);
        if (response.data.success) {
            logSuccess('Traveler registered successfully');
            console.log('  User ID:', response.data.userId);
            console.log('  Email:', userData.email);
            console.log('  OTP:', response.data.otp || 'Check server console');
            travelerUserId = response.data.userId;
            return { success: true, data: response.data, userData };
        }
        return { success: false };
    } catch (error) {
        logError('Registration failed: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testRegisterOwner() {
    logTest('3. Register Hostel Owner');
    try {
        const timestamp = Date.now();
        const formData = new FormData();
        
        formData.append('full_name', 'Test Owner');
        formData.append('email', `owner_${timestamp}@example.com`);
        formData.append('phone', '+923001234568');
        formData.append('password', 'Owner123!');
        formData.append('date_of_birth', '1990-01-01');
        formData.append('cnic_number', '42201-1234567-8');
        formData.append('business_reg_number', 'BR-2024-001');
        formData.append('bank_name', 'Meezan Bank');
        formData.append('account_title', 'Test Owner');
        formData.append('account_number', '1234567890');
        formData.append('iban', 'PK36MEZN1234567890');
        
        // Create dummy files
        const dummyFile = createDummyFile();
        formData.append('cnic_front', fs.createReadStream(dummyFile));
        formData.append('cnic_back', fs.createReadStream(dummyFile));
        formData.append('business_license', fs.createReadStream(dummyFile));
        formData.append('bank_letter', fs.createReadStream(dummyFile));

        const response = await axios.post(`${BASE_URL}/auth/register-owner`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        if (response.data.success) {
            logSuccess('Owner registered successfully');
            console.log('  User ID:', response.data.data.userId);
            console.log('  Email:', response.data.data.email);
            console.log('  Pending Approval:', response.data.data.pendingApproval);
            console.log('  OTP:', response.data.data.otp || 'Check server console');
            ownerUserId = response.data.data.userId;
            return { success: true, data: response.data };
        }
        return { success: false };
    } catch (error) {
        logError('Owner registration failed: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testLogin(email, password, role = 'user') {
    logTest(`4. Login as ${role}`);
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password
        });

        if (response.data.success) {
            logSuccess(`${role} logged in successfully`);
            console.log('  User:', response.data.user.full_name);
            console.log('  Role:', response.data.user.role);
            return { success: true, token: response.data.token, user: response.data.user };
        }
        return { success: false };
    } catch (error) {
        logError(`${role} login failed: ` + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testAdminLogin() {
    logTest('5. Admin Login');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@tripzo.com',
            password: 'Admin@123'
        });

        if (response.data.success) {
            logSuccess('Admin logged in successfully');
            adminToken = response.data.token;
            console.log('  Admin:', response.data.user.full_name);
            return { success: true, token: response.data.token };
        }
        return { success: false };
    } catch (error) {
        logError('Admin login failed: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

// ============================================
// PHASE 2: ADMIN APIS
// ============================================

async function testAdminStats() {
    logTest('6. Get Admin Stats');
    try {
        const response = await axios.get(`${BASE_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.data.success) {
            logSuccess('Admin stats fetched');
            console.log('  Total Users:', response.data.data.stats.totalUsers);
            console.log('  Total Hostels:', response.data.data.stats.totalHostels);
            console.log('  Pending Approvals:', response.data.data.stats.pendingApprovals);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get admin stats: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testPendingApprovals() {
    logTest('7. Get Pending Approvals');
    try {
        const response = await axios.get(`${BASE_URL}/admin/pending-approvals`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.data.success) {
            logSuccess(`Found ${response.data.count} pending approvals`);
            if (response.data.data && response.data.data.length > 0) {
                console.log('  Pending Owners:', response.data.data.map(o => o.full_name).join(', '));
            }
            return { success: true, data: response.data };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get pending approvals: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testApproveOwner() {
    logTest('8. Approve Owner');
    try {
        if (!ownerUserId) {
            logWarning('No owner user ID available');
            return { success: false };
        }

        const response = await axios.put(`${BASE_URL}/admin/approve-owner/${ownerUserId}`, {}, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.data.success) {
            logSuccess(`Owner ${ownerUserId} approved successfully`);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to approve owner: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testGetAllUsers() {
    logTest('9. Get All Users');
    try {
        const response = await axios.get(`${BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.data.success) {
            logSuccess(`Found ${response.data.count} total users`);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get users: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

// ============================================
// PHASE 3: HOSTEL APIS
// ============================================

async function testCreateHostel() {
    logTest('10. Create Hostel');
    try {
        if (!ownerToken) {
            logWarning('No owner token available');
            return { success: false };
        }

        const formData = new FormData();
        formData.append('name', 'Hunza Valley View Hostel');
        formData.append('property_type', 'hostel');
        formData.append('description', 'A beautiful hostel with stunning mountain views');
        formData.append('address', 'Karimabad Road, Near Central Park');
        formData.append('city', 'Hunza');
        formData.append('state', 'Gilgit-Baltistan');
        formData.append('country', 'Pakistan');
        formData.append('latitude', '36.3167');
        formData.append('longitude', '74.6500');
        formData.append('total_rooms', '15');
        formData.append('check_in_time', '14:00:00');
        formData.append('check_out_time', '12:00:00');
        formData.append('cancellation_policy', 'moderate');
        formData.append('min_stay_days', '1');
        formData.append('amenities', JSON.stringify(['wifi', 'breakfast', 'parking', 'mountain_view']));

        // Add dummy photos
        const dummyFile = createDummyFile();
        for (let i = 0; i < 3; i++) {
            formData.append('photos', fs.createReadStream(dummyFile));
        }

        const response = await axios.post(`${BASE_URL}/hostels`, formData, {
            headers: {
                'Authorization': `Bearer ${ownerToken}`,
                ...formData.getHeaders()
            }
        });

        if (response.data.success) {
            logSuccess('Hostel created successfully');
            hostelId = response.data.data.hostelId;
            console.log('  Hostel ID:', hostelId);
            return { success: true, hostelId: response.data.data.hostelId };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to create hostel: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testGetAllHostels() {
    logTest('11. Get All Hostels (Public)');
    try {
        const response = await axios.get(`${BASE_URL}/hostels`);

        if (response.data.success) {
            logSuccess(`Found ${response.data.count} hostels`);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get hostels: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testGetSingleHostel() {
    logTest('12. Get Single Hostel');
    try {
        if (!hostelId) {
            logWarning('No hostel ID available');
            return { success: false };
        }

        const response = await axios.get(`${BASE_URL}/hostels/${hostelId}`);

        if (response.data.success) {
            logSuccess('Hostel details fetched');
            console.log('  Name:', response.data.data.name);
            console.log('  City:', response.data.data.city);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get hostel: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testGetOwnerHostels() {
    logTest('13. Get Owner\'s Hostels');
    try {
        if (!ownerToken) {
            logWarning('No owner token available');
            return { success: false };
        }

        const response = await axios.get(`${BASE_URL}/hostels/owner/hostels`, {
            headers: { 'Authorization': `Bearer ${ownerToken}` }
        });

        if (response.data.success) {
            logSuccess(`Found ${response.data.count} hostels for owner`);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get owner hostels: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testUpdateHostel() {
    logTest('14. Update Hostel');
    try {
        if (!ownerToken || !hostelId) {
            logWarning('Missing owner token or hostel ID');
            return { success: false };
        }

        const response = await axios.put(`${BASE_URL}/hostels/${hostelId}`, {
            name: 'Updated Mountain View Hostel',
            description: 'Updated description with better amenities',
            total_rooms: 20
        }, {
            headers: {
                'Authorization': `Bearer ${ownerToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            logSuccess('Hostel updated successfully');
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to update hostel: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testAddRoomType() {
    logTest('15. Add Room Type');
    try {
        if (!ownerToken || !hostelId) {
            logWarning('Missing owner token or hostel ID');
            return { success: false };
        }

        const response = await axios.post(`${BASE_URL}/hostels/${hostelId}/rooms`, {
            name: 'Private Room with Mountain View',
            description: 'Spacious private room with balcony and mountain view',
            capacity: 2,
            price_per_night: 3500,
            total_rooms: 5,
            amenities: JSON.stringify(['tv', 'attached_bathroom', 'balcony', 'heater'])
        }, {
            headers: {
                'Authorization': `Bearer ${ownerToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            logSuccess('Room type added successfully');
            roomTypeId = response.data.data.roomTypeId;
            console.log('  Room Type ID:', roomTypeId);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to add room type: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testGetRoomTypes() {
    logTest('16. Get Room Types');
    try {
        if (!hostelId) {
            logWarning('No hostel ID available');
            return { success: false };
        }

        const response = await axios.get(`${BASE_URL}/hostels/${hostelId}/rooms`);

        if (response.data.success) {
            logSuccess(`Found ${response.data.data?.length || 0} room types`);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get room types: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testFilterHostels() {
    logTest('17. Filter Hostels by City');
    try {
        const response = await axios.get(`${BASE_URL}/hostels?city=Hunza&limit=5`);

        if (response.data.success) {
            logSuccess(`Found ${response.data.count} hostels in Hunza`);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to filter hostels: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

// ============================================
// PHASE 4: BOOKING APIS
// ============================================

async function testCreateBooking() {
    logTest('18. Create Booking');
    try {
        if (!userToken || !hostelId) {
            logWarning('Missing user token or hostel ID');
            return { success: false };
        }

        // First get room type ID
        const roomTypesRes = await axios.get(`${BASE_URL}/hostels/${hostelId}/rooms`);
        const roomTypeId = roomTypesRes.data.data?.[0]?.id || 1;

        const response = await axios.post(`${BASE_URL}/bookings`, {
            hostel_id: hostelId,
            room_type_id: roomTypeId,
            check_in_date: '2024-02-01',
            check_out_date: '2024-02-05',
            total_guests: 2,
            special_requests: 'Early check-in requested'
        }, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            logSuccess('Booking created successfully');
            bookingId = response.data.data.booking_id;
            console.log('  Booking ID:', bookingId);
            console.log('  Booking Number:', response.data.data.booking_number);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to create booking: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testGetMyBookings() {
    logTest('19. Get My Bookings');
    try {
        if (!userToken) {
            logWarning('No user token available');
            return { success: false };
        }

        const response = await axios.get(`${BASE_URL}/bookings/my-bookings`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        if (response.data.success) {
            logSuccess(`Found ${response.data.count || 0} bookings`);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get bookings: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testGetHostelBookings() {
    logTest('20. Get Hostel Bookings');
    try {
        if (!ownerToken || !hostelId) {
            logWarning('Missing owner token or hostel ID');
            return { success: false };
        }

        const response = await axios.get(`${BASE_URL}/bookings/hostel/${hostelId}`, {
            headers: { 'Authorization': `Bearer ${ownerToken}` }
        });

        if (response.data.success) {
            logSuccess(`Found ${response.data.count || 0} bookings for hostel`);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get hostel bookings: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testUpdateBookingStatus() {
    logTest('21. Update Booking Status');
    try {
        if (!ownerToken || !bookingId) {
            logWarning('Missing owner token or booking ID');
            return { success: false };
        }

        const response = await axios.put(`${BASE_URL}/bookings/${bookingId}/status`, {
            status: 'confirmed'
        }, {
            headers: {
                'Authorization': `Bearer ${ownerToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            logSuccess('Booking status updated to confirmed');
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to update booking status: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

// ============================================
// PHASE 5: REVIEW APIS
// ============================================

async function testAddReview() {
    logTest('22. Add Review');
    try {
        if (!userToken || !hostelId || !bookingId) {
            logWarning('Missing required data');
            return { success: false };
        }

        const response = await axios.post(`${BASE_URL}/reviews`, {
            booking_id: bookingId,
            hostel_id: hostelId,
            rating: 5,
            comment: 'Amazing hostel with beautiful views! Highly recommended.'
        }, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            logSuccess('Review added successfully');
            reviewId = response.data.data.review_id;
            console.log('  Review ID:', reviewId);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to add review: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testGetHostelReviews() {
    logTest('23. Get Hostel Reviews');
    try {
        if (!hostelId) {
            logWarning('No hostel ID available');
            return { success: false };
        }

        const response = await axios.get(`${BASE_URL}/reviews/hostel/${hostelId}`);

        if (response.data.success) {
            logSuccess(`Found ${response.data.count || 0} reviews`);
            if (response.data.rating_avg) {
                console.log('  Average Rating:', response.data.rating_avg);
            }
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get reviews: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testUpdateReview() {
    logTest('24. Update Review');
    try {
        if (!userToken || !reviewId) {
            logWarning('Missing user token or review ID');
            return { success: false };
        }

        const response = await axios.put(`${BASE_URL}/reviews/${reviewId}`, {
            rating: 4,
            comment: 'Updated review comment - still a great place!'
        }, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            logSuccess('Review updated successfully');
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to update review: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

// ============================================
// PHASE 6: ADDITIONAL TESTS
// ============================================

async function testGetCurrentUser() {
    logTest('25. Get Current User');
    try {
        if (!userToken) {
            logWarning('No user token available');
            return { success: false };
        }

        const response = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        if (response.data.success) {
            logSuccess('User profile fetched');
            console.log('  Name:', response.data.user.full_name);
            console.log('  Email:', response.data.user.email);
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        logError('Failed to get user: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

async function testResendOTP() {
    logTest('26. Resend OTP');
    try {
        const response = await axios.post(`${BASE_URL}/auth/resend-otp`, {
            email: 'traveler_123@example.com'
        });

        if (response.data.success) {
            logSuccess('OTP resent successfully');
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        // This might fail if email doesn't exist, which is fine
        logWarning('Resend OTP test: ' + (error.response?.data?.message || error.message));
        return { success: false };
    }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
    console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.yellow}🚀 TRIPZO API COMPLETE TEST SUITE${colors.reset}`);
    console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);

    const results = [];
    let travelerEmail = '';
    let travelerPassword = 'Test123!';
    let ownerEmail = '';
    let ownerPassword = 'Owner123!';

    // ============================================
    // PHASE 1: AUTHENTICATION
    // ============================================
    logHeader('PHASE 1: AUTHENTICATION APIS');

    // 1. Health Check
    const healthResult = await testHealthCheck();
    results.push({ test: 'Health Check', passed: healthResult });

    // 2. Register Traveler
    const travelerResult = await testRegisterTraveler();
    results.push({ test: 'Register Traveler', passed: travelerResult.success });
    if (travelerResult.success) {
        travelerEmail = travelerResult.userData.email;
        logWarning('Please check server console for OTP and verify manually if needed');
    }

    // 3. Register Owner
    const ownerRegResult = await testRegisterOwner();
    results.push({ test: 'Register Owner', passed: ownerRegResult.success });
    if (ownerRegResult.success) {
        ownerEmail = ownerRegResult.data.data.email;
        logWarning('Please check server console for OTP and verify manually if needed');
    }

    // 4. Admin Login
    const adminLoginResult = await testAdminLogin();
    results.push({ test: 'Admin Login', passed: adminLoginResult.success });

    if (adminLoginResult.success) {
        // 5. Admin Stats
        const statsResult = await testAdminStats();
        results.push({ test: 'Admin Stats', passed: statsResult.success });

        // 6. Pending Approvals
        const pendingResult = await testPendingApprovals();
        results.push({ test: 'Pending Approvals', passed: pendingResult.success });

        // 7. Approve Owner
        const approveResult = await testApproveOwner();
        results.push({ test: 'Approve Owner', passed: approveResult.success });

        // 8. Get All Users
        const usersResult = await testGetAllUsers();
        results.push({ test: 'Get All Users', passed: usersResult.success });
    }

    // 9. Login as Owner (after approval)
    if (ownerEmail) {
        const ownerLoginResult = await testLogin(ownerEmail, ownerPassword, 'Owner');
        results.push({ test: 'Owner Login', passed: ownerLoginResult.success });
        if (ownerLoginResult.success) {
            ownerToken = ownerLoginResult.token;
        }
    }

    // 10. Login as Traveler
    if (travelerEmail) {
        const travelerLoginResult = await testLogin(travelerEmail, travelerPassword, 'Traveler');
        results.push({ test: 'Traveler Login', passed: travelerLoginResult.success });
        if (travelerLoginResult.success) {
            userToken = travelerLoginResult.token;
        }
    }

    // ============================================
    // PHASE 2: HOSTEL APIS
    // ============================================
    logHeader('PHASE 2: HOSTEL APIS');

    // 11. Create Hostel
    const createHostelResult = await testCreateHostel();
    results.push({ test: 'Create Hostel', passed: createHostelResult.success });

    // 12. Get All Hostels
    const getAllHostelsResult = await testGetAllHostels();
    results.push({ test: 'Get All Hostels', passed: getAllHostelsResult.success });

    // 13. Get Single Hostel
    const getHostelResult = await testGetSingleHostel();
    results.push({ test: 'Get Single Hostel', passed: getHostelResult.success });

    // 14. Get Owner's Hostels
    const getOwnerHostelsResult = await testGetOwnerHostels();
    results.push({ test: 'Get Owner Hostels', passed: getOwnerHostelsResult.success });

    // 15. Update Hostel
    const updateHostelResult = await testUpdateHostel();
    results.push({ test: 'Update Hostel', passed: updateHostelResult.success });

    // 16. Add Room Type
    const addRoomResult = await testAddRoomType();
    results.push({ test: 'Add Room Type', passed: addRoomResult.success });

    // 17. Get Room Types
    const getRoomsResult = await testGetRoomTypes();
    results.push({ test: 'Get Room Types', passed: getRoomsResult.success });

    // 18. Filter Hostels
    const filterResult = await testFilterHostels();
    results.push({ test: 'Filter Hostels', passed: filterResult.success });

    // ============================================
    // PHASE 3: BOOKING APIS
    // ============================================
    logHeader('PHASE 3: BOOKING APIS');

    // 19. Create Booking
    const createBookingResult = await testCreateBooking();
    results.push({ test: 'Create Booking', passed: createBookingResult.success });

    // 20. Get My Bookings
    const getMyBookingsResult = await testGetMyBookings();
    results.push({ test: 'Get My Bookings', passed: getMyBookingsResult.success });

    // 21. Get Hostel Bookings
    const getHostelBookingsResult = await testGetHostelBookings();
    results.push({ test: 'Get Hostel Bookings', passed: getHostelBookingsResult.success });

    // 22. Update Booking Status
    const updateStatusResult = await testUpdateBookingStatus();
    results.push({ test: 'Update Booking Status', passed: updateStatusResult.success });

    // ============================================
    // PHASE 4: REVIEW APIS
    // ============================================
    logHeader('PHASE 4: REVIEW APIS');

    // 23. Add Review
    const addReviewResult = await testAddReview();
    results.push({ test: 'Add Review', passed: addReviewResult.success });

    // 24. Get Hostel Reviews
    const getReviewsResult = await testGetHostelReviews();
    results.push({ test: 'Get Hostel Reviews', passed: getReviewsResult.success });

    // 25. Update Review
    const updateReviewResult = await testUpdateReview();
    results.push({ test: 'Update Review', passed: updateReviewResult.success });

    // ============================================
    // PHASE 5: ADDITIONAL TESTS
    // ============================================
    logHeader('PHASE 5: ADDITIONAL TESTS');

    // 26. Get Current User
    const getMeResult = await testGetCurrentUser();
    results.push({ test: 'Get Current User', passed: getMeResult.success });

    // 27. Resend OTP
    const resendResult = await testResendOTP();
    results.push({ test: 'Resend OTP', passed: resendResult.success });

    // ============================================
    // SUMMARY
    // ============================================
    console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.yellow}📊 TEST SUMMARY${colors.reset}`);
    console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}\n`);

    const total = results.length;
    const passed = results.filter(r => r.passed === true).length;
    const failed = results.filter(r => r.passed === false).length;

    results.forEach(r => {
        const status = r.passed ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
        console.log(`${status}  ${r.test}`);
    });

    console.log(`\n${colors.yellow}${'─'.repeat(60)}${colors.reset}`);
    console.log(`Total Tests: ${total}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}\n`);

    if (failed === 0) {
        console.log(`${colors.green}🎉 All tests passed! Your API is working perfectly.${colors.reset}`);
    } else {
        console.log(`${colors.yellow}⚠️  Some tests failed. Please check the errors above.${colors.reset}`);
        console.log(`${colors.yellow}💡 Make sure your server is running and database is connected.${colors.reset}`);
        console.log(`${colors.yellow}💡 Check the server console for OTPs and verify manually.${colors.reset}`);
    }

    // Clean up dummy file
    try {
        const dummyPath = path.join(__dirname, 'test-dummy.jpg');
        if (fs.existsSync(dummyPath)) {
            fs.unlinkSync(dummyPath);
        }
    } catch (e) {
        // Ignore
    }
}

// Run the tests
console.log(`\n${colors.yellow}Starting API tests...${colors.reset}`);
console.log(`${colors.yellow}Make sure your server is running: npm run dev${colors.reset}\n`);

runAllTests().catch(error => {
    console.error('Fatal error:', error);
});