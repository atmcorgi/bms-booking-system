# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
COPY vite.config.ts ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . ./

# Accept API base URL at build time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build (standard: type-check + bundle)
RUN npm run build

# Runtime stage - Nginx to serve static files
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=build /app/dist ./

# SPA routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


