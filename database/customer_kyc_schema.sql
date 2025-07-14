-- PostgreSQL table creation script for Customer KYC data

CREATE TABLE customer_kyc (
    id SERIAL PRIMARY KEY,
    
    -- Customer Information
    id_card_no VARCHAR(50) NOT NULL UNIQUE,
    surname VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    occupation VARCHAR(100),
    telephone VARCHAR(20),
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Address Information
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    
    -- Agent Review
    review_comments TEXT NOT NULL,
    
    -- KYC Documents (JSON array to store multiple documents)
    uploaded_documents JSONB,
    
    -- Digital Signature
    signature_data BYTEA, -- Binary blob data for signature image
    signature_filename VARCHAR(255), -- Original filename
    signature_mimetype VARCHAR(100), -- MIME type (e.g., image/png)
    signature_size INTEGER, -- File size in bytes
    
    -- Metadata
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional fields for audit trail
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX idx_customer_kyc_id_card_no ON customer_kyc(id_card_no);
CREATE INDEX idx_customer_kyc_email ON customer_kyc(email);
CREATE INDEX idx_customer_kyc_status ON customer_kyc(status);
CREATE INDEX idx_customer_kyc_submission_date ON customer_kyc(submission_date);
CREATE INDEX idx_customer_kyc_created_at ON customer_kyc(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on any update
CREATE TRIGGER update_customer_kyc_updated_at 
    BEFORE UPDATE ON customer_kyc 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a table for document metadata (alternative approach if you want separate table for documents)
CREATE TABLE customer_documents (
    id SERIAL PRIMARY KEY,
    customer_kyc_id INTEGER REFERENCES customer_kyc(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_size BIGINT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_data TEXT, -- Base64 encoded document data (optional)
    file_path VARCHAR(500), -- File system path to the uploaded file
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_documents_kyc_id ON customer_documents(customer_kyc_id);
CREATE INDEX idx_customer_documents_type ON customer_documents(document_type);

-- Sample insert query (for testing purposes)
/*
INSERT INTO customer_kyc (
    id_card_no, surname, first_name, date_of_birth, occupation, 
    telephone, mobile, email, street_address, city, state, 
    postal_code, country, review_comments, uploaded_documents, 
    signature_data, status
) VALUES (
    'D0112781100051G', 'Dinand Gangaram', 'Nisha', '1978-01-12', 
    'Software Engineer', '57590454', '57590454', 'ndinand@nicl.mu',
    'Balkissoon Road, Camp Thorel, Quartier Militaire', 'Port Louis', 
    'Port Louis District', '11201', 'Mauritius', 
    'Customer information verified and documents are in order.',
    '[{"name": "id_card.pdf", "size": 1024000, "type": "application/pdf"}]',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'pending'
);
*/

-- Views for common queries
CREATE VIEW customer_kyc_summary AS
SELECT 
    id,
    id_card_no,
    CONCAT(first_name, ' ', surname) as full_name,
    email,
    mobile,
    city,
    country,
    status,
    submission_date,
    created_at
FROM customer_kyc
ORDER BY created_at DESC;

-- View for pending applications
CREATE VIEW pending_applications AS
SELECT * FROM customer_kyc_summary WHERE status = 'pending';

-- View for approved applications
CREATE VIEW approved_applications AS
SELECT * FROM customer_kyc_summary WHERE status = 'approved';
