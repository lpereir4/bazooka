#!/bin/bash

set -e

docker_projects=( "parser" "parserlang/golang" "parserlang/java" "parserlang/python" "parserlang/nodejs" "orchestration" "server")

for project in "${docker_projects[@]}"
do
  pushd "$project"
    make devimage
  popd
done
