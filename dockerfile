# 1) Build
FROM node:20-alpine AS build
WORKDIR /app

# Instala deps (si no hay package-lock, cae a npm install)
COPY package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Copia el resto y compila
COPY . .
RUN npm run build

# 2) Servir estático
FROM nginx:stable-alpine
# Fallback SPA para React Router (opcional pero recomendado)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
