@echo off
docker container rm -f bknife-nginx
docker container rm -f bknife-xray
docker container rm -f bknife-portainer

docker-compose up -d