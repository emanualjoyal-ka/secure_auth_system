# Secure Auth System

A robust and secure authentication system built with Node.js, Express, and TypeScript. This project provides a complete backend solution for user authentication, including registration, login, JWT-based token management, session handling, and security features like rate limiting and CORS protection.

## Features

- **User Registration & Login**: Secure user signup and authentication with password hashing using bcrypt.
- **JWT Token Management**: Access and refresh tokens for stateless authentication.
- **Session Management**: Track user sessions with device-specific logout capabilities.
- **Rate Limiting**: Prevents abuse with configurable request limits on sensitive endpoints.
- **Security Headers**: Helmet integration for XSS protection and secure HTTP headers.
- **CORS Support**: Configurable cross-origin resource sharing for frontend integration.
- **Input Validation**: Joi-based validation for request data.
- **MongoDB Integration**: User and session data stored in MongoDB using Mongoose.
- **Environment Configuration**: Flexible configuration via environment variables.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt (password hashing), Helmet (security headers), express-rate-limit
- **Validation**: Joi
- **Other**: CORS, Cookie Parser, UUID

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/secure-auth-system.git
   cd secure-auth-system
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=3000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret_key
   ACCESS_TOKEN_EXPIRE=15m
   REFRESH_TOKEN=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRE=7d
   DB_URI=mongodb://localhost:27017/secure_auth
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

## Usage

1. **Start the development server**:

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000` (or the port specified in `.env`).

2. **Start the production server**:
   ```bash
   npm start
   ```

### API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all-devices` - Logout from all devices

### Example API Usage

**Register User**:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "securepassword"}'
```

**Login**:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "securepassword"}'
```

## Project Structure

```
src/
├── app.ts                 # Main Express application setup
├── server.ts              # Server entry point
├── config/
│   └── db.ts              # MongoDB connection configuration
├── controllers/
│   └── auth.controller.ts # Authentication controllers
├── interfaces/
│   └── IUser.ts           # TypeScript interfaces
├── middleware/
│   └── rateLimit.middleware.ts # Rate limiting middleware
├── models/
│   ├── user.model.ts      # User data model
│   └── session.model.ts   # Session data model
├── routes/
│   ├── auth.routes.ts     # Authentication routes
│   └── admin.routes.ts    # Admin routes (if applicable)
├── services/
│   └── auth.service.ts    # Authentication business logic
├── utils/
│   └── generateToken.ts   # JWT token generation utilities
└── validations/
    └── auth.validation.ts # Input validation schemas
```

## Configuration

The application uses environment variables for configuration. Key variables include:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `CLIENT_URL`: Allowed CORS origin
- `JWT_SECRET`: Secret key for JWT access tokens
- `ACCESS_TOKEN_EXPIRE`: Access token expiration time (e.g., "15m")
- `REFRESH_TOKEN`: Secret key for JWT refresh tokens
- `REFRESH_TOKEN_EXPIRE`: Refresh token expiration time (e.g., "7d")
- `DB_URI`: MongoDB connection string

## Screenshots

_Add screenshots of the application here once available._

## Future Improvements / Roadmap

- [ ] Implement OAuth2 social login (Google, GitHub)
- [ ] Add email verification for user registration
- [ ] Implement password reset functionality
- [ ] Add role-based access control (RBAC)
- [ ] Integrate with Redis for session storage
- [ ] Add API documentation with Swagger
- [ ] Implement logging and monitoring
- [ ] Add unit and integration tests

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

[Your Name] - [your.email@example.com]

_Replace with your actual name and contact information._
