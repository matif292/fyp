const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        'uploads/profile',
        'uploads/cnic', 
        'uploads/hostel',
        'uploads/bank',
        'uploads/misc'
    ];
    dirs.forEach(dir => {
        const fullPath = path.join(__dirname, '../../', dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        
        if (file.fieldname === 'profile_photo') {
            uploadPath += 'profile/';
        } else if (file.fieldname === 'cnic_front' || file.fieldname === 'cnic_back') {
            uploadPath += 'cnic/';
        } else if (file.fieldname === 'bank_letter' || file.fieldname === 'business_license') {
            uploadPath += 'bank/';
        } else if (file.fieldname === 'photos') {
            uploadPath += 'hostel/';
        } else {
            uploadPath += 'misc/';
        }

        // Create directory if it doesn't exist
        const fullPath = path.join(__dirname, '../../', uploadPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        console.log(`📸 Saving file: ${filename}`);
        cb(null, filename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log(`❌ Invalid file type: ${file.mimetype}`);
        cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Middleware for multiple file uploads
const uploadMultiple = (fieldName, maxCount = 10) => {
    return upload.array(fieldName, maxCount);
};

// Middleware for hostel photos
const uploadHostelPhotos = upload.array('photos', 10);

// Middleware for owner registration fields
const uploadOwnerFields = upload.fields([
    { name: 'cnic_front', maxCount: 1 },
    { name: 'cnic_back', maxCount: 1 },
    { name: 'business_license', maxCount: 1 },
    { name: 'bank_letter', maxCount: 1 }
]);

module.exports = { 
    upload, 
    uploadMultiple, 
    uploadHostelPhotos, 
    uploadOwnerFields
};