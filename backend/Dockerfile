# Build stage - v2 force rebuild
FROM node:20-slim AS builder

# Install OpenSSL and other dependencies
RUN apt-get update -y && apt-get install -y openssl libssl-dev ca-certificates

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim AS production

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Copy startup script and fix line endings (Windows CRLF -> Unix LF)
COPY start.sh ./
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

# Start the application with shell to ensure proper execution
CMD ["/bin/bash", "-c", "echo 'Starting migrations...' && npx prisma migrate deploy && echo 'Migrations done, starting server...' && node dist/main 2>&1"]
