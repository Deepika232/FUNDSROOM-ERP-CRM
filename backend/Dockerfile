# Build stage
FROM node:20-alpine AS builder

# Build argument for DATABASE_URL (fallback for build time)
ARG DATABASE_URL=postgresql://postgres:password@localhost:5432/fundsroom_erp?schema=public
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npx tsc --project .

# Production stage
FROM node:20-alpine AS production

# Build argument for DATABASE_URL (fallback for build time)
ARG DATABASE_URL=postgresql://postgres:password@localhost:5432/fundsroom_erp?schema=public
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

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

# Start the application after applying Prisma migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]