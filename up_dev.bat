@echo off
docker-compose -f docker-compose.dev.yml up --build --force-recreate
pause