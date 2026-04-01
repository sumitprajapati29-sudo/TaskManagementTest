# ─── Backend Dockerfile ───────────────────────────────────────────────────────
# Node.js 20 LTS on Alpine for a small, production-ready image.
# sql.js is pure JavaScript so no native-module rebuild is required.
# ──────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine

# Install dumb-init for proper PID-1 signal handling
RUN apk add --no-cache dumb-init

# Create a non-root user to run the app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer cache
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source
COPY . .

# The SQLite database file lives inside /app/data so it can be mounted as a volume
ENV DB_PATH=/app/data/database.sqlite

# Create the data directory and give ownership to the non-root user
RUN mkdir -p /app/data && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# dumb-init forwards signals correctly to the Node process
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
