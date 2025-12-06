# GitHub OAuth Setup Guide

## Creating a GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: AI Estimation System (Development)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID**
6. Generate a new **Client Secret** and copy it

## Configuration

Add to your `.env.local` file:

```env
GITHUB_ID=your_client_id_here
GITHUB_SECRET=your_client_secret_here
```

## Testing

1. Start the development server: `npm run dev`
2. Go to the login page: `http://localhost:3000/login`
3. Click "Sign in with GitHub"
4. Authorize the application
5. You should be redirected to the dashboard

## Permissions

The GitHub OAuth integration requests the following scopes:
- `user:email` - Access to user's email addresses
- `read:user` - Read user profile data

For repository access (future feature), you'll need to add:
- `repo` - Full control of private repositories
- `public_repo` - Access to public repositories

## Production Setup

For production, create a separate OAuth App with:
- **Homepage URL**: `https://yourdomain.com`
- **Authorization callback URL**: `https://yourdomain.com/api/auth/callback/github`

Update your production environment variables accordingly.
