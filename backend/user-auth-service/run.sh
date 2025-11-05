#!/bin/bash
# Load environment variables from .env file and run the application
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi
mvn spring-boot:run
