# ✅ Dùng Node.js 20 (ổn định với Vite)
FROM node:20-alpine AS build

WORKDIR /app

# Copy & cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install --force

# Copy source code & build
COPY . .

RUN npm run build

# Serve với nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]