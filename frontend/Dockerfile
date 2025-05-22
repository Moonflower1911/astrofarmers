# Install dependencies and build app
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app

# Copy only built output and minimal runtime files
COPY --from=builder /app /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://backend:8080

EXPOSE 3000
CMD ["npm", "start"]
