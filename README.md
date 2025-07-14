# Customer KYC Form Application

A comprehensive Angular-based customer KYC (Know Your Customer) form with digital signature functionality and PostgreSQL database integration.

## Features

- **Auto-fill Customer Information**: Automatically fetches and fills customer data from external API when ID Card number is entered
- **Multi-step Form**: Organized into collapsible panels for better user experience
- **Digital Signature Canvas**: Interactive signature pad with mouse/stylus support
- **Document Upload**: Drag-and-drop file upload with preview functionality
- **Form Validation**: Comprehensive client-side validation
- **Database Integration**: PostgreSQL backend with optimized schema
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

### Frontend
- **Angular 17+** with standalone components
- **Angular Material** for UI components
- **TypeScript** for type safety
- **SCSS** for styling
- **RxJS** for reactive programming

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** for authentication (optional)
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Angular CLI (`npm install -g @angular/cli`)

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:4200`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your database credentials
   ```

4. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE customer_kyc_db;
   ```

5. Run the database schema:
   ```bash
   psql -d customer_kyc_db -f ../database/customer_kyc_schema.sql
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

## Key Components

### Customer Form Component
- **Location**: `src/app/components/customer-form/`
- **Features**: 
  - Auto-fill from external API
  - Reactive forms with validation
  - Digital signature canvas
  - File upload with preview
  - Multi-panel navigation

### Digital Signature
The signature canvas supports:
- Mouse and touch input
- Clear and save functionality
- Base64 encoding for database storage
- Responsive design for mobile devices

### API Integration
- **External API**: Fetches user data from `https://gipasdmssvr.nicl.mu:8050/NICGeneralServices/userinfo`
- **Backend API**: Saves form data to PostgreSQL database
- **Debounced requests**: Prevents excessive API calls

## Database Schema

See `database/customer_kyc_schema.sql` for complete schema including:
- **customer_kyc** table for main form data
- **customer_documents** table for file management
- Indexes for performance optimization
- Views for common queries

## API Endpoints

- `POST /api/customer-kyc` - Submit new KYC application
- `GET /api/customer-kyc/:id` - Retrieve specific KYC record
- `GET /api/customer-kyc` - List all applications with pagination
- `PATCH /api/customer-kyc/:id/status` - Update application status

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
