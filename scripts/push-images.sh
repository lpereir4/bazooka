#!/bin/bash

set -e

docker_projects=( "parser" "parserlang/golang" "parserlang/java" "parserlang/python" "parserlang/nodejs" "orchestration" \
"server" "web")

gopath_arr=$(echo $GOPATH | tr ":" "\n")

for project in "${docker_projects[@]}"
do
  pushd "${gopath_arr[0]}/src/github.com/bazooka-ci/bazooka/$project"
  make push
  popd
done
