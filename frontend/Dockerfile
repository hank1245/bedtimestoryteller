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

# Build arguments를 환경변수로 전달
ARG VITE_OPENAI_API_KEY
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL
ARG VITE_ANTHROPIC_API_KEY

ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ANTHROPIC_API_KEY=$VITE_ANTHROPIC_API_KEY

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
