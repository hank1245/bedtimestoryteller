# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Note: In production, data will be stored in volume-mounted /app/data
# Development directories will be created by the application if needed

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
