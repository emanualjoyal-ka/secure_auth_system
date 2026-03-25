# 🔐 Secure Auth System

## 🚀 Project Overview

**Secure Auth System** is a comprehensive, enterprise-grade backend authentication API built with modern technologies. This project showcases advanced skills in secure software development, demonstrating expertise in implementing robust authentication mechanisms, API security, database design, and scalable backend architecture.

### 🎯 What This Project Demonstrates
- **User Registration & Login**: Secure user signup and authentication with password hashing using bcrypt.
- **JWT Token Management**: Access and refresh tokens for stateless authentication.
- **Session Management**: Track user sessions with device-specific logout capabilities.
- **Rate Limiting**: Prevents abuse with configurable request limits on sensitive endpoints.
- **Security Headers**: Helmet integration for XSS protection and secure HTTP headers.
- **CORS Support**: Configurable cross-origin resource sharing for frontend integration.
- **Input Validation**: Joi-based validation for request data.
- **MongoDB Integration**: User and session data stored in MongoDB using Mongoose.
- **Environment Configuration**: Flexible configuration via environment variables.
- **RBAC (Role-Based Access Control)**

This authentication system is designed to handle real-world security requirements, featuring:

- **Production-Ready Security**: JWT authentication, password hashing, rate limiting, and comprehensive input validation
- **Scalable Architecture**: Clean separation of concerns with controllers, services, and middleware layers
- **Database Excellence**: MongoDB integration with Mongoose ODM and proper schema design
- **Type Safety**: Full TypeScript implementation ensuring runtime reliability
- **API Best Practices**: RESTful design with proper HTTP status codes and error handling

### ✨ Key Features

- 🔑 **JWT Authentication**: Stateless token-based auth with access/refresh token rotation
- 🛡️ **Password Security**: Bcrypt hashing (12 salt rounds) preventing rainbow table attacks
- 🚫 **Account Protection**: Automatic lockout after 5 failed login attempts (24-hour duration)
- 📊 **Session Management**: Device-specific session tracking with logout capabilities
- ⚡ **Rate Limiting**: Configurable request limits preventing brute force and DoS attacks
- ✅ **Input Validation**: Joi schema validation for all user inputs
- 🔒 **Security Headers**: Helmet.js integration for XSS protection and secure headers
- 🌐 **CORS Support**: Configurable cross-origin resource sharing
- 👥 **Role-Based Access Control**: User/Admin roles with authorization middleware
- 📱 **HTTP-Only Cookies**: Secure token storage preventing XSS theft

## 🛠 Tech Stack & Technologies Used

### Core Technologies

- **Language**: TypeScript (Advanced type safety and developer experience)
- **Runtime**: Node.js (v16+) - Server-side JavaScript execution
- **Framework**: Express.js - Fast, unopinionated web framework for Node.js

### Database & Data Management

- **Database**: MongoDB - NoSQL document database for flexible data storage
- **ODM**: Mongoose - Elegant MongoDB object modeling for Node.js
- **Connection**: Secure MongoDB connection with error handling

### Security & Authentication

- **JWT**: jsonwebtoken - Stateless authentication with token-based sessions
- **Password Hashing**: bcrypt - Industry-standard password encryption
- **Security Headers**: helmet - Automatic security headers (XSS, CSP, etc.)
- **Rate Limiting**: express-rate-limit - API abuse prevention
- **CORS**: cors - Cross-origin resource sharing configuration

### Validation & Utilities

- **Input Validation**: Joi - Powerful schema description and data validation
- **Cookie Handling**: cookie-parser - Parse and manage HTTP cookies
- **Unique IDs**: uuid - Generate RFC-compliant UUIDs
- **Environment**: dotenv - Load environment variables from .env file

### Development & Build Tools

- **TypeScript Compiler**: typescript - Compile TS to JS with strict checking
- **Development Server**: tsx - TypeScript execution and hot reloading
- **Package Manager**: npm - Node package management

## 📋 Prerequisites & System Requirements

Before running this project, ensure you have:

- **Node.js**: Version 16.0.0 or higher
- **MongoDB**: Local installation or MongoDB Atlas cloud service
- **npm**: Node package manager (comes with Node.js)
- **Git**: For cloning the repository

## 🚀 Setup & Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/emanualjoyal-ka/secure_auth_system.git
cd secure-auth-system
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/secure_auth_db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters_long
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN=your_super_secure_refresh_token_secret_key_here
REFRESH_TOKEN_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

**🔐 Security Best Practices for Environment Variables:**

- Use strong, unique secrets (minimum 32 characters)
- Never commit `.env` files to version control
- Use different secrets for development and production
- Consider using environment-specific secret management services

### Step 4: Build the Project

```bash
npm run build
```

### Step 5: Start MongoDB

Ensure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas and update MONGO_URI accordingly
```

## 🎮 Usage & Running the Application

### Development Mode (Recommended)

```bash
npm run dev
```

- Starts the server with hot reloading
- TypeScript files are automatically compiled
- Server restarts on file changes

### Production Mode

```bash
npm start
```

- Runs the compiled JavaScript from `dist/` folder
- Optimized for production deployment

### Server Output

When successfully started, you'll see:

```
✅ MongoDB connected: localhost
✅ SERVER is running on http://localhost:3000
```

## 📚 Complete API Documentation

The API follows RESTful conventions with JSON request/response format. All endpoints are prefixed with `/api`.

### 🔐 Authentication Endpoints

#### 1. User Registration

**POST** `/api/auth/register`

Creates a new user account with secure password hashing.

**Rate Limit**: 10 requests per 15 minutes

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules**:

- `name`: Required, 2-50 characters, trimmed
- `email`: Required, valid email format, converted to lowercase
- `password`: Required, minimum 6 characters

**Success Response (201)**:

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "createdAt": "2024-03-25T10:30:00.000Z",
    "updatedAt": "2024-03-25T10:30:00.000Z"
  }
}
```

**Error Responses**:

```json
// 400 Bad Request - Validation Error
{
  "success": false,
  "error": "\"email\" must be a valid email"
}

// 400 Bad Request - User Exists
{
  "success": false,
  "error": "User already exists"
}

// 429 Too Many Requests - Rate Limited
{
  "success": false,
  "error": "Too many register attempts"
}
```

#### 2. User Login

**POST** `/api/auth/login`

Authenticates user and sets JWT tokens in HTTP-only cookies.

**Rate Limit**: 5 requests per 15 minutes

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Login successful"
}
```

_Note: JWT tokens are automatically set in HTTP-only cookies_

**Error Responses**:

```json
// 400 Bad Request - Invalid Credentials
{
  "success": false,
  "error": "Invalid password"
}

// 400 Bad Request - Account Locked
{
  "success": false,
  "error": "Account is locked. Try again later"
}

// 429 Too Many Requests - Rate Limited
{
  "success": false,
  "error": "Too many login attempts, try again later"
}
```

#### 3. Refresh Access Token

**POST** `/api/auth/refresh`

Generates new access token using valid refresh token.

**Rate Limit**: 20 requests per 15 minutes

**Headers**:

```
Cookie: refreshToken=<refresh_token_value>
```

**Request Body**: None

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

**Error Response (401)**:

```json
{
  "success": false,
  "error": "Invalid refresh token"
}
```

#### 4. User Logout

**POST** `/api/auth/logout`

Clears current session tokens.

**Rate Limit**: 50 requests per 15 minutes

**Headers**:

```
Cookie: accessToken=<access_token>; refreshToken=<refresh_token>
```

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 5. Logout from All Devices

**POST** `/api/auth/logout-all-devices`

Invalidates all user sessions across devices.

**Rate Limit**: 50 requests per 15 minutes

**Headers**:

```
Cookie: accessToken=<access_token>; refreshToken=<refresh_token>
```

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

### 👑 Admin Endpoints

#### 6. Admin Create User

**POST** `/api/admin/create-user`

Allows admin users to create new users with role assignment.

**Authentication**: Required (Admin role only)

**Headers**:

```
Cookie: accessToken=<admin_access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "TempPass123!",
  "role": "user"
}
```

**Success Response (201)**:

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user",
    "createdAt": "2024-03-25T11:00:00.000Z",
    "updatedAt": "2024-03-25T11:00:00.000Z"
  }
}
```

## 🧪 Complete API Testing Guide

### Method 1: Testing with Postman

#### Step 1: Environment Setup

1. Open Postman and create a new environment
2. Add these variables:
   - `baseURL`: `http://localhost:3000`
   - `accessToken`: (leave empty)
   - `refreshToken`: (leave empty)

#### Step 2: Test User Registration

1. Create new request: **POST** `{{baseURL}}/api/auth/register`
2. Headers tab: `Content-Type: application/json`
3. Body tab (raw JSON):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "TestPass123!"
   }
   ```
4. Send request → Should return 201 status

#### Step 3: Test User Login

1. Create new request: **POST** `{{baseURL}}/api/auth/login`
2. Headers: `Content-Type: application/json`
3. Body:
   ```json
   {
     "email": "test@example.com",
     "password": "TestPass123!"
   }
   ```
4. Send request
5. Go to "Cookies" tab in Postman response
6. Copy `accessToken` and `refreshToken` values to environment variables

#### Step 4: Test Protected Endpoints

For authenticated endpoints:

1. Add to Headers: `Cookie: accessToken={{accessToken}}; refreshToken={{refreshToken}}`
2. Or enable "Cookie jar" in Postman settings

#### Step 5: Test Token Refresh

1. **POST** `{{baseURL}}/api/auth/refresh`
2. Headers: `Cookie: refreshToken={{refreshToken}}`
3. Send → Gets new access token

#### Step 6: Test Logout

1. **POST** `{{baseURL}}/api/auth/logout`
2. Headers: `Cookie: accessToken={{accessToken}}; refreshToken={{refreshToken}}`
3. Send → Logs out current session

#### Step 7: Test Admin Endpoints

1. First, manually set a user's role to "admin" in MongoDB
2. Login as admin user to get admin tokens
3. **POST** `{{baseURL}}/api/admin/create-user`
4. Headers: `Cookie: accessToken={{accessToken}}`, `Content-Type: application/json`
5. Body:
   ```json
   {
     "name": "Admin Created User",
     "email": "adminuser@example.com",
     "password": "AdminPass123!",
     "role": "user"
   }
   ```

### Method 2: Testing with cURL

#### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

#### Login User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }' \
  -c cookies.txt
```

#### Access Protected Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

#### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

#### Admin Create User (with auth)

```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "AdminPass123!",
    "role": "user"
  }'
```

### Method 3: Testing with Thunder Client (VS Code Extension)

1. Install Thunder Client extension in VS Code
2. Create new request for each endpoint
3. Set method, URL, headers, and body as shown above
4. Use environment variables for tokens
5. Test authentication flow step by step

## 🔒 Security Features Implemented

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication with short-lived access tokens (15min) and refresh tokens (7 days)
- **Password Hashing**: bcrypt with 12 salt rounds, preventing rainbow table attacks
- **HTTP-Only Cookies**: Tokens stored securely, preventing XSS theft
- **Role-Based Access**: User/Admin roles with middleware authorization

### Protection Mechanisms

- **Account Lockout**: 5 failed attempts → 24-hour lockout
- **Rate Limiting**: Different limits per endpoint (registration: 10/15min, login: 5/15min)
- **Input Validation**: Joi schemas prevent injection attacks
- **Security Headers**: Helmet.js adds XSS protection, CSP, and hides server info
- **CORS Protection**: Configurable origins prevent unauthorized cross-origin requests

### Data Security

- **Password Change Tracking**: Timestamps for security auditing
- **Session Management**: Unique session IDs with device-specific logout
- **Environment Security**: Sensitive data in environment variables
- **Error Handling**: No sensitive information leaked in error responses

## 📁 Project Structure & Architecture

```
src/
├── app.ts                    # Express app configuration & middleware setup
├── server.ts                 # Server entry point & database connection
├── config/
│   └── db.ts                 # MongoDB connection with error handling
├── controllers/
│   ├── auth.controller.ts    # Authentication endpoint handlers
│   └── admin.controller.ts   # Admin endpoint handlers
│   └── session.controller.ts   # Session endpoint handlers
├── interfaces/
│   └── ISession.ts              # TypeScript interfaces for type safety
│   └── IUser.ts              # TypeScript interfaces for type safety
├── middleware/
│   ├── auth.middleware.ts    # JWT authentication middleware
│   ├── csrf.middleware.ts    # CSRF Protection middleware
│   ├── role.middleware.ts    # Role-based authorization middleware
│   └── rateLimit.middleware.ts # Rate limiting configuration
├── models/
│   ├── user.model.ts         # User schema with password hashing
│   └── session.model.ts      # Session tracking schema
├── routes/
│   ├── auth.routes.ts        # Authentication route definitions
│   └── admin.routes.ts       # Admin route definitions
│   └── csrf.routes.ts       # CSRF route definitions
│   └── session.routes.ts       # Session route definitions
├── services/
│   ├── auth.service.ts       # Authentication business logic
│   └── admin.service.ts      # Admin business logic
│   └── session.service.ts      # session business logic
├── utils/
│   └── auth.helpers.ts      # IP address helper utilities
│   └── generateToken.ts      # JWT token generation utilities
└── validations/
    └── auth.validation.ts    # Joi validation schemas
    └── changePassword.validation.ts    # Joi validation schemas
```

### Architecture Benefits

- **Separation of Concerns**: Clear division between routes, controllers, services, and models
- **Middleware Pattern**: Reusable authentication and authorization middleware
- **Service Layer**: Business logic separated from controllers
- **Type Safety**: Full TypeScript coverage with interfaces
- **Scalable Structure**: Easy to add new features and endpoints

## 🤝 Contributing Guidelines

We welcome contributions! This project follows industry best practices.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Implement** your changes following existing patterns
4. **Test** thoroughly using the provided testing guides
5. **Commit** with clear messages: `git commit -m 'Add: feature description'`
6. **Push** and create a Pull Request

### Code Standards

- Use TypeScript with strict type checking
- Follow ESLint/Prettier formatting
- Add JSDoc comments for complex functions
- Implement proper error handling
- Write unit tests for new features
- Maintain security best practices

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.


### Technical Skills Demonstrated

- **Secure API Development**: JWT, OAuth patterns, security headers
- **Backend Architecture**: MVC pattern, middleware, service layers
- **Database Design**: MongoDB schema design, indexing, relationships
- **TypeScript Mastery**: Advanced types, interfaces, generics
- **Authentication Systems**: Complete auth flow implementation
- **Security Best Practices**: Password hashing, rate limiting, input validation
- **API Design**: RESTful conventions, proper HTTP status codes
- **Error Handling**: Comprehensive error management and logging
- **Testing**: API testing methodologies and tools
- **Production Readiness**: Environment configuration, deployment considerations

### Professional Qualities

- **Code Organization**: Clean, maintainable, and scalable architecture
- **Documentation**: Comprehensive README and code comments
- **Security Awareness**: Implementation of industry security standards
- **Problem Solving**: Complex authentication logic and edge cases
- **Best Practices**: Following Node.js and TypeScript conventions

## 🧠 What I Learned

- How to design and implement robust authentication workflows using JWT (access and refresh tokens) with secure cookie handling.
- Applying security-first design using bcrypt hashing, rate limiting, account lockout, and helmet security headers.
- Writing middleware for authentication, authorization, and request throttling for high-security endpoints.
- Structuring the backend into clean layers (routes, controllers, services, models) for maintainability and team collaboration.
- Enforcing strong validation with Joi and building error-safe response patterns for production quality.
- Managing database access with Mongoose schema hooks and session tracking for secure token lifecycle control.

---

_Built with ❤️ using modern web technologies and security best practices._

Emanual Joyal K A - emanualjoyalka@gmail.com
