#!/bin/bash

function valueOrDefault {
    local value=$1
    local default=$2

    [[ ! -z "$value" ]] && \
        echo $value || \
        echo $default
}

function maxOf {
    [[ "$1" -gt "$2" ]] && \
        echo $1 || \
        echo $2
}

function minOf {
    [[ "$1" -lt "$2" ]] && \
        echo $1 || \
        echo $2
}

function port_of {
    local containers=$1
    local internal_port=$2

    local ports=$(for container in $containers; do docker port $container ${internal_port} | tr ":" "\n" | tail -n1; done)
    local max_port=$(printf "%s\n" "${ports[*]}" | sort -n | tail -n1)

    echo $max_port
}

function max_port_of {
    local containers=$1
    local starting_port=$2
    local internal_port=$3

    local max_port=$(port_of "$containers" "$internal_port")
    local max_port=$(maxOf "$max_port" "$starting_port")

    echo $max_port
}

entry_point_service=infolab
entry_point_service_internal_port=8080
project_name=infolab
image_name=ghcr.io/studiofarma/infolab
image_tag=$(./mvnw help:evaluate -Dexpression=project.version -q -DforceStdout)
echo local version is $image_tag

all_containers=$(docker ps -q)
max_port=$(max_port_of "$all_containers" 40000)

echo max containers ports $max_port

running_entry_points=$(docker ps --filter name=_${entry_point_service}_ -q)
max_port=$(max_port_of "$running_running_entry_points" "$max_port" "$entry_point_service_internal_port")

echo found ports $max_port

entry_points_port=$((max_port+1))

if [ "$running_entry_points" != "" ]; then
  running_entry_points_port=$(port_of $running_entry_points)
  entry_points_port=$(minOf $running_entry_points_port $entry_points_port)
  echo entry_point_service already running... using its port $running_entry_points_port
fi


build=false

options=$(getopt -l "detached,port:,name:,build,image:tag:" -o "dp:n:b,i:t:" -a -- "$@")
eval set -- "$options"

while true
do
case $1 in
  -d|--detached)
      export detached="-d"
      ;;
  -p|--port)
      export entry_points_port=$2
      ;;
  -n|--name)
      export instance_name_arg=$2
      ;;
  -b|--build)
      export build=true
      ;;
  -i|--image)
      export image_name_arg=$2
      ;;
  -t|--tag)
      export image_tag_arg=$2
      ;;
  --)
      shift
      break;;
esac
shift
done

image_name=$(valueOrDefault $image_name_arg $image_name)
image_tag=$(valueOrDefault $image_tag_arg $image_tag)
image=${image_name}:${image_tag}
echo will start using $image

instance_name=$(valueOrDefault $instance_name_arg $project_name$entry_points_port)
instance_name=$(echo $instance_name | sed "s/\//_/g")

current_entry_point_port=$(docker ps --filter name="${instance_name}_${project_name}_" -q | xargs docker port | tr ":" "\n" | tail -n1)
entry_points_port=$(valueOrDefault $current_entry_point_port $entry_points_port)

echo current port $current_entry_point_port
echo selected port $entry_points_port


function build {
    echo building ${image} from $(pwd)
    ./mvnw clean spring-boot:build-image -DskipTests
}

function stop_containers {
    local running_instance=$1
    echo stopping containers $running_instance
    docker compose -p $running_instance -f .docker/docker-compose.yml down
}

if [ $build == true ]; then
  build
fi

echo ELK_VERSION=8.5.3 >> env-file
echo ENTRY_POINT_IMAGE_NAME=$image >> env-file
echo ENTRY_POINT_PORT=$entry_points_port >> env-file
echo KIBANA_PORT=$((entry_points_port+1)) >> env-file
echo DB_ADMINISTRATION_PORT=$((entry_points_port+2)) >> env-file
echo DB_PORT=$((entry_points_port+3)) >> env-file
echo DB_HOSTNAME=${DB_HOSTNAME:-db} >> env-file
echo DB_USER=${DB_USER:-user} >> env-file
echo DB_PASSWORD=${DB_PASSWORD:-password} >> env-file
echo DB_ADMINISTRATION_USER=${DB_ADMINISTRATION_USER:-user@user.com} >> env-file
echo DB_ADMINISTRATION_PASSWORD=${DB_ADMINISTRATION_PASSWORD:-password} >> env-file
echo ELASTIC_PASSWORD=${ELASTIC_PASSWORD:-banana} >> env-file
echo KIBANA_PASSWORD=${KIBANA_PASSWORD:-banana} >> env-file
echo FILEBEAT_PASSWORD=${FILEBEAT_PASSWORD:-banana} >> env-file

echo starting with image ${image}

stop_containers $instance_name
docker compose --env-file env-file -f .docker/docker-compose.yml pull --ignore-pull-failures
docker compose -p $instance_name -f .docker/docker-compose.yml --env-file env-file up ${detached} --remove-orphans