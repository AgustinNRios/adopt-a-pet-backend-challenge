# adopt-a-pet-backend-challenge

Este es un challenge de backend basado en la adopción de mascotas.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Swagger para documentación
- Docker para la reproducibilidad

## How to run the APP
### in bash / Git-bash
```
chmod 711 ./up_dev.sh
./up_dev.sh
```
### in powershell
```
docker-compose -f docker-compose.dev.yml up --build --force-recreate
```

### in cmd
```
up_dev.bat
```

## How to run the tests 
### in bash / Git-bash
```
chmod 711 ./up_test.sh
./up_test.sh
```
### in powershell
```
docker-compose -f docker-compose.test.yml up --build --force-recreate test
```

### in cmd
```
up_test.bat
```

## Acceder a la aplicación

Una vez que la aplicación esté en ejecución, puedes acceder a:

- API: http://localhost:8080
- Documentación Swagger: http://localhost:8080/api-docs
