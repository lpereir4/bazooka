#!/bin/bash

set -ev

docker_projects=( "parser" "parser-golang" "parser-java" "parser-python" "parser-nodejs" "orchestration" "server" "web" )

docker login -e "$DOCKER_EMAIL" -p "$DOCKER_PASSWORD" -u "$DOCKER_USERNAME"

for project in "${docker_projects[@]}"
do
  docker push "bazooka/$project"
done
