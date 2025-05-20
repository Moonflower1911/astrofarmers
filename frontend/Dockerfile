# Simple Dockerfile for dev mode
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=development
ENV NEXT_PUBLIC_API_URL=http://backend:8080

EXPOSE 3000

CMD ["npm", "run", "dev"]
