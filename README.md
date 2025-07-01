# MERN Stack Link Manager

A full-stack web application for managing and organizing bookmarks/links with user authentication, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Link Management**: CRUD operations for saving and organizing links
- **Search & Filter**: Find links by title, description, URL, or tags
- **Responsive Design**: Modern UI that works on desktop and mobile
- **Security**: Password hashing, input validation, and protected routes
- **Email Features**: Email verification, password reset, and welcome emails

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **Nodemailer** - Email sending functionality

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with modern design

## Project Structure

```
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── linkController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Link.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── links.js
│   ├── config.env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd mern-link-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `config.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/link-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
PORT=5000
```

**Note**: Replace the values with your actual configuration:
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key for JWT token signing
- `CLIENT_URL`: Your frontend URL (default: http://localhost:3000)
- `PORT`: Backend server port (default: 5000)
- `EMAIL_SERVICE`: Email service provider (default: gmail)
- `EMAIL_USER`: Your email address
- `EMAIL_PASSWORD`: Your email app password (for Gmail, use App Password)

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

1. **Start the Backend Server**
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000`

2. **Start the Frontend Development Server**
```bash
cd frontend
npm start
```
The React app will start on `http://localhost:3000`

### Production Mode

1. **Build the Frontend**
```bash
cd frontend
npm run build
```

2. **Start the Backend**
```bash
cd backend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/resend-verification` - Resend email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Links
- `GET /api/links` - Get all links for authenticated user
- `POST /api/links` - Create a new link
- `GET /api/links/:id` - Get a specific link
- `PUT /api/links/:id` - Update a link
- `DELETE /api/links/:id` - Delete a link

## Usage

1. **Registration**: Create a new account with username, email, and password
2. **Email Verification**: Verify your email address via the link sent to your inbox
3. **Login**: Sign in with your credentials
4. **Password Reset**: Use "Forgot Password" to reset your password via email
5. **Add Links**: Click "Add New Link" to save a new bookmark
6. **Organize**: Add tags to categorize your links
7. **Search**: Use the search bar to find specific links
8. **Filter**: Use the tag filter to view links by category
9. **Edit/Delete**: Manage your links with edit and delete options

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Input validation and sanitization
- Protected routes middleware
- CORS configuration
- Secure cookie settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚀 Deployment

### Vercel Deployment (Recommended)

This project is configured for easy deployment on Vercel with automatic updates. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy Steps:**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically!

**Benefits:**
- ✅ Automatic deployments on code push
- ✅ Free hosting tier
- ✅ Built-in SSL certificates
- ✅ Global CDN
- ✅ Easy environment variable management

### Other Deployment Options

- **Railway**: Simple full-stack deployment
- **Render**: Free tier available
- **Heroku**: Mature platform (paid)
- **DigitalOcean App Platform**: Scalable option

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository. 