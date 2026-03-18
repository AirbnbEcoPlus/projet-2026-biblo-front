# Stage 1: Build Angular app
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build for production
COPY . .
RUN npm run build

# Normalize build output path across Angular builder variants
RUN mkdir -p /app/dist-output && \
    if [ -d "/app/dist/front_articles/browser" ]; then \
      cp -r /app/dist/front_articles/browser/. /app/dist-output/; \
    elif [ -d "/app/dist/front_articles" ]; then \
      cp -r /app/dist/front_articles/. /app/dist-output/; \
    else \
      echo "Angular build output not found" && ls -la /app/dist && exit 1; \
    fi

# Stage 2: Serve static files with Nginx
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist-output /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
