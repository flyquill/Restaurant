# ==========================================
# Stage 1: Build the Vite application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Run the Vite build command (generates the 'dist' folder)
RUN npm run build

# ==========================================
# Stage 2: Serve the static files with Nginx
# ==========================================
FROM nginx:alpine

# Copy the static build files from the builder stage to Nginx's html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP port for Nginx)
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]