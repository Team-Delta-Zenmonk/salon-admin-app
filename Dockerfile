# ---- Build Stage ----
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build && npm prune --omit-dev

# ---- Production Stage ----
FROM nginx:stable-alpine AS runner

# Copy custom nginx config
COPY etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
