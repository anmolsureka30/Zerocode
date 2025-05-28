# Build stage for frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Copy package files and necessary configs
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY client ./client
COPY shared ./shared

# Install dependencies and build frontend
RUN npm install
RUN npm run build

# Build stage for backend
FROM node:20-slim AS backend-builder

WORKDIR /app

# Copy package files and server code
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY server ./server
COPY shared ./shared

# Install dependencies and build backend
RUN npm install
RUN npm run build:server

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend and backend files
COPY --from=frontend-builder /app/dist/public ./dist/public
COPY --from=backend-builder /app/dist/index.js ./dist/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"] 