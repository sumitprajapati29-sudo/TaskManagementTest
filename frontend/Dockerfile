# ─── Frontend Dockerfile (multi-stage) ────────────────────────────────────────
# Stage 1 – build the React/Vite app
# Stage 2 – serve the static output with nginx and proxy /api to the backend
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer cache
COPY package*.json ./

RUN npm ci

# Copy source and build
COPY . .

RUN npm run build

# ── Stage 2: Serve with nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove the default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy the production build from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (handles SPA routing + API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
