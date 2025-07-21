# 1. Especifica la imagen base que se usará (Node.js v20.11.0)
FROM node:20.11.0
# Usa una imagen oficial de Node.js con la versión 20.11.0 ya instalada.
# Esto incluye un sistema operativo (Linux) + Node.js preinstalado.

# 2. Define el directorio de trabajo dentro del contenedor
WORKDIR /app
# Crea (si no existe) y se mueve al directorio `/app` dentro del contenedor.
# Todas las instrucciones siguientes ocurrirán desde esta carpeta.

# 3. Copia los archivos de dependencias (package.json y package-lock.json si existe)
COPY package*.json ./
# Copia los archivos de configuración de dependencias desde tu máquina local
# al contenedor. El * incluye tanto `package.json` como `package-lock.json`.

# 4. Instala las dependencias definidas en package.json
RUN npm install
# Ejecuta `npm install` dentro del contenedor para instalar todas las
# dependencias de tu proyecto (en `/app/node_modules`).

# 5. Copia el código fuente de la aplicación al contenedor
COPY ./src ./src
# Las variables de entorno se pasan a través de docker-compose
# No copiamos el archivo .env porque se configuran las variables en docker-compose

# 6. Expone el puerto 8080 (el que usa tu aplicación según la configuración)
EXPOSE 8080
# Informa a Docker que el contenedor usará el puerto 8080 para escuchar.
# Este puerto debe coincidir con el configurado en tu .env (PORT=8080).

# 7. Comando por defecto al iniciar el contenedor
CMD ["npm", "run", "start"]
# Ejecuta el script "start" definido en tu package.json, que inicia server.js
