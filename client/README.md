# Job Portal Backend API Documentation

## 🚀 Overview

This is a comprehensive **Job Portal Backend** built with **Node.js**, **Express.js**, and **MongoDB**. It provides a complete RESTful API for a job marketplace platform connecting job seekers with recruiters and companies. The backend supports role-based access control with three primary user roles: **Admin**, **Recruiter**, and **Job Seeker**.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Technical Stack](#-technical-stack)
- [Architecture & Design](#-architecture--design)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
  - [Public Routes](#1-public-routes)
  - [Authentication Routes](#2-authentication-routes)
  - [Admin Routes](#3-admin-routes)
  - [Recruiter Routes](#4-recruiter-routes)
  - [Job Seeker Routes](#5-job-seeker-routes)
- [Database Models](#-database-models)
- [Security Features](#-security-features)
- [Error Handling](#-error-handling)
- [Deployment](#-deployment)

---

## ✨ Key Features

### **Core Functionality**
- ✅ **Role-Based Access Control (RBAC)** - Admin, Recruiter, and Job Seeker roles
- ✅ **JWT Authentication** - Access and refresh token mechanism
- ✅ **Email Verification** - Secure email verification workflow
- ✅ **Password Reset** - Forgot password and reset functionality
- ✅ **File Upload** - Resume, portfolio, company logos, and banners
- ✅ **Job Search & Filtering** - Advanced search with multiple filters
- ✅ **Job Recommendations** - ML-ready recommendation system for job seekers
- ✅ **Application Tracking System (ATS)** - Complete application management
- ✅ **Analytics Dashboard** - Recruiter and Admin analytics
- ✅ **Recruiter Verification** - Admin approval workflow for recruiters

### **Security Features**
- 🔒 **Helmet.js** - Security headers
- 🔒 **Rate Limiting** - API rate limiting (100 requests per 15 minutes)
- 🔒 **CORS Configuration** - Controlled cross-origin requests
- 🔒 **Password Hashing** - bcryptjs encryption
- 🔒 **JWT Token Management** - Secure token-based authentication
- 🔒 **Input Validation** - express-validator for request validation

### **Advanced Features**
- 📊 **Job Analytics** - View tracking, application metrics
- 📧 **Email Service** - Nodemailer integration for transactional emails
- 🔍 **Full-Text Search** - MongoDB text search for jobs
- 📁 **File Management** - Multer for file uploads
- 📝 **Logging** - Winston and Morgan for comprehensive logging
- 🎯 **Pagination** - All list endpoints support pagination

---

## 🛠 Technical Stack

### **Core Technologies**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | Latest | JavaScript runtime |
| **Express.js** | ^5.2.1 | Web framework |
| **MongoDB** | ^9.1.5 (Mongoose) | NoSQL database |
| **JWT** | ^9.0.3 | Authentication |
| **bcryptjs** | ^3.0.3 | Password hashing |

### **Security & Middleware**
| Package | Version | Purpose |
|---------|---------|---------|
| **helmet** | ^8.1.0 | Security headers |
| **cors** | ^2.8.5 | Cross-origin resource sharing |
| **express-rate-limit** | ^8.2.1 | Rate limiting |
| **express-validator** | ^7.3.1 | Input validation |
| **cookie-parser** | ^1.4.7 | Cookie parsing |

### **Utilities**
| Package | Version | Purpose |
|---------|---------|---------|
| **nodemailer** | ^7.0.12 | Email service |
| **multer** | ^2.0.2 | File uploads |
| **winston** | ^3.19.0 | Logging |
| **morgan** | ^1.10.1 | HTTP request logging |
| **dotenv** | ^17.2.3 | Environment variables |

---

## 🏗 Architecture & Design

### **Project Structure**
```
server/
├── src/
│   ├── config/          # Database, logger configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth, upload, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # Helper functions (JWT, email, seeders)
│   └── app.js           # Express app configuration
├── uploads/             # File upload directory
├── .env                 # Environment variables
├── .env.example         # Environment template
├── index.js             # Server entry point
└── package.json         # Dependencies
```

### **Design Patterns**
- **MVC Architecture** - Separation of concerns
- **Repository Pattern** - Data access abstraction through Mongoose models
- **Middleware Chain** - Modular request processing
- **Error-First Callbacks** - Consistent error handling
- **Factory Pattern** - Email service, file upload configuration

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend/server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server**

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

---

## 🔐 Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/smartHire

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# Admin Credentials (for seeding)
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

> **Important:** Never commit your `.env` file to version control!

---

## 📚 API Documentation

### **Base URL**
```
http://localhost:5000/api/v1
```

### **Common Response Format**

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional validation errors
}
```

---

## 1. Public Routes

These routes are accessible without authentication.

### **Health Check**

```http
GET /health
```

**Description:** Check if the server is running and healthy.

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-01-29T16:00:00.000Z"
}
```

---

### **Job Routes (Public)**

#### 1.1 Get All Jobs

```http
GET /api/v1/jobs
```

**Description:** Retrieve all active job postings with pagination and filtering.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Jobs per page |
| `experienceLevel` | String | No | - | Filter by experience level |
| `employmentType` | String | No | - | Filter by employment type |
| `location` | String | No | - | Search by city, state, or country |
| `isRemote` | Boolean | No | - | Filter remote jobs |
| `isFeatured` | Boolean | No | - | Filter featured jobs |
| `sortBy` | String | No | `postedAt` | Sort field |
| `order` | String | No | `desc` | Sort order (`asc` or `desc`) |

**Request Example:**
```http
GET /api/v1/jobs?page=1&limit=10&isRemote=true&sortBy=postedAt&order=desc
```

**Response Example:**
```json
{
  "success": true,
  "count": 10,
  "totalJobs": 45,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Senior Full Stack Developer",
      "description": "We are looking for an experienced developer...",
      "company": "Tech Corp",
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "isRemote": true
      },
      "salary": {
        "min": 120000,
        "max": 180000,
        "currency": "USD"
      },
      "employmentType": "Full-Time",
      "experienceLevel": "Senior",
      "requiredSkills": [
        { "_id": "...", "name": "JavaScript" },
        { "_id": "...", "name": "React" }
      ],
      "category": {
        "_id": "...",
        "name": "Software Development"
      },
      "companyId": {
        "_id": "...",
        "companyName": "Tech Corp",
        "companyLogo": "/uploads/logos/...",
        "industry": "Technology"
      },
      "recruiterId": {
        "_id": "...",
        "name": "John Recruiter",
        "email": "john@techcorp.com"
      },
      "isFeatured": false,
      "status": "active",
      "views": 234,
      "applicationCount": 42,
      "postedAt": "2026-01-20T10:00:00.000Z",
      "createdAt": "2026-01-20T10:00:00.000Z",
      "updatedAt": "2026-01-29T15:30:00.000Z"
    }
    // ... more jobs
  ]
}
```

---

#### 1.2 Search Jobs

```http
GET /api/v1/jobs/search
```

**Description:** Advanced job search with full-text search and multiple filters.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | String | No | - | Search query (full-text search) |
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Jobs per page |
| `experienceLevel` | String | No | - | Filter by experience level |
| `employmentType` | String | No | - | Filter by employment type |
| `location` | String | No | - | Search by location |
| `isRemote` | Boolean | No | - | Remote jobs only |
| `salaryMin` | Number | No | - | Minimum salary |
| `salaryMax` | Number | No | - | Maximum salary |
| `skills` | String | No | - | Comma-separated skill IDs |
| `category` | String | No | - | Category ID |
| `sortBy` | String | No | `relevance` | Sort by (`relevance`, `date`, `salary`) |

**Request Example:**
```http
GET /api/v1/jobs/search?q=javascript developer&location=San Francisco&salaryMin=100000&isRemote=true&sortBy=relevance
```

**Response Example:**
```json
{
  "success": true,
  "count": 8,
  "totalJobs": 8,
  "totalPages": 1,
  "currentPage": 1,
  "searchQuery": "javascript developer",
  "data": [
    // ... array of job objects (same structure as Get All Jobs)
  ]
}
```

---

#### 1.3 Get Job by ID

```http
GET /api/v1/jobs/:id
```

**Description:** Retrieve detailed information about a specific job posting.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |

**Request Example:**
```http
GET /api/v1/jobs/65f1234567890abcdef12345
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Senior Full Stack Developer",
    "description": "Detailed job description...",
    "responsibilities": [
      "Design and develop scalable web applications",
      "Lead technical architecture decisions",
      "Mentor junior developers"
    ],
    "requirements": [
      "5+ years of full-stack development experience",
      "Expert knowledge of JavaScript, React, Node.js",
      "Experience with cloud platforms (AWS/GCP)"
    ],
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "isRemote": true
    },
    "salary": {
      "min": 120000,
      "max": 180000,
      "currency": "USD"
    },
    "employmentType": "Full-Time",
    "experienceLevel": "Senior",
    "benefits": [
      "Health insurance",
      "401(k) matching",
      "Remote work flexibility"
    ],
    "requiredSkills": [
      { "_id": "...", "name": "JavaScript" },
      { "_id": "...", "name": "React" },
      { "_id": "...", "name": "Node.js" }
    ],
    "category": {
      "_id": "...",
      "name": "Software Development"
    },
    "companyId": {
      "_id": "...",
      "companyName": "Tech Corp",
      "companyLogo": "/uploads/logos/techcorp.png",
      "companyDescription": "Leading technology company...",
      "industry": "Technology",
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA"
      },
      "website": "https://techcorp.com"
    },
    "recruiterId": {
      "_id": "...",
      "name": "John Recruiter",
      "email": "john@techcorp.com"
    },
    "isFeatured": false,
    "status": "active",
    "views": 234,
    "applicationCount": 42,
    "applicationDeadline": "2026-03-01T23:59:59.000Z",
    "postedAt": "2026-01-20T10:00:00.000Z",
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-29T15:30:00.000Z"
  }
}
```

**Error Response (Job Not Found):**
```json
{
  "success": false,
  "message": "Job not found"
}
```

---

#### 1.4 Track Job View

```http
POST /api/v1/jobs/:id/view
```

**Description:** Track when a user views a job posting (for analytics).

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

**Request Example:**
```http
POST /api/v1/jobs/65f1234567890abcdef12345/view

{
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Job view tracked successfully"
}
```

---

### **Skills Routes (Public)**

#### 1.5 Get All Skills

```http
GET /api/v1/skills
```

**Description:** Retrieve all available skills with pagination.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `50` | Skills per page |
| `search` | String | No | - | Search by skill name |
| `category` | String | No | - | Filter by category |

**Request Example:**
```http
GET /api/v1/skills?page=1&limit=50&search=javascript
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "_id": "65f1234567890abcdef12345",
        "name": "JavaScript",
        "category": "Programming Languages",
        "description": "Popular programming language for web development"
      },
      {
        "_id": "65f1234567890abcdef12346",
        "name": "React",
        "category": "Frontend Frameworks",
        "description": "JavaScript library for building user interfaces"
      }
      // ... more skills
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 120,
      "pages": 3
    }
  }
}
```

---

#### 1.6 Search Skills

```http
GET /api/v1/skills/search
```

**Description:** Search skills by name or partial match (for autocomplete).

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | String | Yes | - | Search term |
| `limit` | Number | No | `10` | Max results (max: 50) |

**Request Example:**
```http
GET /api/v1/skills/search?q=java&limit=10
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "_id": "65f1234567890abcdef12345",
        "name": "JavaScript",
        "category": "Programming Languages"
      },
      {
        "_id": "65f1234567890abcdef12346",
        "name": "Java",
        "category": "Programming Languages"
      }
    ]
  }
}
```

**Error Response (Missing Query):**
```json
{
  "success": false,
  "message": "Search query required"
}
```

---

### **Job Categories Routes (Public)**

#### 1.7 Get All Categories

```http
GET /api/v1/categories
```

**Description:** Retrieve all job categories with optional hierarchical structure.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `view` | String | No | `flat` | View type (`flat` or `tree`) |
| `parentId` | String | No | - | Get subcategories of parent |
| `q` | String | No | - | Search by category name |
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `50` | Categories per page |

**Request Example (Flat View):**
```http
GET /api/v1/categories?view=flat&page=1&limit=50
```

**Response Example (Flat View):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "65f1234567890abcdef12345",
        "name": "Software Development",
        "description": "Roles related to software engineering and development",
        "parentId": null,
        "level": 0
      },
      {
        "_id": "65f1234567890abcdef12346",
        "name": "Frontend Development",
        "description": "Client-side web development",
        "parentId": "65f1234567890abcdef12345",
        "level": 1
      }
      // ... more categories
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "pages": 1
    }
  }
}
```

**Request Example (Tree View):**
```http
GET /api/v1/categories?view=tree
```

**Response Example (Tree View):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "65f1234567890abcdef12345",
        "name": "Software Development",
        "description": "Roles related to software engineering",
        "children": [
          {
            "_id": "65f1234567890abcdef12346",
            "name": "Frontend Development",
            "description": "Client-side development",
            "children": []
          },
          {
            "_id": "65f1234567890abcdef12347",
            "name": "Backend Development",
            "description": "Server-side development",
            "children": []
          }
        ]
      }
      // ... more categories
    ]
  }
}
```

---

### **Public Company Profile**

#### 1.8 Get Public Company Profile

```http
GET /api/v1/recruiters/:id/profile
```

**Description:** View public company profile (accessible without authentication).

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Recruiter Profile ID |

**Request Example:**
```http
GET /api/v1/recruiters/65f1234567890abcdef12345/profile
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "companyName": "Tech Corp",
    "companyLogo": "/uploads/logos/techcorp.png",
    "companyBanner": "/uploads/banners/techcorp-banner.jpg",
    "companyDescription": "Leading technology innovation company...",
    "industry": "Technology",
    "companySize": "500-1000",
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "website": "https://techcorp.com",
    "socialLinks": {
      "linkedin": "https://linkedin.com/company/techcorp",
      "twitter": "https://twitter.com/techcorp"
    },
    "foundedYear": 2015,
    "isVerified": true,
    "activeJobCount": 12,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

## Key Notes for Public Routes:

1. **No Authentication Required**: All public routes can be accessed without providing an `Authorization` header.

2. **Rate Limiting**: All API endpoints are rate-limited to **100 requests per 15 minutes** per IP address.

3. **Pagination**: Most list endpoints support pagination with `page` and `limit` query parameters.

4. **CORS**: The API is configured to accept requests from the frontend URL specified in environment variables.

5. **Text Search**: Job search uses MongoDB's full-text search capabilities for relevant results.

---

*Continue to [Authentication Routes](#2-authentication-routes) →*

## 2. Authentication Routes

All authentication routes are publicly accessible but some require specific tokens or cookies.

### **Authentication Flow Overview**

1. **Registration** → User registers with email/password
2. **Email Verification** → User verifies email via token
3. **Login** → User logs in with credentials → Receives access token + refresh token (cookie)
4. **Access Protected Routes** → Use access token in Authorization header
5. **Token Refresh** → When access token expires, use refresh token to get new access token
6. **Logout** → Clear tokens and sessions

---

### 2.1 Register User

```http
POST /api/v1/auth/register
```

**Description:** Register a new user account. Sends a verification email to the provided email address.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | User's full name |
| `email` | String | Yes | Valid email address |
| `password` | String | Yes | Min 8 chars, 1 number, 1 uppercase |
| `role` | String | No | User role: `jobseeker`, `recruiter` (default: `jobseeker`) |

**Request Example:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "role": "jobseeker"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "65f1234567890abcdef12345",
    "email": "john.doe@example.com",
    "role": "jobseeker"
  }
}
```

**Error Response - User Already Exists (400):**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

**Error Response - Validation Error (400):**
```json
{
  "success": false,
  "errors": [
    { "msg": "Name is required", "param": "name" },
    { "msg": "Password must be at least 8 characters long", "param": "password" },
    { "msg": "Password must contain a number", "param": "password" }
  ]
}
```

---

### 2.2 Login

```http
POST /api/v1/auth/login
```

**Description:** Authenticate user and receive access token + refresh token.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | User's email |
| `password` | String | Yes | User's password |

**Request Example:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "jobseeker",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookies Set:**
```
refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Response - Invalid Credentials (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Error Response - Email Not Verified (403):**
```json
{
  "success": false,
  "message": "Please verify your email before logging in"
}
```

**Error Response - Account Deactivated (403):**
```json
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support."
}
```

---

### 2.3 Logout

```http
POST /api/v1/auth/logout
```

**Description:** Logout user and invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Example:**
```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Response - Not Authorized (401):**
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

---

### 2.4 Verify Email

```http
POST /api/v1/auth/verify-email
```

**Description:** Verify user's email address using the verification token sent via email.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | String | Yes | Email verification token |

**Request Example:**
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Response - Invalid/Expired Token (400):**
```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

---

### 2.5 Forgot Password

```http
POST /api/v1/auth/forgot-password
```

**Description:** Request a password reset link. Sends email with reset token if account exists.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | User's registered email |

**Request Example:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account exists, a password reset link will be sent"
}
```

> **Note:** For security reasons, the response is the same whether the email exists or not.

---

### 2.6 Reset Password

```http
POST /api/v1/auth/reset-password
```

**Description:** Reset user password using the reset token received via email.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | String | Yes | Password reset token from email |
| `newPassword` | String | Yes | New password (min 6 characters) |

**Request Example:**
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "newPassword": "NewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

**Error Response - Invalid/Expired Token (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**Error Response - Weak Password (400):**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

---

### 2.7 Refresh Access Token

```http
POST /api/v1/auth/refresh-token
```

**Description:** Get a new access token using the refresh token from cookies.

**Headers:**
```
Content-Type: application/json
```

**Cookies Required:**
```
refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Example:**
```http
POST /api/v1/auth/refresh-token
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**New Cookie Set:**
```
refreshToken=<new_refresh_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Response - No Refresh Token (401):**
```json
{
  "success": false,
  "message": "Refresh token not found"
}
```

**Error Response - Invalid Refresh Token (401):**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

---

### 2.8 Get Current User

```http
GET /api/v1/auth/me
```

**Description:** Get information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Example:**
```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65f1234567890abcdef12345",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "jobseeker",
    "isVerified": true,
    "isActive": true,
    "lastLogin": "2026-01-29T16:30:00.000Z",
    "createdAt": "2026-01-15T10:00:00.000Z"
  }
}
```

**Error Response - Not Authorized (401):**
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

**Error Response - User Not Found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Authentication Key Notes:

### **Token Management**

1. **Access Token**: 
   - Expires in 15 minutes
   - Sent in response body
   - Use in `Authorization: Bearer <token>` header for protected routes
   - Claims: `{ id, role, iat, exp }`

2. **Refresh Token**: 
   - Expires in 7 days
   - Stored as httpOnly cookie
   - Used to get new access tokens
   - Claims: `{ id, iat, exp }`

### **Security Features**

1. **Password Requirements**:
   - Minimum 8 characters
   - At least 1 number
   - At least 1 uppercase letter

2. **Token Security**:
   - Refresh tokens stored in httpOnly cookies (prevents XSS)
   - Secure flag enabled in production
   - SameSite=Strict prevents CSRF

3. **Account Security**:
   - Email verification required before login
   - Password reset tokens expire after 10 minutes
   - Email verification tokens expire after 24 hours
   - All refresh tokens invalidated on password reset

### **Error Codes Summary**

| Status Code | Meaning |
|-------------|---------|
| `200` | Success |
| `201` | Resource created successfully |
| `400` | Bad request / Validation error |
| `401` | Unauthorized / Invalid credentials |
| `403` | Forbidden / Email not verified / Account deactivated |
| `404` | User/Resource not found |
| `500` | Server error |

---

*Continue to [Admin Routes](#3-admin-routes) →*


## 3. Admin Routes

All admin routes require authentication with an admin role. Include the access token in the Authorization header.

**Required Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

---

### **3.1 User Management**

#### 3.1.1 Get All Users

```http
GET /api/v1/users
```

**Description:** Retrieve all users with pagination and filtering options.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Users per page |
| `role` | String | No | - | Filter by role (`admin`, `recruiter`, `jobseeker`) |
| `isActive` | Boolean | No | - | Filter by active status |
| `isVerified` | Boolean | No | - | Filter by verification status |
| `search` | String | No | - | Search by name or email |

**Request Example:**
```http
GET /api/v1/users?page=1&limit=20&role=recruiter&isActive=true&search=john
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "name": "John Recruiter",
      "email": "john@company.com",
      "role": "recruiter",
      "isActive": true,
      "isVerified": true,
      "lastLogin": "2026-01-29T10:00:00.000Z",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-01-29T10:00:00.000Z"
    }
    // ... more users
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

#### 3.1.2 Get User by ID

```http
GET /api/v1/users/:id
```

**Description:** Retrieve detailed information about a specific user.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | User ID |

**Request Example:**
```http
GET /api/v1/users/65f1234567890abcdef12345
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "John Recruiter",
    "email": "john@company.com",
    "role": "recruiter",
    "isActive": true,
    "isVerified": true,
    "lastLogin": "2026-01-29T10:00:00.000Z",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-29T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

#### 3.1.3 Activate User

```http
PATCH /api/v1/users/:id/activate
```

**Description:** Activate a deactivated user account.

**Request Example:**
```http
PATCH /api/v1/users/65f1234567890abcdef12345/activate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User account activated successfully",
  "data": {
    "id": "65f1234567890abcdef12345",
    "name": "John Recruiter",
    "email": "john@company.com",
    "isActive": true
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User account is already active"
}
```

---

#### 3.1.4 Deactivate User

```http
PATCH /api/v1/users/:id/deactivate
```

**Description:** Deactivate a user account (prevents login).

**Request Example:**
```http
PATCH /api/v1/users/65f1234567890abcdef12345/deactivate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User account deactivated successfully",
  "data": {
    "id": "65f1234567890abcdef12345",
    "name": "John Recruiter",
    "email": "john@company.com",
    "isActive": false
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "You cannot deactivate your own account"
}
```

---

#### 3.1.5 Delete User

```http
DELETE /api/v1/users/:id
```

**Description:** Permanently delete a user account.

**Request Example:**
```http
DELETE /api/v1/users/65f1234567890abcdef12345
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "65f1234567890abcdef12345",
    "name": "John Recruiter",
    "email": "john@company.com"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "You cannot delete your own account"
}
```

---

### **3.2 Recruiter Verification Management**

#### 3.2.1 Get All Recruiter Profiles
```http
GET /api/v1/admin/recruiters/
```

**Description:** Retrieve all recruiter profiles with pagination and filtering options.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | 1 | Page number for pagination |
| `limit` | Number | No | 10 | Number of profiles per page |
| `verificationStatus` | String | No | - | Filter by status: `pending`, `approved`, `rejected` |
| `isVerified` | Boolean | No | - | Filter by verification: `true` or `false` |
| `industry` | String | No | - | Filter by industry |
| `companySize` | String | No | - | Filter by company size |

**Request Example:**
```http
GET /api/v1/admin/recruiters/?page=1&limit=10&verificationStatus=pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recruiter profiles retrieved successfully",
  "data": {
    "profiles": [
      {
        "_id": "65f1234567890abcdef12345",
        "userId": {
          "_id": "65f1234567890abcdef12346",
          "name": "Jane Smith",
          "email": "jane@techcorp.com",
          "role": "recruiter"
        },
        "companyName": "Tech Corp",
        "companyLogo": "/uploads/logos/techcorp.png",
        "industry": "Technology",
        "companySize": "51-200",
        "companyDescription": "Leading tech solutions provider...",
        "location": {
          "city": "San Francisco",
          "state": "CA",
          "country": "USA"
        },
        "website": "https://techcorp.com",
        "isVerified": false,
        "verificationStatus": "pending",
        "createdAt": "2026-01-28T09:00:00.000Z",
        "updatedAt": "2026-01-28T09:00:00.000Z"
      }
      // ... more profiles
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProfiles": 48,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### 3.2.2 Get Pending Recruiter Verifications
```http
GET /api/v1/admin/recruiters/pending
```

**Description:** Retrieve all recruiters awaiting verification.

**Request Example:**
```http
GET /api/v1/admin/recruiters/pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "userId": {
        "_id": "65f1234567890abcdef12346",
        "name": "Jane Smith",
        "email": "jane@techcorp.com"
      },
      "companyName": "Tech Corp",
      "companyLogo": "/uploads/logos/techcorp.png",
      "industry": "Technology",
      "companySize": "100-500",
      "website": "https://techcorp.com",
      "verificationStatus": "pending",
      "createdAt": "2026-01-28T09:00:00.000Z"
    }
    // ... more pending recruiters
  ]
}
```

---

#### 3.2.3 Verify Recruiter
```http
PATCH /api/v1/admin/recruiters/:id/verify
```

**Description:** Approve and verify a recruiter account.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Recruiter Profile ID |

**Request Example:**
```http
PATCH /api/v1/admin/recruiters/65f1234567890abcdef12345/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recruiter verified successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "companyName": "Tech Corp",
    "isVerified": true,
    "verificationStatus": "verified",
    "verifiedAt": "2026-01-29T16:00:00.000Z"
  }
}
```

---

#### 3.2.4 Reject Recruiter
```http
PATCH /api/v1/admin/recruiters/:id/reject
```

**Description:** Reject a recruiter verification request with notes.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | String | Yes | Rejection reason (max 1000 chars) |

**Request Example:**
```json
{
  "notes": "Company website is not accessible. Please provide valid company documentation."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recruiter verification rejected",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "companyName": "Tech Corp",
    "verificationStatus": "rejected",
    "verificationNotes": "Company website is not accessible..."
  }
}
```

---


### **3.3 Job Management**

#### 3.3.1 Get Pending Job Approvals

```http
GET /api/v1/admin/jobs/pending
```

**Description:** Retrieve all jobs awaiting approval.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Jobs per page |
| `sortBy` | String | No | `createdAt` | Sort field |
| `order` | String | No | `desc` | Sort order |

**Request Example:**
```http
GET /api/v1/admin/jobs/pending?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pending job approvals retrieved successfully",
  "data": {
    "jobs": [
      {
        "_id": "65f1234567890abcdef12345",
        "title": "Senior Full Stack Developer",
        "description": "We are seeking...",
        "status": "pending-approval",
        "recruiterId": {
          "_id": "...",
          "name": "John Recruiter",
          "email": "john@company.com"
        },
        "companyId": {
          "_id": "...",
          "companyName": "Tech Corp",
          "companyLogo": "/uploads/logos/techcorp.png",
          "industry": "Technology"
        },
        "location": {
          "city": "San Francisco",
          "state": "CA",
          "country": "USA"
        },
        "salary": {
          "min": 120000,
          "max": 180000,
          "currency": "USD"
        },
        "createdAt": "2026-01-28T12:00:00.000Z"
      }
      // ... more pending jobs
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalJobs": 25,
      "jobsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### 3.3.2 Approve Job

```http
PATCH /api/v1/admin/jobs/:id/approve
```

**Description:** Approve a pending job posting (makes it live/active).

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID |

**Request Example:**
```http
PATCH /api/v1/admin/jobs/65f1234567890abcdef12345/approve
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job approved and published successfully",
  "data": {
    "job": {
      "id": "65f1234567890abcdef12345",
      "title": "Senior Full Stack Developer",
      "status": "active",
      "postedAt": "2026-01-29T16:30:00.000Z",
      "recruiter": "John Recruiter",
      "company": "Tech Corp"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot approve job with status 'active'. Only pending jobs can be approved."
}
```

---

#### 3.3.3 Reject Job

```http
PATCH /api/v1/admin/jobs/:id/reject
```

**Description:** Reject a job posting with moderation notes.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | String | Yes | Rejection reason (max 1000 chars) |
| `reason` | String | No | Category of rejection |

**Request Example:**
```json
{
  "reason": "Content Guidelines Violation",
  "notes": "Job description contains discriminatory language. Please revise and resubmit."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job rejected successfully",
  "data": {
    "job": {
      "id": "65f1234567890abcdef12345",
      "title": "Senior Full Stack Developer",
      "status": "rejected",
      "moderationNotes": "Reason: Content Guidelines Violation\n\nDetails: Job description contains...",
      "recruiter": "John Recruiter",
      "company": "Tech Corp"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Rejection notes are required"
}
```

---

#### 3.3.4 Feature Job

```http
PATCH /api/v1/admin/jobs/:id/feature
```

**Description:** Toggle or set the featured status of an active job.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isFeatured` | Boolean | No | Set featured status (if omitted, toggles) |

**Request Example:**
```json
{
  "isFeatured": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job featured successfully",
  "data": {
    "job": {
      "id": "65f1234567890abcdef12345",
      "title": "Senior Full Stack Developer",
      "isFeatured": true,
      "company": "Tech Corp"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Only active jobs can be featured"
}
```

---

#### 3.3.5 Delete Job

```http
DELETE /api/v1/admin/jobs/:id
```

**Description:** Delete a job posting (soft delete by default, permanent with query param).

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `permanent` | Boolean | No | `false` | Permanent deletion if `true` |

**Request Example (Soft Delete):**
```http
DELETE /api/v1/admin/jobs/65f1234567890abcdef12345
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job closed successfully",
  "data": {
    "job": {
      "id": "65f1234567890abcdef12345",
      "title": "Senior Full Stack Developer",
      "status": "closed",
      "closedAt": "2026-01-29T16:45:00.000Z"
    }
  }
}
```

**Request Example (Permanent Delete):**
```http
DELETE /api/v1/admin/jobs/65f1234567890abcdef12345?permanent=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot permanently delete job with existing applications. Close it instead."
}
```

---

#### 3.3.6 Get All Jobs (Admin View)

```http
GET /api/v1/admin/jobs
```

**Description:** Get all jobs with advanced filtering for admin dashboard.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Jobs per page |
| `status` | String | No | - | Filter by status |
| `recruiterId` | String | No | - | Filter by recruiter |
| `companyId` | String | No | - | Filter by company |
| `category` | String | No | - | Filter by category |
| `isFeatured` | Boolean | No | - | Filter featured jobs |
| `search` | String | No | - | Full-text search |
| `sortBy` | String | No | `createdAt` | Sort field |
| `order` | String | No | `desc` | Sort order |

**Request Example:**
```http
GET /api/v1/admin/jobs?status=active&isFeatured=true&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      // ... array of job objects
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalJobs": 98,
      "jobsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statistics": {
      "totalViews": 15234,
      "totalApplications": 2456,
      "avgViews": 155.5,
      "avgApplications": 25.1
    }
  }
}
```

---

#### 3.3.7 Get Job Statistics

```http
GET /api/v1/admin/jobs/statistics
```

**Description:** Get comprehensive job statistics for admin dashboard.

**Request Example:**
```http
GET /api/v1/admin/jobs/statistics
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job statistics retrieved successfully",
  "data": {
    "statusCounts": {
      "active": 156,
      "pending-approval": 23,
      "closed": 89,
      "rejected": 12,
      "draft": 34
    },
    "categoryCounts": [
      { "category": "Software Development", "count": 78 },
      { "category": "Data Science", "count": 45 },
      { "category": "Design", "count": 33 }
    ],
    "experienceLevelCounts": {
      "Entry": 34,
      "Mid": 89,
      "Senior": 112,
      "Lead": 23
    },
    "employmentTypeCounts": {
      "Full-Time": 198,
      "Part-Time": 23,
      "Contract": 45,
      "Freelance": 12
    },
    "recentJobTrends": [
      { "_id": "2026-01-01", "count": 12 },
      { "_id": "2026-01-02", "count": 15 },
      { "_id": "2026-01-03", "count": 18 }
    ],
    "topCompanies": [
      {
        "companyId": "65f1234567890abcdef12345",
        "companyName": "Tech Corp",
        "jobCount": 45,
        "totalViews": 5678,
        "totalApplications": 892
      }
    ]
  }
}
```

---

#### 3.3.8 Bulk Approve Jobs

```http
PATCH /api/v1/admin/jobs/bulk/approve
```

**Description:** Approve multiple jobs at once.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobIds` | Array | Yes | Array of job IDs to approve |

**Request Example:**
```json
{
  "jobIds": [
    "65f1234567890abcdef12345",
    "65f1234567890abcdef12346",
    "65f1234567890abcdef12347"
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bulk approval completed. 2 approved, 1 failed",
  "data": {
    "approved": [
      "65f1234567890abcdef12345",
      "65f1234567890abcdef12346"
    ],
    "failed": [
      {
        "jobId": "65f1234567890abcdef12347",
        "reason": "Job status is 'active', not pending"
      }
    ]
  }
}
```

---

### **3.4 Skills Management**

Skills can be associated with jobs and job seekers. The system supports categorization and search functionality for skills.

---

#### 3.4.1 Get All Skills
```http
GET /api/v1/skills
```

**Description:** Retrieve all skills with optional filtering by category.

**Access:** Public (No authentication required)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | String | No | - | Filter by skill category: `technical`, `soft-skill`, `tool`, `language`, `framework`, `other` |
| `includeInactive` | Boolean | No | `false` | Include inactive skills (set to `true` to show all) |

**Request Examples:**

1. **Get all active skills:**
```http
GET /api/v1/skills
```

2. **Get skills by category:**
```http
GET /api/v1/skills?category=technical
```

3. **Get all skills including inactive:**
```http
GET /api/v1/skills?includeInactive=true
```

4. **Get technical skills including inactive:**
```http
GET /api/v1/skills?category=framework&includeInactive=true
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "name": "javascript",
      "displayName": "Javascript",
      "category": "language",
      "isActive": true,
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z"
    },
    {
      "_id": "65f1234567890abcdef12346",
      "name": "react",
      "displayName": "React",
      "category": "framework",
      "isActive": true,
      "createdAt": "2026-01-15T10:05:00.000Z",
      "updatedAt": "2026-01-15T10:05:00.000Z"
    },
    {
      "_id": "65f1234567890abcdef12347",
      "name": "communication",
      "displayName": "Communication",
      "category": "soft-skill",
      "isActive": true,
      "createdAt": "2026-01-15T10:10:00.000Z",
      "updatedAt": "2026-01-15T10:10:00.000Z"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error fetching skills",
  "error": "Internal server error"
}
```

---

#### 3.4.2 Search Skills
```http
GET /api/v1/skills/search
```

**Description:** Search for skills using text search. Results are ranked by relevance.

**Access:** Public (No authentication required)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | String | Yes | Search term for skill name |
| `includeInactive` | Boolean | No | Include inactive skills (default: false) |

**Request Examples:**

1. **Search for "java":**
```http
GET /api/v1/skills/search?q=java
```

2. **Search including inactive skills:**
```http
GET /api/v1/skills/search?q=python&includeInactive=true
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "name": "javascript",
      "displayName": "Javascript",
      "category": "language",
      "isActive": true,
      "score": 1.5,
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z"
    },
    {
      "_id": "65f1234567890abcdef12348",
      "name": "java",
      "displayName": "Java",
      "category": "language",
      "isActive": true,
      "score": 1.2,
      "createdAt": "2026-01-15T10:15:00.000Z",
      "updatedAt": "2026-01-15T10:15:00.000Z"
    }
  ]
}
```

**Error Response (400 - Missing Search Term):**
```json
{
  "success": false,
  "message": "Please provide a search term using the 'q' query parameter"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error searching skills",
  "error": "Internal server error"
}
```

---

#### 3.4.3 Create Skill
```http
POST /api/v1/skills
```

**Description:** Create a new skill or retrieve existing one if it already exists. Only admins can create skills.

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Skill name (max 100 characters, will be stored in lowercase) |
| `category` | String | No | Skill category: `technical`, `soft-skill`, `tool`, `language`, `framework`, `other` (default: `other`) |

**Request Example:**
```json
{
  "name": "TypeScript",
  "category": "language"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Skill created (or retrieved if existing)",
  "data": {
    "_id": "65f1234567890abcdef12349",
    "name": "typescript",
    "displayName": "Typescript",
    "category": "language",
    "isActive": true,
    "createdAt": "2026-01-29T18:00:00.000Z",
    "updatedAt": "2026-01-29T18:00:00.000Z"
  }
}
```

**Error Response (400 - Missing Name):**
```json
{
  "success": false,
  "message": "Skill name is required"
}
```

**Error Response (400 - Invalid Category):**
```json
{
  "success": false,
  "message": "Error creating skill",
  "error": "invalid-category is not a valid skill category"
}
```

**Error Response (400 - Name Too Long):**
```json
{
  "success": false,
  "message": "Error creating skill",
  "error": "Skill name cannot exceed 100 characters"
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Error Response (403 - Forbidden):**
```json
{
  "success": false,
  "message": "User role admin is required to access this route"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error creating skill",
  "error": "Internal server error"
}
```

---

#### 3.4.4 Update Skill
```http
PUT /api/v1/skills/:id
```

**Description:** Update an existing skill. Only admins can update skills.

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Skill ObjectId |

**Request Body:** (All fields optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | No | Skill name (max 100 characters, will be stored in lowercase) |
| `category` | String | No | Skill category: `technical`, `soft-skill`, `tool`, `language`, `framework`, `other` |
| `isActive` | Boolean | No | Active status |

**Request Example:**
```json
{
  "name": "TypeScript Advanced",
  "category": "language",
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Skill updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12349",
    "name": "typescript advanced",
    "displayName": "Typescript Advanced",
    "category": "language",
    "isActive": true,
    "createdAt": "2026-01-29T18:00:00.000Z",
    "updatedAt": "2026-01-29T19:00:00.000Z"
  }
}
```

**Error Response (404 - Not Found):**
```json
{
  "success": false,
  "message": "Skill not found"
}
```

**Error Response (400 - Duplicate Name):**
```json
{
  "success": false,
  "message": "A skill with this name already exists"
}
```

**Error Response (400 - Invalid Category):**
```json
{
  "success": false,
  "message": "Error updating skill",
  "error": "invalid-category is not a valid skill category"
}
```

**Error Response (400 - Name Too Long):**
```json
{
  "success": false,
  "message": "Error updating skill",
  "error": "Skill name cannot exceed 100 characters"
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Error Response (403 - Forbidden):**
```json
{
  "success": false,
  "message": "User role admin is required to access this route"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error updating skill",
  "error": "Internal server error"
}
```

---

#### 3.4.5 Delete Skill
```http
DELETE /api/v1/skills/:id
```

**Description:** Delete a skill from the platform. Skills that are in use by jobs cannot be deleted. Only admins can delete skills.

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Skill ObjectId |

**Request Example:**
```http
DELETE /api/v1/skills/65f1234567890abcdef12349
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Skill deleted successfully"
}
```

**Error Response (404 - Not Found):**
```json
{
  "success": false,
  "message": "Skill not found"
}
```

**Error Response (409 - Skill In Use):**
```json
{
  "success": false,
  "message": "Skill is in use by 15 job(s) and cannot be deleted"
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Error Response (403 - Forbidden):**
```json
{
  "success": false,
  "message": "User role admin is required to access this route"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error deleting skill",
  "error": "Internal server error"
}
```

---

### **Skill System Notes:**

**Skill Categories:**
The system supports the following skill categories:
- `technical` - Technical skills (e.g., algorithms, data structures)
- `soft-skill` - Soft skills (e.g., communication, leadership)
- `tool` - Tools and software (e.g., Git, Docker, Jira)
- `language` - Programming languages (e.g., JavaScript, Python, Java)
- `framework` - Frameworks and libraries (e.g., React, Django, Spring)
- `other` - Miscellaneous skills (default category)

**Name Normalization:**
- All skill names are automatically stored in lowercase for consistency
- The `displayName` virtual field returns a properly capitalized version for display purposes
- When searching or creating skills, case is ignored

**Active/Inactive Status:**
- Skills can be marked as active (`isActive: true`) or inactive (`isActive: false`)
- By default, only active skills are returned in queries
- Use `includeInactive=true` query parameter to include inactive skills
- Inactive skills are hidden from public views but preserved in the database

**Find or Create Behavior:**
- The create endpoint uses a "find or create" pattern
- If a skill with the same name already exists, it returns the existing skill
- This prevents duplicate skills and makes the API more forgiving

**Search Functionality:**
- Text search is available via the `/search` endpoint
- Results are ranked by relevance score
- Search is case-insensitive

**Deletion Protection:**
- Skills that are currently associated with jobs cannot be deleted (returns 409 error)
- This prevents breaking references in the job listings
- Admins should first reassign or remove the skill from all jobs before deletion

**Example Skills by Category:**
```json
{
  "technical": ["algorithms", "data structures", "system design"],
  "language": ["javascript", "python", "java", "typescript"],
  "framework": ["react", "angular", "vue", "django", "spring"],
  "tool": ["git", "docker", "kubernetes", "jenkins"],
  "soft-skill": ["communication", "leadership", "teamwork"],
  "other": ["agile", "scrum"]
}
```
---

### **3.5 Category Management**

All category management endpoints require admin authentication except for the GET endpoint which is public.

---

#### 3.5.1 Get All Categories
```http
GET /api/v1/categories
```

**Description:** Retrieve job categories with various view options (tree, flat list, parent-only, or subcategories).

**Access:** Public (No authentication required)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `view` | String | No | `flat` | View type: `tree` (hierarchical), `parents` (top-level only), or `flat` (all categories) |
| `parentId` | String | No | - | Get subcategories of a specific parent category ID |
| `q` | String | No | - | Search term for category name or description |
| `includeInactive` | Boolean | No | `false` | Include inactive categories (set to `true` to show all) |

**Request Examples:**

1. **Get all categories (flat list):**
```http
GET /api/v1/categories
```

2. **Get hierarchical tree:**
```http
GET /api/v1/categories?view=tree
```

3. **Get only parent categories:**
```http
GET /api/v1/categories?view=parents
```

4. **Get subcategories of a parent:**
```http
GET /api/v1/categories?parentId=65f1234567890abcdef12300
```

5. **Search categories:**
```http
GET /api/v1/categories?q=software
```

6. **Include inactive categories:**
```http
GET /api/v1/categories?includeInactive=true
```

**Success Response (200 - Flat List):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "65f1234567890abcdef12300",
      "name": "Technology",
      "description": "Technology and IT related jobs",
      "icon": "laptop-code",
      "parentCategory": null,
      "isActive": true,
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z"
    },
    {
      "_id": "65f1234567890abcdef12301",
      "name": "Software Development",
      "description": "Software engineering and development roles",
      "icon": "code",
      "parentCategory": {
        "_id": "65f1234567890abcdef12300",
        "name": "Technology"
      },
      "isActive": true,
      "createdAt": "2026-01-15T10:05:00.000Z",
      "updatedAt": "2026-01-15T10:05:00.000Z"
    },
    {
      "_id": "65f1234567890abcdef12302",
      "name": "Machine Learning",
      "description": "AI and ML engineering positions",
      "icon": "brain",
      "parentCategory": {
        "_id": "65f1234567890abcdef12300",
        "name": "Technology"
      },
      "isActive": true,
      "createdAt": "2026-01-15T10:10:00.000Z",
      "updatedAt": "2026-01-15T10:10:00.000Z"
    }
  ]
}
```

**Success Response (200 - Tree View):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65f1234567890abcdef12300",
      "name": "Technology",
      "description": "Technology and IT related jobs",
      "icon": "laptop-code",
      "isActive": true,
      "subcategories": [
        {
          "_id": "65f1234567890abcdef12301",
          "name": "Software Development",
          "description": "Software engineering and development roles",
          "icon": "code",
          "isActive": true
        },
        {
          "_id": "65f1234567890abcdef12302",
          "name": "Machine Learning",
          "description": "AI and ML engineering positions",
          "icon": "brain",
          "isActive": true
        }
      ]
    },
    {
      "_id": "65f1234567890abcdef12303",
      "name": "Marketing",
      "description": "Marketing and advertising positions",
      "icon": "megaphone",
      "isActive": true,
      "subcategories": [
        {
          "_id": "65f1234567890abcdef12304",
          "name": "Digital Marketing",
          "description": "Digital marketing roles",
          "icon": "chart-line",
          "isActive": true
        }
      ]
    }
  ]
}
```

**Success Response (200 - Parent Categories Only):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65f1234567890abcdef12300",
      "name": "Technology",
      "description": "Technology and IT related jobs",
      "icon": "laptop-code",
      "parentCategory": null,
      "isActive": true,
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z"
    },
    {
      "_id": "65f1234567890abcdef12303",
      "name": "Marketing",
      "description": "Marketing and advertising positions",
      "icon": "megaphone",
      "parentCategory": null,
      "isActive": true,
      "createdAt": "2026-01-15T10:15:00.000Z",
      "updatedAt": "2026-01-15T10:15:00.000Z"
    }
  ]
}
```

**Success Response (200 - Search Results):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65f1234567890abcdef12301",
      "name": "Software Development",
      "description": "Software engineering and development roles",
      "icon": "code",
      "parentCategory": {
        "_id": "65f1234567890abcdef12300",
        "name": "Technology"
      },
      "isActive": true,
      "score": 1.5
    },
    {
      "_id": "65f1234567890abcdef12305",
      "name": "Software Testing",
      "description": "QA and testing positions",
      "icon": "bug",
      "parentCategory": {
        "_id": "65f1234567890abcdef12300",
        "name": "Technology"
      },
      "isActive": true,
      "score": 1.2
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error fetching categories",
  "error": "Internal server error"
}
```

---

#### 3.5.2 Create Category
```http
POST /api/v1/categories
```

**Description:** Create a new job category. Only admins can create categories.

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Category name (unique, max 100 characters) |
| `description` | String | No | Category description (max 500 characters) |
| `icon` | String | No | Icon name or URL |
| `parentCategory` | String | No | Parent category ObjectId (for creating subcategories) |

**Request Example (Parent Category):**
```json
{
  "name": "Technology",
  "description": "Technology and IT related jobs",
  "icon": "laptop-code"
}
```

**Request Example (Subcategory):**
```json
{
  "name": "Machine Learning",
  "description": "AI and ML engineering positions",
  "icon": "brain",
  "parentCategory": "65f1234567890abcdef12300"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "65f1234567890abcdef12302",
    "name": "Machine Learning",
    "description": "AI and ML engineering positions",
    "icon": "brain",
    "parentCategory": "65f1234567890abcdef12300",
    "isActive": true,
    "createdAt": "2026-01-29T18:00:00.000Z",
    "updatedAt": "2026-01-29T18:00:00.000Z"
  }
}
```

**Error Response (400 - Duplicate Name):**
```json
{
  "success": false,
  "message": "Category with this name already exists"
}
```

**Error Response (400 - Circular Reference):**
```json
{
  "success": false,
  "message": "Circular reference detected: Cannot create parent-child loop"
}
```

**Error Response (400 - Self Reference):**
```json
{
  "success": false,
  "message": "A category cannot be its own parent"
}
```

**Error Response (400 - Validation Error):**
```json
{
  "success": false,
  "message": "Category name is required"
}
```

**Error Response (400 - Name Too Long):**
```json
{
  "success": false,
  "message": "Category name cannot exceed 100 characters"
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Error Response (403 - Forbidden):**
```json
{
  "success": false,
  "message": "User role admin is required to access this route"
}
```

---

#### 3.5.3 Update Category
```http
PUT /api/v1/categories/:id
```

**Description:** Update an existing job category. Only admins can update categories.

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Category ObjectId |

**Request Body:** (All fields optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | No | Category name (unique, max 100 characters) |
| `description` | String | No | Category description (max 500 characters) |
| `icon` | String | No | Icon name or URL |
| `parentCategory` | String | No | Parent category ObjectId (set to `null` to make it a parent category) |
| `isActive` | Boolean | No | Active status |

**Request Example:**
```json
{
  "name": "Machine Learning & AI",
  "description": "Artificial Intelligence and Machine Learning positions",
  "isActive": true
}
```

**Request Example (Change Parent):**
```json
{
  "parentCategory": "65f1234567890abcdef12310"
}
```

**Request Example (Make Parent Category):**
```json
{
  "parentCategory": null
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12302",
    "name": "Machine Learning & AI",
    "description": "Artificial Intelligence and Machine Learning positions",
    "icon": "brain",
    "parentCategory": "65f1234567890abcdef12300",
    "isActive": true,
    "createdAt": "2026-01-29T18:00:00.000Z",
    "updatedAt": "2026-01-29T19:30:00.000Z"
  }
}
```

**Error Response (404 - Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**Error Response (400 - Duplicate Name):**
```json
{
  "success": false,
  "message": "Category with this name already exists"
}
```

**Error Response (400 - Circular Reference):**
```json
{
  "success": false,
  "message": "Circular reference detected: Cannot create parent-child loop"
}
```

**Error Response (400 - Self Reference):**
```json
{
  "success": false,
  "message": "A category cannot be its own parent"
}
```

**Error Response (400 - Validation Error):**
```json
{
  "success": false,
  "message": "Category name cannot exceed 100 characters"
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Error Response (403 - Forbidden):**
```json
{
  "success": false,
  "message": "User role admin is required to access this route"
}
```

---

#### 3.5.4 Delete Category
```http
DELETE /api/v1/categories/:id
```

**Description:** Delete a job category. Only admins can delete categories. Categories with subcategories or active jobs cannot be deleted.

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Category ObjectId |

**Request Example:**
```http
DELETE /api/v1/categories/65f1234567890abcdef12302
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Response (404 - Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**Error Response (400 - Has Subcategories):**
```json
{
  "success": false,
  "message": "Cannot delete category with subcategories. Delete or reassign subcategories first."
}
```

**Error Response (400 - Has Active Jobs):**
```json
{
  "success": false,
  "message": "Cannot delete category with 15 active job(s). Reassign jobs first."
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Error Response (403 - Forbidden):**
```json
{
  "success": false,
  "message": "User role admin is required to access this route"
}
```

---

### **Category Hierarchy Notes:**

**Category Structure:**
- Categories can have a two-level hierarchy: Parent → Subcategory
- Parent categories have `parentCategory: null`
- Subcategories have a valid `parentCategory` ObjectId
- The system prevents circular references and self-references

**Validation Rules:**
- Category names must be unique across all categories
- A category cannot be its own parent
- Circular references are prevented (e.g., Category A → Category B → Category A)
- Categories with subcategories cannot be deleted until subcategories are reassigned or deleted
- Categories with active jobs cannot be deleted until jobs are reassigned

**Active/Inactive Status:**
- Categories can be marked as active (`isActive: true`) or inactive (`isActive: false`)
- By default, only active categories are returned in queries
- Use `includeInactive=true` query parameter to include inactive categories
- Inactive categories are hidden from public views but preserved in the database

**Example Hierarchy:**
```
Technology (Parent)
├── Software Development (Subcategory)
├── Machine Learning (Subcategory)
└── Data Science (Subcategory)

Marketing (Parent)
├── Digital Marketing (Subcategory)
└── Content Marketing (Subcategory)
```

---

### **3.6 Email Management**

#### 3.6.1 Send Broadcast Email

```http
POST /api/v1/emails/admin/broadcast
```

**Description:** Send broadcast email to multiple users with advanced targeting.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | String | Yes | Email subject (max 200 chars) |
| `message` | String | Yes | Email message body (max 10000 chars) |
| `targetAudience` | String | Yes | Target audience: `all`, `recruiters`, `jobseekers`, `active`, `inactive` |
| `filters` | Object | No | Additional filters |
| `scheduleAt` | String | No | ISO datetime for scheduled sending |
| `testMode` | Boolean | No | Test mode (default: false) |

**Request Example:**
```json
{
  "subject": "Platform Update: New Features Available",
  "message": "Dear users,\n\nWe are excited to announce...",
  "targetAudience": "all",
  "filters": {
    "role": ["recruiter", "jobseeker"],
    "registrationDate": {
      "start": "2026-01-01T00:00:00.000Z",
      "end": "2026-01-31T23:59:59.000Z"
    }
  },
  "testMode": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Broadcast email queued successfully",
  "data": {
    "campaignId": "65f1234567890abcdef12345",
    "estimatedRecipients": 1250,
    "scheduledAt": "2026-01-29T17:30:00.000Z",
    "testMode": false
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid target audience or filters"
}
```

---

## Admin Routes Summary

### **Access Control**
- All admin routes require `Authorization: Bearer <admin_access_token>`
- Only users with `role: "admin"` can access these endpoints
- Admins cannot deactivate or delete their own accounts

### **Key Capabilities**
1. **User Management** - View, activate, deactivate, and delete user accounts
2. **Recruiter Verification** - Approve or reject recruiter verification requests
3. **Job Moderation** - Approve, reject, feature, or delete job postings
4. **Content Management** - Manage skills and job categories
5. **Analytics** - Access platform-wide statistics
6. **Communication** - Send broadcast emails to users

### **Status Codes**
| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / Validation error |
| `401` | Unauthorized / Invalid token |
| `403` | Forbidden / Insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g., skill in use) |
| `500` | Server error |

---

*Continue to [Recruiter Routes](#4-recruiter-routes) →*


## 4. Recruiter Routes

All recruiter routes require authentication with a recruiter role. Include the access token in the Authorization header.

**Required Headers:**
```
Authorization: Bearer <recruiter_access_token>
Content-Type: application/json (for JSON requests)
Content-Type: multipart/form-data (for file uploads)
```

---

### **4.1 Company Profile Management**

#### 4.1.1 Get My Company Profile

```http
GET /api/v1/recruiters/profile
```

**Description:** Retrieve the current recruiter's company profile.

**Headers:**
```
Authorization: Bearer <recruiter_access_token>
```

**Request Example:**
```http
GET /api/v1/recruiters/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "userId": "65f1234567890abcdef12346",
    "companyName": "Tech Corp",
    "companyLogo": "/uploads/logos/techcorp.png",
    "companyBanner": "/uploads/banners/techcorp-banner.jpg",
    "companyDescription": "Leading technology innovation company...",
    "industry": "Technology",
    "companySize": "100-500",
    "website": "https://techcorp.com",
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "zipCode": "94105"
    },
    "socialLinks": {
      "linkedin": "https://linkedin.com/company/techcorp",
      "twitter": "https://twitter.com/techcorp"
    },
    "isVerified": true,
    "verificationStatus": "verified",
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-29T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Recruiter profile not found"
}
```

---

#### 4.1.2 Create Company Profile
```http
POST /api/v1/recruiters/profile
```

**Description:** Create a new company profile for the recruiter.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `companyName` | String | Yes | Company name (max 200 characters) |
| `companyLogo` | String | No | URL to company logo |
| `companyBanner` | String | No | URL to company banner image |
| `industry` | String | Yes | Industry type |
| `companySize` | String | No | Company size range (1-10, 11-50, 51-200, 201-500, 501-1000, 1000+) |
| `companyDescription` | String | No | Company description (max 2000 characters) |
| `companyCulture` | String | No | Company culture description (max 1000 characters) |
| `foundedYear` | Number | No | Year the company was founded |
| `website` | String | No | Company website URL |
| `location` | Object | No | Company location details |
| `location.city` | String | No | City |
| `location.state` | String | No | State/Province |
| `location.country` | String | No | Country |
| `location.zipCode` | String | No | ZIP/Postal code |
| `location.address` | String | No | Full address (max 300 characters) |
| `contactPerson` | Object | No | Contact person details |
| `contactPerson.firstName` | String | No | Contact person's first name |
| `contactPerson.lastName` | String | No | Contact person's last name |
| `contactPerson.designation` | String | No | Contact person's job title |
| `contactPerson.email` | String | No | Contact person's email address |
| `contactPerson.phone` | String | No | Contact person's phone number |
| `socialLinks` | Object | No | Social media links |
| `socialLinks.linkedin` | String | No | LinkedIn profile URL |
| `socialLinks.twitter` | String | No | Twitter profile URL |
| `socialLinks.facebook` | String | No | Facebook profile URL |

**Request Example:**
```json
{
  "companyName": "Tech Corp",
  "companyLogo": "https://example.com/logo.png",
  "companyBanner": "https://example.com/banner.jpg",
  "companyDescription": "We are a leading technology company specializing in innovative software solutions...",
  "companyCulture": "We foster a culture of innovation, collaboration, and continuous learning...",
  "industry": "Technology",
  "companySize": "201-500",
  "foundedYear": 2015,
  "website": "https://techcorp.com",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "zipCode": "94105",
    "address": "123 Tech Street, San Francisco, CA 94105"
  },
  "contactPerson": {
    "firstName": "John",
    "lastName": "Doe",
    "designation": "HR Manager",
    "email": "john.doe@techcorp.com",
    "phone": "+1-555-123-4567"
  },
  "socialLinks": {
    "linkedin": "https://linkedin.com/company/techcorp",
    "twitter": "https://twitter.com/techcorp",
    "facebook": "https://facebook.com/techcorp"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Company profile created successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "userId": "65f1234567890abcdef12346",
    "companyName": "Tech Corp",
    "companyLogo": "https://example.com/logo.png",
    "companyBanner": "https://example.com/banner.jpg",
    "industry": "Technology",
    "companySize": "201-500",
    "companyDescription": "We are a leading technology company specializing in innovative software solutions...",
    "companyCulture": "We foster a culture of innovation, collaboration, and continuous learning...",
    "foundedYear": 2015,
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "zipCode": "94105",
      "address": "123 Tech Street, San Francisco, CA 94105"
    },
    "contactPerson": {
      "firstName": "John",
      "lastName": "Doe",
      "designation": "HR Manager",
      "email": "john.doe@techcorp.com",
      "phone": "+1-555-123-4567"
    },
    "website": "https://techcorp.com",
    "socialLinks": {
      "linkedin": "https://linkedin.com/company/techcorp",
      "twitter": "https://twitter.com/techcorp",
      "facebook": "https://facebook.com/techcorp"
    },
    "isVerified": false,
    "verificationStatus": "pending",
    "createdAt": "2026-01-29T18:00:00.000Z",
    "updatedAt": "2026-01-29T18:00:00.000Z"
  }
}
```

**Error Response (400 - Profile Already Exists):**
```json
{
  "success": false,
  "message": "Profile already exists for this user"
}
```

**Error Response (400 - Validation Error):**
```json
{
  "success": false,
  "message": "Company name is required, Industry is required"
}
```

**Error Response (400 - Duplicate Entry):**
```json
{
  "success": false,
  "message": "Duplicate field value entered"
}
```

---

#### 4.1.3 Update Company Profile
```http
PUT /api/v1/recruiters/profile
```

**Description:** Update the existing company profile. All fields are optional. Protected fields like `isVerified`, `verificationStatus`, `verifiedAt`, and `verifiedBy` cannot be modified through this endpoint.

**Request Body:** (All fields optional, same as Create endpoint)
```json
{
  "companyDescription": "Updated company description with more details about our services...",
  "companySize": "501-1000",
  "companyCulture": "Updated culture statement emphasizing work-life balance...",
  "website": "https://newtechcorp.com",
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "contactPerson": {
    "phone": "+1-555-987-6543"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company profile updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "userId": "65f1234567890abcdef12346",
    "companyName": "Tech Corp",
    "companyLogo": "https://example.com/logo.png",
    "companyDescription": "Updated company description with more details about our services...",
    "companyCulture": "Updated culture statement emphasizing work-life balance...",
    "companySize": "501-1000",
    "industry": "Technology",
    "foundedYear": 2015,
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001",
      "address": "123 Tech Street, San Francisco, CA 94105"
    },
    "contactPerson": {
      "firstName": "John",
      "lastName": "Doe",
      "designation": "HR Manager",
      "email": "john.doe@techcorp.com",
      "phone": "+1-555-987-6543"
    },
    "website": "https://newtechcorp.com",
    "socialLinks": {
      "linkedin": "https://linkedin.com/company/techcorp",
      "twitter": "https://twitter.com/techcorp"
    },
    "isVerified": false,
    "verificationStatus": "pending",
    "createdAt": "2026-01-29T18:00:00.000Z",
    "updatedAt": "2026-01-29T18:15:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Recruiter profile not found"
}
```

**Error Response (400 - Validation Error):**
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Server Error",
  "error": "Error details here"
}
```

**Notes:**
- The following fields are protected and cannot be modified through this endpoint:
  - `isVerified`
  - `verificationStatus`
  - `verifiedAt`
  - `verifiedBy`
  - `userId`
- These fields can only be modified through admin verification endpoints.

---

#### 4.1.4 Upload Company Logo

```http
POST /api/v1/recruiters/profile/logo
```

**Description:** Upload or update company logo image.

**Headers:**
```
Authorization: Bearer <recruiter_access_token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (PNG, JPG, JPEG) |

**Request Example:**
```http
POST /api/v1/recruiters/profile/logo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="logo.png"
Content-Type: image/png

[binary image data]
--boundary--
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company logo uploaded successfully",
  "data": {
    "companyLogo": "/uploads/logos/1738174800000-logo.png"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please upload a file"
}
```

---

#### 4.1.5 Upload Company Banner

```http
POST /api/v1/recruiters/profile/banner
```

**Description:** Upload or update company banner image.

**Headers:**
```
Authorization: Bearer <recruiter_access_token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (PNG, JPG, JPEG) |

**Request Example:**
```http
POST /api/v1/recruiters/profile/banner
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

[multipart form data with image file]
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company banner uploaded successfully",
  "data": {
    "companyBanner": "/uploads/banners/1738174900000-banner.jpg"
  }
}
```

---

#### 4.1.6 Get Verification Status

```http
GET /api/v1/recruiters/verification-status
```

**Description:** Check the current verification status of recruiter account.

**Request Example:**
```http
GET /api/v1/recruiters/verification-status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "isVerified": true,
    "verificationStatus": "verified",
    "verificationNotes": null
  }
}
```

**Response (Pending):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "isVerified": false,
    "verificationStatus": "pending",
    "verificationNotes": null
  }
}
```

**Response (Rejected):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "isVerified": false,
    "verificationStatus": "rejected",
    "verificationNotes": "Company website is not accessible. Please provide valid documentation."
  }
}
```

---

### **4.2 Job Management**

#### 4.2.1 Create Job Posting
```http
POST /api/v1/jobs
```

**Description:** Create a new job posting. Requires a verified recruiter account. All jobs are created with `draft` status by default.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Job title (max 200 characters) |
| `description` | String | Yes | Detailed job description (max 5000 characters) |
| `requiredSkills` | Array | No | Array of Skill ObjectIds |
| `qualifications` | Array | No | Array of qualification strings (max 500 chars each) |
| `experienceLevel` | String | Yes | Experience level: `entry`, `mid`, `senior`, `lead`, `executive` |
| `experienceYears` | Object | No | Experience years range |
| `experienceYears.min` | Number | No | Minimum years of experience (default: 0) |
| `experienceYears.max` | Number | No | Maximum years of experience |
| `education` | Object | No | Education requirements |
| `education.minDegree` | String | No | Minimum degree: `high-school`, `associate`, `bachelor`, `master`, `doctorate` |
| `education.preferredFields` | Array | No | Array of preferred field of study strings |
| `salary` | Object | No | Salary information |
| `salary.min` | Number | No | Minimum salary |
| `salary.max` | Number | No | Maximum salary |
| `salary.currency` | String | No | Currency code (default: USD) |
| `salary.isVisible` | Boolean | No | Whether to show salary publicly (default: true) |
| `location` | Object | No | Job location |
| `location.city` | String | No | City |
| `location.state` | String | No | State/Province |
| `location.country` | String | No | Country |
| `location.isRemote` | Boolean | No | Remote job flag (default: false) |
| `location.remoteType` | String | No | Remote type: `fully-remote`, `hybrid`, `onsite` (required if isRemote is true) |
| `employmentType` | String | Yes | Employment type: `full-time`, `part-time`, `contract`, `internship` |
| `numberOfOpenings` | Number | No | Number of open positions (default: 1, min: 1) |
| `applicationDeadline` | Date | No | Application deadline (must be in future) |
| `screeningQuestions` | Array | No | Array of screening question objects |
| `screeningQuestions[].question` | String | Yes | The screening question (max 500 characters) |
| `screeningQuestions[].isRequired` | Boolean | No | Whether answer is required (default: false) |
| `category` | String | No | JobCategory ObjectId |

**Request Example:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are seeking an experienced full-stack developer to join our growing engineering team. You will be responsible for designing and developing scalable web applications, leading technical architecture decisions, and mentoring junior developers.",
  "requiredSkills": [
    "65f1234567890abcdef12301",
    "65f1234567890abcdef12302",
    "65f1234567890abcdef12303"
  ],
  "qualifications": [
    "5+ years of full-stack development experience",
    "Expert knowledge of JavaScript, React, and Node.js",
    "Experience with cloud platforms (AWS/GCP)",
    "Strong problem-solving and communication skills"
  ],
  "experienceLevel": "senior",
  "experienceYears": {
    "min": 5,
    "max": 10
  },
  "education": {
    "minDegree": "bachelor",
    "preferredFields": ["Computer Science", "Software Engineering", "Information Technology"]
  },
  "salary": {
    "min": 120000,
    "max": 180000,
    "currency": "USD",
    "isVisible": true
  },
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "isRemote": true,
    "remoteType": "hybrid"
  },
  "employmentType": "full-time",
  "numberOfOpenings": 2,
  "applicationDeadline": "2026-03-01T23:59:59.000Z",
  "screeningQuestions": [
    {
      "question": "What is your experience with React and Node.js?",
      "isRequired": true
    },
    {
      "question": "Are you authorized to work in the United States?",
      "isRequired": true
    },
    {
      "question": "What is your expected salary range?",
      "isRequired": false
    }
  ],
  "category": "65f1234567890abcdef12300"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job posting created successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Senior Full Stack Developer",
    "description": "We are seeking an experienced full-stack developer...",
    "requiredSkills": [
      {
        "_id": "65f1234567890abcdef12301",
        "name": "JavaScript"
      },
      {
        "_id": "65f1234567890abcdef12302",
        "name": "React"
      },
      {
        "_id": "65f1234567890abcdef12303",
        "name": "Node.js"
      }
    ],
    "qualifications": [
      "5+ years of full-stack development experience",
      "Expert knowledge of JavaScript, React, and Node.js"
    ],
    "experienceLevel": "senior",
    "experienceYears": {
      "min": 5,
      "max": 10
    },
    "education": {
      "minDegree": "bachelor",
      "preferredFields": ["Computer Science", "Software Engineering"]
    },
    "salary": {
      "min": 120000,
      "max": 180000,
      "currency": "USD",
      "isVisible": true
    },
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "isRemote": true,
      "remoteType": "hybrid"
    },
    "employmentType": "full-time",
    "numberOfOpenings": 2,
    "applicationDeadline": "2026-03-01T23:59:59.000Z",
    "screeningQuestions": [
      {
        "question": "What is your experience with React and Node.js?",
        "isRequired": true,
        "_id": "65f1234567890abcdef12350"
      }
    ],
    "category": {
      "_id": "65f1234567890abcdef12300",
      "name": "Software Development"
    },
    "status": "draft",
    "recruiterId": {
      "_id": "65f1234567890abcdef12346",
      "name": "John Recruiter",
      "email": "john@techcorp.com"
    },
    "companyId": {
      "_id": "65f1234567890abcdef12347",
      "companyName": "Tech Corp",
      "companyLogo": "https://example.com/logo.png",
      "industry": "Technology"
    },
    "views": 0,
    "applicationCount": 0,
    "isFeatured": false,
    "createdAt": "2026-01-29T18:30:00.000Z",
    "updatedAt": "2026-01-29T18:30:00.000Z"
  }
}
```

**Error Response (403 - Unverified Recruiter):**
```json
{
  "success": false,
  "message": "Your recruiter account must be verified before posting jobs."
}
```

**Error Response (404 - No Recruiter Profile):**
```json
{
  "success": false,
  "message": "Recruiter profile not found. Please complete your profile first."
}
```

**Error Response (400 - Validation Error):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Job title is required",
    "Job description is required",
    "Experience level is required",
    "Employment type is required"
  ]
}
```

**Error Response (400 - Invalid Enum Value):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "invalid-level is not a valid experience level",
    "freelance is not a valid employment type"
  ]
}
```

**Error Response (400 - Invalid Salary Range):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Maximum salary must be greater than or equal to minimum salary"
  ]
}
```

**Error Response (400 - Invalid Experience Range):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Maximum experience must be greater than or equal to minimum experience"
  ]
}
```

**Error Response (400 - Missing Remote Type):**
```json
{
  "success": false,
  "message": "Error creating job posting",
  "error": "Remote type must be specified for remote jobs"
}
```

**Error Response (400 - Invalid Deadline):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Application deadline must be in the future"
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error creating job posting",
  "error": "Internal server error"
}
```

**Notes:**
- Jobs are always created with `draft` status
- The following fields are **protected** and cannot be set during creation:
  - `recruiterId` (automatically set from authenticated user)
  - `companyId` (automatically set from recruiter's profile)
  - `status` (always starts as `draft`)
  - `views`, `applicationCount`
  - `moderatedBy`, `moderatedAt`, `moderationNotes`
  - `postedAt`, `closedAt`
  - `isFeatured` (only admins can set)
- If `location.isRemote` is `true`, `location.remoteType` is required
- `applicationDeadline` must be a future date
- Maximum values must be greater than or equal to minimum values for salary and experience ranges

---



#### 4.2.2 Get My Jobs

```http
GET /api/v1/jobs/my-jobs
```

**Description:** Get all job postings created by the recruiter.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Jobs per page |
| `status` | String | No | - | Filter by status |
| `sortBy` | String | No | `createdAt` | Sort field |
| `order` | String | No | `desc` | Sort order |

**Request Example:**
```http
GET /api/v1/jobs/my-jobs?page=1&limit=20&status=active&sortBy=postedAt&order=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 12,
  "totalJobs": 45,
  "totalPages": 3,
  "currentPage": 1,
  "statusSummary": {
    "active": 12,
    "pending-approval": 3,
    "closed": 28,
    "rejected": 2
  },
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Senior Full Stack Developer",
      "status": "active",
      "views": 234,
      "applicationCount": 42,
      "postedAt": "2026-01-20T10:00:00.000Z",
      "companyId": {
        "_id": "...",
        "companyName": "Tech Corp",
        "companyLogo": "/uploads/logos/techcorp.png"
      },
      "requiredSkills": [
        { "_id": "...", "name": "JavaScript" },
        { "_id": "...", "name": "React" }
      ]
    }
    // ... more jobs
  ]
}
```

---

#### 4.2.3 Update Job Posting
```http
PUT /api/v1/jobs/:id
```

**Description:** Update an existing job posting. Only the job owner (recruiter who created it) can update the job. Recruiters can only change status from `draft` to `pending-approval`.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ObjectId |

**Request Body:** (All fields optional, same fields as Create endpoint except protected fields)

**Request Example:**
```json
{
  "title": "Senior Full Stack Developer (Updated)",
  "description": "Updated job description with more details...",
  "salary": {
    "min": 130000,
    "max": 190000,
    "currency": "USD"
  },
  "numberOfOpenings": 3,
  "screeningQuestions": [
    {
      "question": "Updated screening question?",
      "isRequired": true
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job posting updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Senior Full Stack Developer (Updated)",
    "description": "Updated job description with more details...",
    "salary": {
      "min": 130000,
      "max": 190000,
      "currency": "USD",
      "isVisible": true
    },
    "numberOfOpenings": 3,
    "status": "draft",
    "updatedAt": "2026-01-29T19:00:00.000Z"
  }
}
```

**Submit for Approval Example:**
```json
{
  "status": "pending-approval"
}
```

**Submit for Approval Response (200):**
```json
{
  "success": true,
  "message": "Job posting updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Senior Full Stack Developer",
    "status": "pending-approval",
    "updatedAt": "2026-01-29T19:05:00.000Z"
  }
}
```

**Error Response (400 - Invalid Job ID):**
```json
{
  "success": false,
  "message": "Invalid job ID"
}
```

**Error Response (404 - Job Not Found):**
```json
{
  "success": false,
  "message": "Job not found"
}
```

**Error Response (403 - Not Authorized):**
```json
{
  "success": false,
  "message": "You are not authorized to update this job"
}
```

**Error Response (403 - Invalid Status Change):**
```json
{
  "success": false,
  "message": "You can only submit draft jobs for approval. Other status changes require admin action."
}
```

**Error Response (400 - Validation Error):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Job title cannot exceed 200 characters",
    "Maximum salary must be greater than or equal to minimum salary"
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error updating job posting",
  "error": "Internal server error"
}
```

**Notes:**
- Only the recruiter who created the job can update it
- The following fields are **protected** and cannot be updated:
  - `recruiterId`, `companyId`
  - `views`, `applicationCount`
  - `moderatedBy`, `moderatedAt`, `moderationNotes`
  - `postedAt`, `closedAt`
  - `isFeatured`
  - `status` (except draft → pending-approval transition)
- Recruiters can only change job status from `draft` to `pending-approval`
- All other status changes (`pending-approval` → `active`, `active` → `closed`, etc.) require admin action
- All validation rules from the Create endpoint apply

---

#### 4.2.4 Delete Job Posting

```http
DELETE /api/v1/jobs/:id
```

**Description:** Delete a job posting (must be owner).

**Request Example:**
```http
DELETE /api/v1/jobs/65f1234567890abcdef12345
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job posting deleted successfully"
}
```

---

#### 4.2.5 Close Job Posting

```http
PATCH /api/v1/jobs/:id/close
```

**Description:** Close a job posting (mark as filled or closed).

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | String | No | `filled` or `closed` (default: `closed`) |

**Request Example:**
```json
{
  "reason": "filled"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job marked as filled successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Senior Full Stack Developer",
    "status": "filled",
    "closedAt": "2026-01-29T19:15:00.000Z"
  }
}
```

---

### **4.3 Application Management**

#### 4.3.1 Get Applications for Job

```http
GET /api/v1/applications/job/:jobId
```

**Description:** Get all applications for a specific job (must be job owner).

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Applications per page |
| `status` | String | No | - | Filter by application status |

**Request Example:**
```http
GET /api/v1/applications/job/65f1234567890abcdef12345?page=1&limit=20&status=shortlisted
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "_id": "65f1234567890abcdef12400",
        "jobSeekerId": {
          "_id": "...",
          "name": "Jane Candidate",
          "email": "jane@example.com"
        },
        "coverLetter": "I am very interested in this position...",
        "status": "shortlisted",
        "appliedAt": "2026-01-28T14:00:00.000Z",
        "rating": 4.5,
        "recruiterNotes": [
          {
            "note": "Strong candidate, technical skills match well",
            "createdAt": "2026-01-29T10:00:00.000Z"
          }
        ]
      }
      // ... more applications
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "pages": 3
    },
    "jobStats": {
      "total": 42,
      "byStatus": {
        "submitted": 15,
        "reviewed": 10,
        "shortlisted": 8,
        "interviewing": 5,
        "rejected": 3,
        "offered": 1
      }
    }
  }
}
```

---

#### 4.3.2 Update Application Status

```http
PATCH /api/v1/applications/:id/status
```

**Description:** Update the status of a job application.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | Yes | `reviewed`, `shortlisted`, `interviewing`, `rejected`, `offered` |
| `notes` | String | No | Status update notes |

**Request Example:**
```json
{
  "status": "shortlisted",
  "notes": "Candidate has excellent technical background and communication skills"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12400",
    "status": "shortlisted",
    "updatedAt": "2026-01-29T19:30:00.000Z"
  }
}
```

---

#### 4.3.3 Add Recruiter Notes

```http
POST /api/v1/applications/:id/notes
```

**Description:** Add private notes to an application.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `note` | String | Yes | Note content (max 1000 chars) |

**Request Example:**
```json
{
  "note": "Candidate demonstrated strong problem-solving skills during phone screen. Schedule technical interview."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "_id": "65f1234567890abcdef12400",
    "recruiterNotes": [
      {
        "note": "Candidate demonstrated strong problem-solving skills...",
        "createdAt": "2026-01-29T19:45:00.000Z"
      }
    ]
  }
}
```

---

#### 4.3.4 Rate Candidate

```http
PATCH /api/v1/applications/:id/rating
```

**Description:** Assign a rating to a candidate (1-5 stars).

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | Number | Yes | Rating value (1-5) |

**Request Example:**
```json
{
  "rating": 4.5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate rated successfully",
  "data": {
    "_id": "65f1234567890abcdef12400",
    "rating": 4.5
  }
}
```

---

#### 4.3.5 Schedule Interview

```http
POST /api/v1/applications/:id/schedule-interview
```

**Description:** Schedule an interview for a candidate.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scheduledAt` | String | Yes | ISO datetime for interview |
| `meetingLink` | String | No | Video call or meeting URL |
| `notes` | String | No | Interview notes (max 1000 chars) |

**Request Example:**
```json
{
  "scheduledAt": "2026-02-05T14:00:00.000Z",
  "meetingLink": "https://zoom.us/j/1234567890",
  "notes": "Technical interview - 1 hour. Focus on system design and coding challenges."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Interview scheduled successfully",
  "data": {
    "_id": "65f1234567890abcdef12400",
    "interview": {
      "scheduledAt": "2026-02-05T14:00:00.000Z",
      "meetingLink": "https://zoom.us/j/1234567890",
      "notes": "Technical interview - 1 hour..."
    },
    "status": "interviewing"
  }
}
```

---

### **4.4 Recruiter Analytics**

#### 4.4.1 Get Dashboard Analytics

```http
GET /api/v1/analytics/recruiter/dashboard
```

**Description:** Get comprehensive dashboard analytics for the recruiter.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | String | No | `30d` | Time period: `7d`, `30d`, `90d`, `1y` |

**Request Example:**
```http
GET /api/v1/analytics/recruiter/dashboard?period=30d
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalJobs": 45,
      "activeJobs": 12,
      "totalViews": 15234,
      "totalApplications": 456
    },
    "jobs": [
      {
        "_id": "65f1234567890abcdef12345",
        "title": "Senior Full Stack Developer",
        "status": "active",
        "views": 234,
        "applicationCount": 42,
        "postedAt": "2026-01-20T10:00:00.000Z"
      }
      // ... top 5 recent jobs
    ],
    "recentApplications": [
      {
        "_id": "65f1234567890abcdef12400",
        "jobId": {
          "_id": "...",
          "title": "Senior Full Stack Developer"
        },
        "jobSeekerId": {
          "_id": "...",
          "firstName": "Jane",
          "lastName": "Candidate"
        },
        "appliedAt": "2026-01-29T15:00:00.000Z"
      }
      // ... 5 most recent applications
    ]
  }
}
```

---

#### 4.4.2 Get Job Performance Metrics

```http
GET /api/v1/analytics/recruiter/job/:jobId
```

**Description:** Get detailed performance metrics for a specific job.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | String | No | `30d` | Time period for analytics |

**Request Example:**
```http
GET /api/v1/analytics/recruiter/job/65f1234567890abcdef12345?period=30d
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "jobSummary": {
      "title": "Senior Full Stack Developer",
      "status": "active",
      "postedAt": "2026-01-20T10:00:00.000Z",
      "daysActive": 9
    },
    "traffic": {
      "daily": [
        { "date": "2026-01-20", "views": 45 },
        { "date": "2026-01-21", "views": 67 },
        { "date": "2026-01-22", "views": 89 }
      ],
      "summary": {
        "totalViews": 234,
        "uniqueVisitors": 189,
        "avgViewsPerDay": 26
      },
      "trends": {
        "currentPeriodViews": 234,
        "previousPeriodViews": 145,
        "percentageChange": 61.4
      }
    },
    "applications": {
      "total": 42,
      "funnel": {
        "submitted": 42,
        "reviewed": 35,
        "shortlisted": 15,
        "interviewing": 8,
        "offered": 2,
        "hired": 1,
        "rejected": 10
      }
    }
  }
}
```

---

### **4.5 Candidate Communication**

#### 4.5.1 Contact Candidate

```http
POST /api/v1/emails/contact-candidate
```

**Description:** Send an email directly to a job candidate.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `candidateId` | String | Yes | User ID of the candidate |
| `subject` | String | Yes | Email subject (max 200 chars) |
| `message` | String | Yes | Email message (max 5000 chars) |
| `applicationId` | String | No | Application ID for context |
| `ccEmails` | Array | No | CC email addresses |

**Request Example:**
```json
{
  "candidateId": "65f1234567890abcdef12450",
  "subject": "Interview Invitation - Senior Full Stack Developer",
  "message": "Dear Jane,\n\nWe were impressed with your application and would like to invite you for an interview...",
  "applicationId": "65f1234567890abcdef12400",
  "ccEmails": ["hr@techcorp.com"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "emailId": "65f1234567890abcdef12500",
    "sentAt": "2026-01-29T20:00:00.000Z"
  }
}
```

**Error Response (429):**
```json
{
  "success": false,
  "message": "Rate limit exceeded"
}
```

---

### **4.6 Job Seeker Discovery**

#### 4.6.1 Search Job Seekers

```http
GET /api/v1/jobseekers/search
```

**Description:** Search and filter job seeker profiles.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `skills` | String | No | - | Comma-separated skill IDs |
| `experienceYears` | Number | No | - | Minimum years of experience |
| `location` | String | No | - | Location search |
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Results per page |

**Request Example:**
```http
GET /api/v1/jobseekers/search?skills=65f123,65f124&experienceYears=3&location=San Francisco&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "jobSeekers": [
      {
        "_id": "65f1234567890abcdef12450",
        "userId": {
          "_id": "...",
          "name": "Jane Candidate",
          "email": "jane@example.com"
        },
        "headline": "Full Stack Developer | React & Node.js Expert",
        "experienceYears": 5,
        "location": {
          "city": "San Francisco",
          "state": "CA"
        },
        "skills": [
          { "_id": "...", "name": "JavaScript" },
          { "_id": "...", "name": "React" }
        ],
        "resume": "/uploads/resumes/jane-resume.pdf"
      }
      // ... more job seekers
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

#### 4.6.2 View Job Seeker Profile

```http
GET /api/v1/jobseekers/:id/profile
```

**Description:** View detailed profile of a specific job seeker.

**Request Example:**
```http
GET /api/v1/jobseekers/65f1234567890abcdef12450/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12450",
    "userId": {
      "_id": "...",
      "name": "Jane Candidate",
      "email": "jane@example.com"
    },
    "headline": "Full Stack Developer | React & Node.js Expert",
    "bio": "Passionate developer with 5 years of experience...",
    "experienceYears": 5,
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "skills": [
      { "_id": "...", "name": "JavaScript" },
      { "_id": "...", "name": "React" },
      { "_id": "...", "name": "Node.js" }
    ],
    "resume": "/uploads/resumes/jane-resume.pdf",
    "portfolio": [
      {
        "title": "E-commerce Platform",
        "description": "Built a full-stack e-commerce platform...",
        "url": "https://project.com",
        "image": "/uploads/portfolio/project1.png"
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science in Computer Science",
        "institution": "Stanford University",
        "graduationYear": 2019
      }
    ],
    "workExperience": [
      {
        "title": "Senior Developer",
        "company": "Tech Startup",
        "startDate": "2021-01-01",
        "endDate": null,
        "current": true,
        "description": "Lead development of core platform features..."
      }
    ]
  }
}
```

---

## Recruiter Routes Summary

### **Access Requirements**
- All recruiter routes require `Authorization: Bearer <recruiter_access_token>`
- Users must have `role: "recruiter"`
- Profile must be created before posting jobs
- Account must be verified by admin to post jobs

### **Key Workflows**

1. **Getting Started**:
   - Create company profile → Upload logo/banner → Wait for admin verification → Start posting jobs

2. **Job Posting**:
   - Create job → Job goes to pending-approval → Admin approves → Job becomes active

3. **Application Management**:
   - View applications → Update status → Add notes → Rate candidates → Schedule interviews → Contact candidates

4. **Analytics**:
   - Monitor dashboard → Track job performance → Analyze application trends

### **Status Codes**
| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / Validation error |
| `401` | Unauthorized / Invalid token |
| `403` | Forbidden / Not verified / Not owner |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Server error |

---

*Continue to [Job Seeker Routes](#5-job-seeker-routes) →*


## 5. Job Seeker Routes

All job seeker routes require authentication with a job seeker role. Include the access token in the Authorization header.

**Required Headers:**
```
Authorization: Bearer <jobseeker_access_token>
Content-Type: application/json (for JSON requests)
Content-Type: multipart/form-data (for file uploads)
```

---

### **5.1 Profile Management**

#### 5.1.1 Get My Profile

```http
GET /api/v1/jobseekers/profile
```

**Description:** Retrieve the current job seeker's profile.

**Request Example:**
```http
GET /api/v1/jobseekers/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "userId": "65f1234567890abcdef12346",
    "firstName": "Jane",
    "lastName": "Candidate",
    "phone": "+1234567890",
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "zipCode": "94105"
    },
    "profilePicture": "/uploads/profiles/jane.jpg",
    "headline": "Full Stack Developer | React & Node.js Expert",
    "summary": "Passionate developer with 5 years of experience...",
    "workExperience": [
      {
        "title": "Senior Developer",
        "company": "Tech Startup",
        "location": "San Francisco, CA",
        "startDate": "2021-01-01",
        "endDate": null,
        "current": true,
        "description": "Lead development of core platform features..."
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science in Computer Science",
        "institution": "Stanford University",
        "fieldOfStudy": "Computer Science",
        "graduationYear": 2019,
        "grade": "3.8 GPA"
      }
    ],
    "skills": [
      { "_id": "...", "name": "JavaScript", "category": "Programming Languages" },
      { "_id": "...", "name": "React", "category": "Frontend Frameworks" }
    ],
    "certifications": [
      {
        "name": "AWS Certified Developer",
        "issuingOrganization": "Amazon Web Services",
        "issueDate": "2023-06-01",
        "credentialId": "AWS-12345"
      }
    ],
    "resume": {
      "fileName": "jane_resume.pdf",
      "fileUrl": "/uploads/resumes/jane_resume.pdf",
      "uploadedAt": "2026-01-15T10:00:00.000Z"
    },
    "portfolio": [
      {
        "title": "E-commerce Platform",
        "description": "Built a full-stack e-commerce platform...",
        "projectUrl": "https://project.com",
        "fileUrl": "/uploads/portfolio/project1.png"
      }
    ],
    "preferences": {
      "jobType": ["Full-Time", "Contract"],
      "remoteWorkPreference": "Remote",
      "desiredSalaryMin": 100000,
      "desiredSalaryMax": 150000
    },
    "profileCompleteness": 85,
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-29T12:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Profile not found. Please create your profile first."
}
```

---

#### 5.1.2 Create Profile

```http
POST /api/v1/jobseekers/profile
```

**Description:** Create a new job seeker profile.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | String | Yes | First name |
| `lastName` | String | Yes | Last name |
| `phone` | String | No | Phone number |
| `location` | Object | Yes | Location details |
| `headline` | String | Yes | Professional headline (max 200 chars) |
| `summary` | String | No | Professional summary (max 2000 chars) |
| `workExperience` | Array | No | Work experience entries |
| `education` | Array | No | Education entries |
| `skills` | Array | No | Array of skill IDs |
| `certifications` | Array | No | Certification entries |
| `socialLinks` | Object | No | LinkedIn, GitHub, etc. |
| `preferences` | Object | No | Job preferences |

**Request Example:**
```json
{
  "firstName": "Jane",
  "lastName": "Candidate",
  "phone": "+1234567890",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "zipCode": "94105"
  },
  "headline": "Full Stack Developer | React & Node.js Expert",
  "summary": "Passionate developer with 5 years of experience in building scalable web applications...",
  "skills": [
    "65f1234567890abcdef12301",
    "65f1234567890abcdef12302"
  ],
  "preferences": {
    "jobType": ["Full-Time", "Contract"],
    "remoteWorkPreference": "Remote",
    "desiredSalaryMin": 100000,
    "desiredSalaryMax": 150000,
    "willingToRelocate": true
  },
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/jane-candidate",
    "github": "https://github.com/janecandidate",
    "portfolio": "https://janecandidate.com"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "userId": "65f1234567890abcdef12346",
    "firstName": "Jane",
    "lastName": "Candidate",
    "headline": "Full Stack Developer | React & Node.js Expert",
    "profileCompleteness": 45,
    "createdAt": "2026-01-29T20:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Profile already exists. Use PUT to update."
}
```

---

#### 5.1.3 Update Profile

```http
PUT /api/v1/jobseekers/profile
```

**Description:** Update existing job seeker profile.

**Request Body:** (Same fields as Create, all optional)
```json
{
  "headline": "Senior Full Stack Developer | 5+ Years Experience",
  "summary": "Updated professional summary with recent achievements...",
  "workExperience": [
    {
      "title": "Senior Developer",
      "company": "Tech Startup",
      "location": "San Francisco, CA",
      "startDate": "2021-01-01",
      "endDate": null,
      "current": true,
      "description": "Lead development of core platform features, mentored junior developers..."
    },
    {
      "title": "Full Stack Developer",
      "company": "Previous Company",
      "location": "New York, NY",
      "startDate": "2019-06-01",
      "endDate": "2020-12-31",
      "current": false,
      "description": "Developed and maintained multiple web applications..."
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "institution": "Stanford University",
      "fieldOfStudy": "Computer Science",
      "graduationYear": 2019,
      "grade": "3.8 GPA"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "headline": "Senior Full Stack Developer | 5+ Years Experience",
    "profileCompleteness": 75,
    "updatedAt": "2026-01-29T20:30:00.000Z"
  }
}
```

---

### **5.2 Resume & Portfolio Management**

#### 5.2.1 Upload Resume

```http
POST /api/v1/jobseekers/profile/resume
```

**Description:** Upload resume file (PDF, DOC, DOCX).

**Headers:**
```
Authorization: Bearer <jobseeker_access_token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | File | Yes | Resume file (PDF/DOC/DOCX, max 5MB) |

**Request Example:**
```http
POST /api/v1/jobseekers/profile/resume
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

[multipart form data with resume file]
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "fileName": "jane_resume.pdf",
    "fileUrl": "/uploads/resumes/1738175400000-jane_resume.pdf",
    "uploadedAt": "2026-01-29T20:43:20.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please upload a resume file"
}
```

---

#### 5.2.2 Delete Resume

```http
DELETE /api/v1/jobseekers/profile/resume
```

**Description:** Delete the uploaded resume file.

**Request Example:**
```http
DELETE /api/v1/jobseekers/profile/resume
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

---

#### 5.2.3 Upload Video Resume

```http
POST /api/v1/jobseekers/profile/video-resume
```

**Description:** Upload video resume (MP4, AVI, MOV).

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video` | File | Yes | Video file (MP4/AVI/MOV, max 50MB) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Video resume uploaded successfully",
  "data": {
    "fileName": "jane_video_resume.mp4",
    "fileUrl": "/uploads/videos/1738175500000-jane_video_resume.mp4",
    "uploadedAt": "2026-01-29T20:45:00.000Z"
  }
}
```

---

#### 5.2.4 Delete Video Resume

```http
DELETE /api/v1/jobseekers/profile/video-resume
```

**Description:** Delete the uploaded video resume.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Video resume deleted successfully"
}
```

---

#### 5.2.5 Add Portfolio Item

```http
POST /api/v1/jobseekers/profile/portfolio
```

**Description:** Add a portfolio project with optional image/file.

**Headers:**
```
Authorization: Bearer <jobseeker_access_token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Project title |
| `description` | String | No | Project description (max 1000 chars) |
| `projectUrl` | String | No | Live project URL |
| `portfolioFile` | File | No | Project image/screenshot |

**Request Example:**
```http
POST /api/v1/jobseekers/profile/portfolio
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

title=E-commerce Platform
description=Built a full-stack e-commerce platform with React, Node.js, and MongoDB
projectUrl=https://myproject.com
file=[binary image data]
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Portfolio item added successfully",
  "data": {
    "_id": "65f1234567890abcdef12400",
    "title": "E-commerce Platform",
    "description": "Built a full-stack e-commerce platform...",
    "projectUrl": "https://myproject.com",
    "fileUrl": "/uploads/portfolio/1738175600000-project.png"
  }
}
```

---

#### 5.2.6 Delete Portfolio Item

```http
DELETE /api/v1/jobseekers/profile/portfolio/:itemId
```

**Description:** Delete a specific portfolio item.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | String | Yes | Portfolio item ID |

**Request Example:**
```http
DELETE /api/v1/jobseekers/profile/portfolio/65f1234567890abcdef12400
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Portfolio item deleted successfully"
}
```

---

### **5.3 Job Applications**

#### 5.3.1 Apply to Job

```http
POST /api/v1/applications
```

**Description:** Submit a job application.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobId` | String | Yes | Job ID to apply to |
| `coverLetter` | String | No | Cover letter (max 2000 chars) |
| `screeningAnswers` | Array | No | Answers to screening questions |
| `resumeUsed` | Object | No | Specific resume to use (defaults to profile resume) |

**Request Example:**
```json
{
  "jobId": "65f1234567890abcdef12345",
  "coverLetter": "Dear Hiring Manager,\n\nI am very interested in the Senior Full Stack Developer position...",
  "screeningAnswers": [
    {
      "question": "Do you have 5+ years of experience with React?",
      "answer": "Yes, I have 6 years of professional experience with React..."
    },
    {
      "question": "What is your expected salary range?",
      "answer": "$120,000 - $150,000"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "65f1234567890abcdef12500",
    "jobId": "65f1234567890abcdef12345",
    "jobSeekerId": "65f1234567890abcdef12346",
    "recruiterId": "65f1234567890abcdef12347",
    "status": "submitted",
    "appliedAt": "2026-01-29T21:00:00.000Z",
    "coverLetter": "Dear Hiring Manager...",
    "resumeUsed": {
      "fileName": "jane_resume.pdf",
      "fileUrl": "/uploads/resumes/jane_resume.pdf"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "You have already applied to this job"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please complete your job seeker profile before applying"
}
```

---

#### 5.3.2 Get My Applications

```http
GET /api/v1/applications/my-applications
```

**Description:** Get all applications submitted by the job seeker.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | String | No | - | Filter by status |
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Applications per page |

**Request Example:**
```http
GET /api/v1/applications/my-applications?status=interviewing&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "65f1234567890abcdef12500",
      "jobId": {
        "_id": "65f1234567890abcdef12345",
        "title": "Senior Full Stack Developer",
        "company": "Tech Corp",
        "location": {
          "city": "San Francisco",
          "state": "CA"
        },
        "employmentType": "Full-Time",
        "salary": {
          "min": 120000,
          "max": 180000,
          "currency": "USD"
        }
      },
      "status": "interviewing",
      "appliedAt": "2026-01-29T21:00:00.000Z",
      "lastUpdated": "2026-01-30T10:00:00.000Z",
      "interviewDetails": {
        "scheduledAt": "2026-02-05T14:00:00.000Z",
        "meetingLink": "https://zoom.us/j/1234567890",
        "notes": "Technical interview - 1 hour"
      }
    }
    // ... more applications
  ]
}
```

---

#### 5.3.3 Get Application Details

```http
GET /api/v1/applications/:id
```

**Description:** Get details of a specific application.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Application ID |

**Request Example:**
```http
GET /api/v1/applications/65f1234567890abcdef12500
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12500",
    "jobId": {
      "_id": "65f1234567890abcdef12345",
      "title": "Senior Full Stack Developer",
      "company": "Tech Corp",
      "location": { "city": "San Francisco", "state": "CA" },
      "employmentType": "Full-Time",
      "salary": { "min": 120000, "max": 180000, "currency": "USD" }
    },
    "jobSeekerId": {
      "_id": "...",
      "firstName": "Jane",
      "lastName": "Candidate",
      "email": "jane@example.com"
    },
    "recruiterId": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Recruiter",
      "email": "john@techcorp.com"
    },
    "status": "interviewing",
    "appliedAt": "2026-01-29T21:00:00.000Z",
    "lastUpdated": "2026-01-30T10:00:00.000Z",
    "coverLetter": "Dear Hiring Manager...",
    "screeningAnswers": [...],
    "statusHistory": [
      { "status": "submitted", "timestamp": "2026-01-29T21:00:00.000Z" },
      { "status": "reviewed", "timestamp": "2026-01-30T09:00:00.000Z" },
      { "status": "interviewing", "timestamp": "2026-01-30T10:00:00.000Z" }
    ],
    "interviewDetails": {
      "scheduledAt": "2026-02-05T14:00:00.000Z",
      "meetingLink": "https://zoom.us/j/1234567890",
      "notes": "Technical interview - 1 hour"
    },
    "rating": 4.5
  }
}
```

---

#### 5.3.4 Withdraw Application

```http
PATCH /api/v1/applications/:id/withdraw
```

**Description:** Withdraw a submitted application.

**Request Example:**
```http
PATCH /api/v1/applications/65f1234567890abcdef12500/withdraw
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application withdrawn successfully",
  "data": {
    "_id": "65f1234567890abcdef12500",
    "status": "withdrawn",
    "withdrawnAt": "2026-01-29T21:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot withdraw application in current status"
}
```

---

### **5.4 Saved Jobs**

#### 5.4.1 Get Saved Jobs

```http
GET /api/v1/saved-jobs
```

**Description:** Retrieve all jobs saved by the job seeker.

**Request Example:**
```http
GET /api/v1/saved-jobs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 8,
  "stats": {
    "totalSaved": 8,
    "savedThisWeek": 3,
    "savedThisMonth": 5
  },
  "data": [
    {
      "_id": "65f1234567890abcdef12600",
      "jobId": {
        "_id": "65f1234567890abcdef12345",
        "title": "Senior Full Stack Developer",
        "company": "Tech Corp",
        "location": {
          "city": "San Francisco",
          "state": "CA",
          "isRemote": true
        },
        "salary": {
          "min": 120000,
          "max": 180000,
          "currency": "USD"
        },
        "employmentType": "Full-Time",
        "postedAt": "2026-01-20T10:00:00.000Z"
      },
      "savedAt": "2026-01-28T15:00:00.000Z"
    }
    // ... more saved jobs
  ]
}
```

---

#### 5.4.2 Save Job

```http
POST /api/v1/saved-jobs
```

**Description:** Save a job for later viewing.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobId` | String | Yes | Job ID to save |

**Request Example:**
```json
{
  "jobId": "65f1234567890abcdef12345"
}
```

**Success Response (201):**
``` json
{
  "success": true,
  "message": "Job saved successfully",
  "data": {
    "_id": "65f1234567890abcdef12600",
    "jobSeekerId": "65f1234567890abcdef12346",
    "jobId": "65f1234567890abcdef12345",
    "savedAt": "2026-01-29T21: 45:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "You have already saved this job"
}
```

---

#### 5.4.3 Unsave Job

```http
DELETE /api/v1/saved-jobs/:jobId
```

**Description:** Remove a job from saved list.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | String | Yes | Job ID to unsave |

**Request Example:**
```http
DELETE /api/v1/saved-jobs/65f1234567890abcdef12345
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job removed from saved list"
}
```

---

### **5.5 Job Search & Recommendations**

> **Note:** Job search functionality is available through Public Routes (Section 1). This section covers job seeker-specific features.

#### 5.5.1 Get Recommended Jobs

```http
GET /api/v1/jobs/recommendations
```

**Description:** Get personalized job recommendations based on profile and preferences.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | No | `1` | Page number |
| `limit` | Number | No | `10` | Jobs per page |

**Request Example:**
```http
GET /api/v1/jobs/recommendations?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recommendations generated based on your profile and preferences",
  "count": 15,
  "matchScore": "Based on skills, location, and job type preferences",
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Senior Full Stack Developer",
      "company": "Tech Corp",
      "matchPercentage": 95,
      "matchReasons": [
        "Skills match: JavaScript, React, Node.js",
        "Location preference: Remote",
        "Salary range matches your expectations"
      ],
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "isRemote": true
      },
      "salary": {
        "min": 120000,
        "max": 180000,
        "currency": "USD"
      },
      "employmentType": "Full-Time",
      "postedAt": "2026-01-20T10:00:00.000Z"
    }
    // ... more recommended jobs
  ]
}
```

---

## Job Seeker Routes Summary

### **Access Requirements**
- All job seeker routes require `Authorization: Bearer <jobseeker_access_token>`
- Users must have `role: "jobseeker"`
- Profile must be created before applying to jobs
- Resume upload recommended for better application success

### **Key Workflows**

1. **Getting Started**:
   - Create profile → Upload resume/portfolio → Set preferences → Start applying to jobs

2. **Job Application Process**:
   - Search/browse jobs → Save interesting jobs → Apply with cover letter → Track application status → Attend interviews

3. **Profile Management**:
   - Keep profile updated → Add new skills/experience → Upload portfolio projects → Maintain resume

### **File Upload Limits**
| File Type | Max Size | Allowed Formats |
|-----------|----------|-----------------|
| Resume | 5 MB | PDF, DOC, DOCX |
| Video Resume | 50 MB | MP4, AVI, MOV |
| Portfolio Images | 10 MB | PNG, JPG, JPEG |
| Profile Picture | 5 MB | PNG, JPG, JPEG |

### **Application Status Flow**
```
submitted → reviewed → shortlisted → interviewing → offered/hired
                                                   ↓
                                              rejected
                                                   ↑
                                              withdrawn
```

### **Privacy Settings**
Job seekers can control:
- Profile visibility (public/private)
- Email visibility to recruiters
- Phone number visibility
- Resume download permissions

### **Status Codes**
| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / Validation error / Already applied |
| `401` | Unauthorized / Invalid token |
| `403` | Forbidden / Not authorized |
| `404` | Resource not found |
| `413` | File too large |
| `500` | Server error |

---

*This completes the API documentation for all routes. Continue to [Database Models](#-database-models) →*

