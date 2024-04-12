docker rm -v -f $(docker ps -qa)
docker system prune -a