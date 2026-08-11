# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (layer-cached)
COPY frontend/novacart-web/package.json frontend/novacart-web/package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY frontend/novacart-web/ ./
RUN npm run build

# ── Stage 2: Serve with nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx page
RUN rm -rf ./*

COPY --from=build /app/dist ./

# React Router 6 needs all paths to serve index.html (SPA fallback)
COPY frontend/novacart-web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
