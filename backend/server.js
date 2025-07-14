// Node.js/Express backend example for handling Customer KYC form submission
// Install required packages: npm install express pg multer cors helmet
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();

// console.log(process.env.PORT);
const port = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: function (req, file, cb) {
    // Check file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and document files are allowed!'));
    }
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:4200', 
    'http://localhost:3000', 
    'http://127.0.0.1:4200',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'your_username',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'customer_kyc_db',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection immediately
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully');
    client.release();
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
  }
})();

// Listen for connection events
pool.on('connect', () => {
  console.log('🔗 New client connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// API endpoint to save customer KYC data
app.post('/api/customer-kyc', upload.fields([
  { name: 'documents', maxCount: 10 },
  { name: 'signature', maxCount: 1 }
]), async (req, res) => {
    console.log('Received KYC submission:', req.body);
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      idCardNo,
      surname,
      firstName,
      dateOfBirth,
      occupation,
      telephone,
      mobile,
      email,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      reviewComments,
      submissionDate,
      status
    } = req.body;

    // Get uploaded files
    const documents = req.files?.documents || [];
    const signature = req.files?.signature?.[0];

    // Validate required fields
    if (!idCardNo || !surname || !firstName || !email || !mobile || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Prepare documents data for JSON storage
    const documentsData = documents.map(doc => ({
      originalName: doc.originalname,
      filename: doc.filename,
      size: doc.size,
      mimetype: doc.mimetype,
      uploadPath: doc.path
    }));

    // Prepare signature data
    const signatureData = signature ? {
      originalName: signature.originalname,
      filename: signature.filename,
      size: signature.size,
      mimetype: signature.mimetype,
      uploadPath: signature.path,
      buffer: fs.readFileSync(signature.path) // Read file as buffer for database storage
    } : null;

    // Insert main customer KYC record
    const insertKycQuery = `
      INSERT INTO customer_kyc (
        id_card_no, surname, first_name, date_of_birth, occupation,
        telephone, mobile, email, street_address, city, state,
        postal_code, country, review_comments, uploaded_documents,
        signature_data, signature_filename, signature_mimetype, signature_size,
        status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id
    `;

    const kycValues = [
      idCardNo, surname, firstName, dateOfBirth, occupation,
      telephone, mobile, email, streetAddress, city, state,
      postalCode, country, reviewComments, JSON.stringify(documentsData),
      signatureData ? signatureData.buffer : null, // Store as binary data
      signatureData ? signatureData.originalName : null,
      signatureData ? signatureData.mimetype : null,
      signatureData ? signatureData.size : null,
      status || 'pending', 'system' // created_by
    ];

    const kycResult = await client.query(insertKycQuery, kycValues);
    const kycId = kycResult.rows[0].id;

    // Insert individual document records (if using separate documents table)
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        const insertDocQuery = `
          INSERT INTO customer_documents (
            customer_kyc_id, document_name, document_size, 
            document_type, document_data, file_path
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        // Read file as base64 for storage (optional)
        const fileBuffer = fs.readFileSync(doc.path);
        const base64Data = fileBuffer.toString('base64');
        
        await client.query(insertDocQuery, [
          kycId, doc.originalname, doc.size, doc.mimetype, base64Data, doc.path
        ]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Customer KYC data saved successfully',
      data: {
        id: kycId,
        idCardNo: idCardNo,
        submissionDate: new Date().toISOString(),
        documentsCount: documents.length,
        signatureUploaded: !!signature
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving customer KYC data:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      const allFiles = [
        ...(req.files.documents || []),
        ...(req.files.signature || [])
      ];
      allFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Customer with this ID Card number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// Serve signature image from database
app.get('/api/signature/:kycId', async (req, res) => {
  try {
    const { kycId } = req.params;
    
    const query = `
      SELECT signature_data, signature_filename, signature_mimetype 
      FROM customer_kyc 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [kycId]);
    
    if (result.rows.length === 0 || !result.rows[0].signature_data) {
      return res.status(404).json({
        success: false,
        message: 'Signature not found'
      });
    }
    
    const signature = result.rows[0];
    
    // Set appropriate headers
    res.set({
      'Content-Type': signature.signature_mimetype || 'image/png',
      'Content-Disposition': `inline; filename="${signature.signature_filename || 'signature.png'}"`,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });
    
    // Send binary data
    res.send(signature.signature_data);
    
  } catch (error) {
    console.error('Error retrieving signature:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Serve uploaded files
app.get('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  
  // Send file
  res.sendFile(filePath);
});

// API endpoint to retrieve customer KYC data
app.get('/api/customer-kyc/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, id_card_no, surname, first_name, date_of_birth,
        occupation, telephone, mobile, email, street_address,
        city, state, postal_code, country, review_comments,
        uploaded_documents, signature_filename, signature_mimetype, 
        signature_size, status, submission_date, created_at, updated_at
      FROM customer_kyc 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer KYC record not found'
      });
    }
    
    const customerData = result.rows[0];
    
    // Add signature URL if signature exists
    if (customerData.signature_filename) {
      customerData.signature_url = `/api/signature/${id}`;
    }
    
    res.json({
      success: true,
      data: customerData
    });
    
  } catch (error) {
    console.error('Error retrieving customer KYC data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// API endpoint to update KYC status
app.patch('/api/customer-kyc/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const query = `
      UPDATE customer_kyc 
      SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, status, updated_at
    `;
    
    const result = await pool.query(query, [status, updatedBy || 'system', id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer KYC record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating KYC status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// API endpoint to get all KYC applications with pagination
app.get('/api/customer-kyc', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let queryParams = [limit, offset];
    
    if (status) {
      whereClause = 'WHERE status = $3';
      queryParams.push(status);
    }
    
    const query = `
      SELECT 
        id, id_card_no, 
        CONCAT(first_name, ' ', surname) as full_name,
        email, mobile, city, country, status,
        submission_date, created_at,
        CASE WHEN signature_filename IS NOT NULL THEN true ELSE false END as has_signature
      FROM customer_kyc 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM customer_kyc 
      ${whereClause}
    `;
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, status ? [status] : [])
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error retrieving KYC applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Customer KYC API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(port, () => {
  console.log(`Customer KYC API server running on port ${port}`);
});

module.exports = app;
