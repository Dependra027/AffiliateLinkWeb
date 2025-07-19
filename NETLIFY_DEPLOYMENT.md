# Netlify Deployment Guide

## Prerequisites
- Your backend server is already deployed on Render
- You have a Netlify account

## Step 1: Environment Configuration

### Frontend Environment Files
You need two environment files in the `frontend` directory:

1. **`.env.development`** (for local development):
```
REACT_APP_SERVER_ENDPOINT=http://localhost:5000
```

2. **`.env.production`** (for production - update with your Render URL):
```
REACT_APP_SERVER_ENDPOINT=https://your-actual-render-app-name.onrender.com
```

**Important**: Replace `your-actual-render-app-name.onrender.com` with your actual Render webservice endpoint URL.

## Step 2: Build the Application

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Build the application:
```bash
npm run build
```

This will create a `build` folder with the production-ready files.

## Step 3: Deploy to Netlify

### Option A: Manual Deployment (Recommended for first time)

1. Go to [https://netlify.com/](https://netlify.com/)
2. Sign up or log in to your account
3. Click on "Sites" in the top navigation
4. Drag and drop the entire `build` folder from your project to the Netlify deployment area
5. Wait for the deployment to complete
6. Your site will be live at a URL like: `https://random-name.netlify.app`

### Option B: Git-based Deployment (For future updates)

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set build command: `cd frontend && npm run build`
4. Set publish directory: `frontend/build`
5. Deploy automatically on every push

## Step 4: Configure Environment Variables on Netlify

1. In your Netlify dashboard, go to your site settings
2. Navigate to "Environment variables"
3. Add the following variable:
   - **Key**: `REACT_APP_SERVER_ENDPOINT`
   - **Value**: `https://your-actual-render-app-name.onrender.com`

## Step 5: Update Backend Environment Variables

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add/update the `CLIENT_URL` variable with your Netlify URL:
   - **Key**: `CLIENT_URL`
   - **Value**: `https://your-netlify-site-name.netlify.app`

## Step 6: Test Your Deployment

1. Visit your Netlify URL
2. Test the following functionality:
   - User registration and login
   - Creating and managing links
   - Link tracking and analytics
   - Payment integration (if applicable)

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend CORS configuration allows your Netlify domain
2. **Cookie Issues**: Ensure cookies are properly configured for cross-domain requests
3. **API Endpoint Not Found**: Verify the `REACT_APP_SERVER_ENDPOINT` environment variable is correct

### Cookie Configuration:
The backend has been updated to handle production cookies properly. Cookies will be:
- `secure: true` in production
- `sameSite: 'None'` in production
- `sameSite: 'Lax'` in development

## Updating Your Application

### For Manual Deployments:
1. Make your code changes
2. Run `npm run build` in the frontend directory
3. Upload the new `build` folder to Netlify

### For Git-based Deployments:
1. Make your code changes
2. Push to GitHub
3. Netlify will automatically rebuild and deploy

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for sensitive configuration
- Ensure your Render service has proper environment variables set
- Consider setting up custom domains for both frontend and backend

## Performance Optimization

- The build process optimizes your React application
- Static assets are compressed and cached
- Consider enabling Netlify's CDN features for better performance 