-- Migration script to update existing customer_kyc table for blob signature storage
-- Run this if you already have an existing table with TEXT signature_data

-- First, create a backup of the existing table
CREATE TABLE customer_kyc_backup AS SELECT * FROM customer_kyc;

-- Add new columns for blob signature storage
ALTER TABLE customer_kyc 
ADD COLUMN signature_data_new BYTEA,
ADD COLUMN signature_filename VARCHAR(255),
ADD COLUMN signature_mimetype VARCHAR(100),
ADD COLUMN signature_size INTEGER;

-- Migrate existing base64 signature data to blob (if you have existing data)
-- This converts base64 TEXT to BYTEA
UPDATE customer_kyc 
SET 
  signature_data_new = decode(substring(signature_data from 23), 'base64'),
  signature_filename = 'signature.png',
  signature_mimetype = 'image/png'
WHERE signature_data IS NOT NULL 
  AND signature_data LIKE 'data:image/png;base64,%';

-- Drop the old signature_data column
ALTER TABLE customer_kyc DROP COLUMN signature_data;

-- Rename the new column to the original name
ALTER TABLE customer_kyc RENAME COLUMN signature_data_new TO signature_data;

-- Update the sample insert query for testing
/*
INSERT INTO customer_kyc (
    id_card_no, surname, first_name, date_of_birth, occupation, 
    telephone, mobile, email, street_address, city, state, 
    postal_code, country, review_comments, uploaded_documents, 
    signature_filename, signature_mimetype, signature_size, status
) VALUES (
    'D0112781100051G', 'Dinand Gangaram', 'Nisha', '1978-01-12', 
    'Software Engineer', '57590454', '57590454', 'ndinand@nicl.mu',
    'Balkissoon Road, Camp Thorel, Quartier Militaire', 'Port Louis', 
    'Port Louis District', '11201', 'Mauritius', 
    'Customer information verified and documents are in order.',
    '[{"name": "id_card.pdf", "size": 1024000, "type": "application/pdf"}]',
    'signature.png', 'image/png', 2048,
    'pending'
);
*/

-- Verify the migration
SELECT 
    id, 
    id_card_no, 
    signature_filename,
    signature_mimetype,
    signature_size,
    CASE WHEN signature_data IS NOT NULL THEN 'Has signature blob' ELSE 'No signature' END as signature_status
FROM customer_kyc 
LIMIT 5;
