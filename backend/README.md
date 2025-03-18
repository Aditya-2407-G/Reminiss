# Reminiss - Yearbook Platform

Reminiss is a digital yearbook platform that allows students to share their photos and messages while providing admin-level controls to ensure authenticity.

## Features

- **Admin Management**: Create batches, generate unique batch codes, and moderate content
- **Student Registration**: Register using batch code and enrollment number
- **Yearbook Entries**: Submit photos with messages/quotes
- **Montage Generation**: Create video montages from selected photos with background music
- **College Management**: Support for multiple colleges with different degree programs
- **Private Messaging**: Send direct messages to batch mates
- **Security**: JWT-based authentication with access and refresh tokens

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Media Storage**: Cloudinary
- **Background Processing**: Bull queue with Redis
- **Authentication**: JWT with refresh token rotation

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis (for Bull queue)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/reminiss.git
   cd reminiss
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/reminiss
   
   # Server Port
   PORT=8000
   
   # CORS
   CORS_ORIGIN=http://localhost:3000
   
   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=7d
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=15d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Redis for Bull Queue
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Auth Routes

- `POST /api/auth/refresh` - Refresh access token using refresh token
- `POST /api/auth/logout` - Invalidate refresh token and log out

### Admin Routes

- `POST /api/admin/register` - Register a new admin (requires superadmin)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `POST /api/admin/batches` - Create a new batch
- `GET /api/admin/batches/:batchId` - Get batch details
- `GET /api/admin/batches/:batchId/entries` - Get all entries for a batch
- `DELETE /api/admin/entries/:entryId` - Remove an entry

### College Routes

- `POST /api/admin/colleges` - Create a new college
- `GET /api/admin/colleges` - Get all colleges
- `GET /api/admin/colleges/:collegeId` - Get college details
- `PATCH /api/admin/colleges/:collegeId` - Update college details
- `DELETE /api/admin/colleges/:collegeId` - Delete a college

### User Routes

- `POST /api/users/register` - Register a new student
- `POST /api/users/login` - Student login
- `POST /api/users/logout` - Student logout
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/profile` - Update user profile

### Entry Routes

- `POST /api/entries` - Create a new yearbook entry
- `GET /api/entries` - Get all entries (can filter by college, degree, and batch)
- `GET /api/entries/user` - Get current user's entries
- `GET /api/entries/batch/:batchId` - Get entries for a specific batch
- `PATCH /api/entries/:entryId` - Update an entry
- `DELETE /api/entries/:entryId` - Delete an entry

### Montage Routes

- `POST /api/montages` - Request a new montage
- `GET /api/montages/:montageId` - Get montage status
- `GET /api/montages` - Get current user's montages

### Private Message Routes

- `POST /api/messages` - Send a private message
- `GET /api/messages` - Get received messages
- `GET /api/messages/sent` - Get sent messages
- `PATCH /api/messages/:messageId/read` - Mark message as read
- `DELETE /api/messages/:messageId` - Delete a message

## Authentication System

The platform uses a secure JWT-based authentication with access and refresh tokens:

- **Access Token**: Short-lived token (15 minutes) for API authorization
- **Refresh Token**: Long-lived token (15 days) stored securely to obtain new access tokens
- **Token Refresh**: Client can request a new access token using the refresh token when the access token expires
- **Automatic Handling**: Token expiration is handled automatically by sending a `tokenExpired: true` flag in the response

## License

This project is licensed under the ISC License. 