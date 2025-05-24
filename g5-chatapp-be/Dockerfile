# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Cài cả devDependencies để dùng tsc
RUN npm install

COPY . .

# Dùng tsc thay vì nest CLI
RUN npm run build

# Stage 2: Slim image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
