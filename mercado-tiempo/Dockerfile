FROM nginx:latest

# NEST

# Descarga la imagen de Docker de Node.js:
docker pull node:24-slim
# Crea un contenedor de Node.js e inicia una sesión shell:
docker run -it --rm --entrypoint sh node:24-slim
# Verifica la versión de Node.js:
node -v # Debería mostrar "v24.21.0".
# Verifica versión de npm:
npm -v # Debería mostrar "11.19.0".

FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "dist/main"]