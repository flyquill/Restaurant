# 1. Use Node runtime (assuming Node/Express backend)
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy backend source code
COPY . .

# 5. Expose your backend port (e.g., 5000, 8000, or 8080)
EXPOSE 5000

# 6. Start the backend server
CMD ["npm", "start"]