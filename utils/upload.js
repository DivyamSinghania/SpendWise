const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads/'),
    filename: (req, file, cb) => 
        cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

module.exports = upload;
