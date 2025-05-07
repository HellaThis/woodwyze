# Use the official Node.js image as the base
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Ensure the correct environment variables are set
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Explicitly copy the production env file
COPY .env.production /app/.env

# Build the Next.js application
RUN npm run build

# Expose the port Cloud Run will listen on
EXPOSE 8080

# Start the Next.js server using npx
CMD ["npx", "next", "start", "-p", "8080"]