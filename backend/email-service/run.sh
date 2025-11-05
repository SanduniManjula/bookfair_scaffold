#!/bin/bash
# Load environment variables from .env file and run the application
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi
mvn spring-boot:run
