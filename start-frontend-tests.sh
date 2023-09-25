#!/bin/bash

./mvnw spring-boot:run -Dspring-boot.run.profiles=dev,inmemory &> /dev/null &

endpoint="http://localhost:8081"
max_wait_time=40

  start_time=$(date +%s)
  while true; do
    echo "Waiting for backend to come online..."
    response_code=$(curl -s -o /dev/null -w "%{http_code}" $endpoint)
    if [ "$response_code" -eq 200 ]; then
      echo "Connected to backend at ${endpoint}"
      (cd "./src/frontend" && npm run cypress:norec)
      break
    fi
    current_time=$(date +%s)
    elapsed_time=$((current_time - start_time))
    if [ $elapsed_time -ge $max_wait_time ]; then
      echo "Could not connect to backend"
      exit 1
      break
    fi
    sleep 1
  done