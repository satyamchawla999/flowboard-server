FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Development ---
FROM base AS development
RUN npm install
COPY . .

# --- Build ---
FROM base AS builder
RUN npm ci --only=production
COPY . .
RUN npm run build

# --- Production ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 4000
CMD ["node", "dist/main"]
