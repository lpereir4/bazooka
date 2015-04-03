#!/bin/bash

set -e

docker_projects=( "parser" "parserlang/golang" "parserlang/java" "parserlang/nodejs" "parserlang/python" "orchestration" "server" "web" )

for project in "${docker_projects[@]}"
do
  pushd "$project"
    make
  popd
done
