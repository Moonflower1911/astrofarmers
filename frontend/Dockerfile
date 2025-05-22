FROM node:18-alpine
WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy everything else
COPY . .

ENV NODE_ENV=development
EXPOSE 3000

# Default command (overridden in docker-compose)
CMD ["npm", "run", "dev"]