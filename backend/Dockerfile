# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npx tsc --project .

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client in production
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]