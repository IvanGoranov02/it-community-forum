# Updating Node.js for IT Community Forum

The IT Community Forum project requires Node.js version 18.18.0 or higher. Your current version is Node.js v16.13.1, which is not compatible with Next.js 15.

## Option 1: Update Node.js (Recommended)

### Using nvm (Node Version Manager)

If you have nvm installed:

```bash
# Install Node.js 18 LTS
nvm install 18

# Use Node.js 18
nvm use 18

# Verify the version
node -v
```

### Using the Node.js Installer

1. Download the latest LTS installer from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the instructions
3. Verify the installation: `node -v`

## Option 2: Use a Docker Container

If you prefer not to update your system Node.js version, you can use Docker:

```bash
# Build a Docker image with the correct Node.js version
docker build -t it-forum-app .

# Run the container
docker run -p 3000:3000 it-forum-app
```

## Option 3: Temporary Downgrade Next.js (Not Recommended)

If you cannot update Node.js immediately, you can temporarily downgrade Next.js to a version compatible with Node.js 16:

1. Update package.json to use Next.js 13.4.x instead of 15.x
2. Run `npm install`

However, this is not recommended for long-term development as it may introduce compatibility issues with other dependencies.

## After Updating Node.js

Once you have updated Node.js to a compatible version:

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

The application should now run correctly with the proper SMTP configuration for email notifications. 