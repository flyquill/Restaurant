# 1. Use Node runtime (matching your frontend)
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 4. Copy the rest of the frontend code
COPY . .

# 5. Expose the frontend port (3000 for React, 5173 for Vite, etc.)
EXPOSE 5173

# 6. Start the frontend development server
CMD ["npm", "run", "dev"]