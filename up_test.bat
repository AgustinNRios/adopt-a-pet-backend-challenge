@echo off
docker-compose -f docker-compose.test.yml up --build --force-recreate test
pause