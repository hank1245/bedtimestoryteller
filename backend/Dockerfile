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

# Create uploads directory and database directory
RUN mkdir -p uploads data

# Set proper permissions
RUN chmod 755 uploads data

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
