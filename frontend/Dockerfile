# Frontend Dockerfile
# 1단계: 빌드
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# 2단계: 정적 파일 서빙
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 5173

# Start serve
CMD ["sh", "-c", "serve -s dist -p ${PORT:-5173}"]
