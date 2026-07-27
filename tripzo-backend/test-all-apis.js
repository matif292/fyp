const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let userToken = '';
let ownerToken = '';
let hostelId = '';
let userId = '';
let ownerId = '';
let ownerEmail = '';
let ownerPassword = 'Owner123!';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
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
    console.log('─'.repeat(50));
}

// Test 1: Health Check
async function testHealthCheck() {
    logTest('Health Check');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        if (response.data.success) {
            logSuccess('Health check passed');
            console.log('  Response:', response.data);
            return true;
        }
        return false;
    } catch (error) {
        logError('Health check failed: ' + error.message);
        return false;
    }
}

// Test 2: Register Traveler
async function testRegisterTraveler() {
    logTest('Register Traveler');
    try {
        const userData = {
            full_name: 'Test Traveler',
            email: `traveler_${Date.now()}@example.com`,
            phone: '+923001234567',
            password: 'Test123!'
        };
        
        const response = await axios.post(`${BASE_URL}/auth/register`, userData);
        if (response.data.success) {
            logSuccess('Traveler registered successfully');
            console.log('  User ID:', response.data.data.userId);
            console.log('  Email:', userData.email);
            console.log(`  ${colors.yellow}⚠️  OTP: ${response.data.data.otp || 'Check server console for OTP'}${colors.reset}`);
            userId = response.data.data.userId;
            return { success: true, data: response.data, userData };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Registration failed: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 3: Verify OTP
async function testVerifyOTP(email, otp) {
    logTest('Verify OTP');
    try {
        const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
            email,
            otp: otp || '123456'
        });
        
        if (response.data.success) {
            logSuccess('OTP verified successfully');
            console.log('  Token received:', response.data.data.token.substring(0, 30) + '...');
            userToken = response.data.data.token;
            return { success: true, token: response.data.data.token };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('OTP verification failed: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 4: Login Traveler
async function testLoginTraveler(email, password) {
    logTest('Login Traveler');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password
        });
        
        if (response.data.success) {
            logSuccess('Traveler logged in successfully');
            console.log('  User:', response.data.data.user.full_name);
            console.log('  Role:', response.data.data.user.role);
            userToken = response.data.data.token;
            return { success: true, token: response.data.data.token, user: response.data.data.user };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Login failed: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 5: Register Owner
async function testRegisterOwner() {
    logTest('Register Hostel Owner');
    try {
        const formData = new FormData();
        const email = `owner_${Date.now()}@example.com`;
        ownerEmail = email;
        
        formData.append('full_name', 'Test Owner');
        formData.append('email', email);
        formData.append('phone', '+923001234568');
        formData.append('password', ownerPassword);
        formData.append('date_of_birth', '1990-01-01');
        formData.append('cnic_number', '42201-1234567-8');
        formData.append('business_reg_number', 'BR-2024-001');
        formData.append('bank_name', 'Meezan Bank');
        formData.append('account_title', 'Test Owner');
        formData.append('account_number', '1234567890');
        formData.append('iban', 'PK36MEZN1234567890');
        
        // Create dummy text files as fake images
        const dummyFile = Buffer.from('dummy content');
        formData.append('cnic_front', dummyFile, 'cnic_front.jpg');
        formData.append('cnic_back', dummyFile, 'cnic_back.jpg');
        formData.append('business_license', dummyFile, 'license.pdf');
        formData.append('bank_letter', dummyFile, 'bank_letter.pdf');

        const response = await axios.post(`${BASE_URL}/auth/register-owner`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        
        if (response.data.success) {
            logSuccess('Owner registered successfully');
            console.log('  Owner ID:', response.data.data.userId);
            console.log('  Email:', email);
            console.log('  Pending Approval:', response.data.data.pendingApproval);
            console.log(`  ${colors.yellow}⚠️  OTP: ${response.data.data.otp || 'Check server console for OTP'}${colors.reset}`);
            ownerId = response.data.data.userId;
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Owner registration failed: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 6: Admin Login
async function testAdminLogin() {
    logTest('Admin Login');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@tripzo.com',
            password: 'Admin@123'
        });
        
        if (response.data.success) {
            logSuccess('Admin logged in successfully');
            console.log('  Admin:', response.data.data.user.full_name);
            adminToken = response.data.data.token;
            return { success: true, token: response.data.data.token };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Admin login failed: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 7: Get Admin Stats
async function testAdminStats() {
    logTest('Get Admin Stats');
    try {
        const response = await axios.get(`${BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (response.data.success) {
            logSuccess('Admin stats fetched successfully');
            console.log('  Stats:', response.data.data.stats);
            return { success: true, data: response.data.data };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to get admin stats: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 8: Get Pending Approvals (Admin)
async function testPendingApprovals() {
    logTest('Get Pending Approvals');
    try {
        const response = await axios.get(`${BASE_URL}/admin/pending-approvals`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (response.data.success) {
            logSuccess(`Found ${response.data.count} pending approvals`);
            if (response.data.data && response.data.data.length > 0) {
                console.log('  Pending Owners:');
                response.data.data.forEach(owner => {
                    console.log(`    - ${owner.full_name} (${owner.email})`);
                });
            }
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to get pending approvals: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 9: Approve Owner (Admin)
async function testApproveOwner(ownerId) {
    logTest('Approve Owner');
    try {
        const response = await axios.put(`${BASE_URL}/admin/approve-owner/${ownerId}`, {}, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (response.data.success) {
            logSuccess('Owner approved successfully');
            return { success: true };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to approve owner: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 10: Login as Owner (After Approval)
async function testLoginOwner() {
    logTest('Login as Owner (After Approval)');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: ownerEmail,
            password: ownerPassword
        });
        
        if (response.data.success) {
            logSuccess('Owner logged in successfully');
            console.log('  Owner:', response.data.data.user.full_name);
            ownerToken = response.data.data.token;
            return { success: true, token: response.data.data.token };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Owner login failed: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 11: Create Hostel (Owner)
async function testCreateHostel() {
    logTest('Create Hostel');
    try {
        const formData = new FormData();
        formData.append('name', 'Test Mountain Hostel');
        formData.append('property_type', 'hostel');
        formData.append('description', 'A beautiful hostel in the mountains with amazing views');
        formData.append('address', 'Karimabad Road, Hunza');
        formData.append('city', 'Hunza');
        formData.append('state', 'Gilgit-Baltistan');
        formData.append('country', 'Pakistan');
        formData.append('latitude', '36.3167');
        formData.append('longitude', '74.6500');
        formData.append('total_rooms', '10');
        formData.append('check_in_time', '14:00:00');
        formData.append('check_out_time', '12:00:00');
        formData.append('cancellation_policy', 'moderate');
        formData.append('min_stay_days', '1');
        formData.append('amenities', JSON.stringify(['wifi', 'breakfast', 'parking']));
        
        // Add dummy photos
        const dummyPhoto = Buffer.from('dummy photo content');
        formData.append('photos', dummyPhoto, 'photo1.jpg');
        formData.append('photos', dummyPhoto, 'photo2.jpg');
        formData.append('photos', dummyPhoto, 'photo3.jpg');

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
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to create hostel: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 12: Get All Hostels (Public)
async function testGetAllHostels() {
    logTest('Get All Hostels (Public)');
    try {
        const response = await axios.get(`${BASE_URL}/hostels`);
        
        if (response.data.success) {
            logSuccess(`Found ${response.data.count} hostels`);
            if (response.data.data && response.data.data.length > 0) {
                console.log('  Hostels:');
                response.data.data.slice(0, 3).forEach(hostel => {
                    console.log(`    - ${hostel.name} (${hostel.city})`);
                });
            }
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to get hostels: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 13: Get Single Hostel (Public)
async function testGetSingleHostel(id) {
    logTest('Get Single Hostel');
    try {
        const response = await axios.get(`${BASE_URL}/hostels/${id}`);
        
        if (response.data.success) {
            logSuccess('Hostel details fetched successfully');
            console.log('  Name:', response.data.data.name);
            console.log('  City:', response.data.data.city);
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to get hostel: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 14: Add Room Type
async function testAddRoomType() {
    logTest('Add Room Type');
    try {
        const response = await axios.post(`${BASE_URL}/hostels/${hostelId}/rooms`, {
            name: 'Private Room',
            description: 'Spacious private room with mountain view',
            capacity: 2,
            price_per_night: 3000,
            total_rooms: 5,
            amenities: JSON.stringify(['tv', 'attached-bathroom', 'balcony'])
        }, {
            headers: {
                'Authorization': `Bearer ${ownerToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            logSuccess('Room type added successfully');
            console.log('  Room Type ID:', response.data.data.roomTypeId);
            return { success: true, roomTypeId: response.data.data.roomTypeId };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to add room type: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 15: Get Owner's Hostels
async function testGetOwnerHostels() {
    logTest('Get Owner\'s Hostels');
    try {
        const response = await axios.get(`${BASE_URL}/hostels/owner/hostels`, {
            headers: {
                'Authorization': `Bearer ${ownerToken}`
            }
        });
        
        if (response.data.success) {
            logSuccess(`Found ${response.data.count} hostels for this owner`);
            if (response.data.data && response.data.data.length > 0) {
                console.log('  Your Hostels:');
                response.data.data.forEach(hostel => {
                    console.log(`    - ${hostel.name} (${hostel.city})`);
                });
            }
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to get owner hostels: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 16: Update Hostel
async function testUpdateHostel() {
    logTest('Update Hostel');
    try {
        const response = await axios.put(`${BASE_URL}/hostels/${hostelId}`, {
            name: 'Updated Mountain View Hostel',
            description: 'Updated description with better amenities'
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
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to update hostel: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 17: Filter Hostels
async function testFilterHostels() {
    logTest('Filter Hostels by City');
    try {
        const response = await axios.get(`${BASE_URL}/hostels?city=Hunza&limit=5`);
        
        if (response.data.success) {
            logSuccess(`Found ${response.data.count} hostels in Hunza`);
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to filter hostels: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Test 18: Get User Profile (Protected)
async function testGetUserProfile() {
    logTest('Get User Profile');
    try {
        const response = await axios.get(`${BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        
        if (response.data.success) {
            logSuccess('User profile fetched successfully');
            console.log('  Name:', response.data.data.user.full_name);
            console.log('  Email:', response.data.data.user.email);
            console.log('  Role:', response.data.data.user.role);
            return { success: true, data: response.data };
        }
        return { success: false, error: response.data };
    } catch (error) {
        logError('Failed to get user profile: ' + (error.response?.data?.message || error.message));
        return { success: false, error: error.response?.data };
    }
}

// Main test runner
async function runAllTests() {
    console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.yellow}🚀 TRIPZO API TEST SUITE${colors.reset}`);
    console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}\n`);

    const results = [];
    let travelerEmail = '';
    let travelerPassword = 'Test123!';

    // 1. Health Check
    const healthResult = await testHealthCheck();
    results.push({ test: 'Health Check', result: healthResult });

    // 2. Register Traveler
    const registerResult = await testRegisterTraveler();
    results.push({ test: 'Register Traveler', result: registerResult.success });
    if (registerResult.success) {
        travelerEmail = registerResult.userData.email;
        console.log(`\n${colors.yellow}⚠️  IMPORTANT: Check the server console for the OTP!${colors.reset}`);
        console.log(`${colors.yellow}   The OTP is displayed where your server is running.${colors.reset}`);
        console.log(`${colors.yellow}   For demo purposes, we'll try with default OTP: 123456${colors.reset}\n`);
        
        // Try to verify with default OTP (for demo)
        await testVerifyOTP(travelerEmail, '123456');
    }

    // 3. Login Traveler (if we have credentials)
    if (registerResult.success) {
        const loginResult = await testLoginTraveler(travelerEmail, travelerPassword);
        results.push({ test: 'Login Traveler', result: loginResult.success });
    }

    // 4. Register Owner
    const ownerResult = await testRegisterOwner();
    results.push({ test: 'Register Owner', result: ownerResult.success });
    if (ownerResult.success) {
        console.log(`\n${colors.yellow}⚠️  Owner OTP is in the server console!${colors.reset}`);
    }

    // 5. Admin Login
    const adminLoginResult = await testAdminLogin();
    results.push({ test: 'Admin Login', result: adminLoginResult.success });

    if (adminLoginResult.success) {
        // 6. Admin Stats
        const statsResult = await testAdminStats();
        results.push({ test: 'Admin Stats', result: statsResult.success });

        // 7. Pending Approvals
        const pendingResult = await testPendingApprovals();
        results.push({ test: 'Pending Approvals', result: pendingResult.success });

        // 8. Approve Owner (if we have an owner ID)
        if (ownerId) {
            const approveResult = await testApproveOwner(ownerId);
            results.push({ test: 'Approve Owner', result: approveResult.success });
            
            if (approveResult.success) {
                // 9. Login as Owner (after approval)
                const ownerLoginResult = await testLoginOwner();
                results.push({ test: 'Login Owner (After Approval)', result: ownerLoginResult.success });
                
                if (ownerLoginResult.success) {
                    // 10. Create Hostel
                    const createHostelResult = await testCreateHostel();
                    results.push({ test: 'Create Hostel', result: createHostelResult.success });
                    
                    if (createHostelResult.success) {
                        // 11. Add Room Type
                        const roomResult = await testAddRoomType();
                        results.push({ test: 'Add Room Type', result: roomResult.success });
                        
                        // 12. Update Hostel
                        const updateResult = await testUpdateHostel();
                        results.push({ test: 'Update Hostel', result: updateResult.success });
                        
                        // 13. Get Owner's Hostels
                        const ownerHostelsResult = await testGetOwnerHostels();
                        results.push({ test: 'Get Owner Hostels', result: ownerHostelsResult.success });
                    }
                }
            }
        }
    }

    // 14. Public Hostel APIs
    const allHostelsResult = await testGetAllHostels();
    results.push({ test: 'Get All Hostels', result: allHostelsResult.success });
    
    if (allHostelsResult.success && allHostelsResult.data.data.length > 0) {
        const firstHostelId = allHostelsResult.data.data[0].id;
        const singleHostelResult = await testGetSingleHostel(firstHostelId);
        results.push({ test: 'Get Single Hostel', result: singleHostelResult.success });
    }

    // 15. Filter Hostels
    const filterResult = await testFilterHostels();
    results.push({ test: 'Filter Hostels', result: filterResult.success });

    // 16. Get User Profile
    if (userToken) {
        const profileResult = await testGetUserProfile();
        results.push({ test: 'Get User Profile', result: profileResult.success });
    }

    // Print Summary
    console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.yellow}📊 TEST SUMMARY${colors.reset}`);
    console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}\n`);

    const total = results.length;
    const passed = results.filter(r => r.result === true).length;
    const failed = results.filter(r => r.result === false).length;

    results.forEach(r => {
        const status = r.result ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
        console.log(`${status}  ${r.test}`);
    });

    console.log(`\n${colors.yellow}${'─'.repeat(60)}${colors.reset}`);
    console.log(`Total Tests: ${total}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}\n`);

    if (failed === 0) {
        console.log(`${colors.green}🎉 All tests passed! Your API is working perfectly.${colors.reset}`);
        console.log(`${colors.green}✨ You can now start building your frontend!${colors.reset}`);
    } else {
        console.log(`${colors.yellow}⚠️  Some tests failed. Please check the errors above.${colors.reset}`);
        console.log(`${colors.yellow}💡 Make sure your server is running and database is connected.${colors.reset}`);
    }
}

// Run the tests
runAllTests().catch(console.error);