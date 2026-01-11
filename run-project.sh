#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting OAuth2 & OIDC Microservices Project ===${NC}"

# Function to kill all background processes on exit
cleanup() {
    echo -e "${RED}Stopping all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    docker-compose down
    exit
}

trap cleanup SIGINT SIGTERM

# 1. Start Infrastructure (Keycloak & Postgres)
echo -e "${GREEN}[1/7] Starting Infrastructure (Docker)...${NC}"
docker-compose up -d
echo "Waiting for Keycloak to be ready (30s)..."
sleep 30

# 2. Start Config Service
echo -e "${GREEN}[2/7] Starting Config Service...${NC}"
cd config-service
./mvnw spring-boot:run > ../logs/config-service.log 2>&1 &
CONFIG_PID=$!
cd ..
echo "Waiting for Config Service (20s)..."
sleep 20

# 3. Start Discovery Service
echo -e "${GREEN}[3/7] Starting Discovery Service...${NC}"
cd discovery-service
./mvnw spring-boot:run > ../logs/discovery-service.log 2>&1 &
DISCOVERY_PID=$!
cd ..
echo "Waiting for Discovery Service (20s)..."
sleep 20

# 4. Start Gateway Service
echo -e "${GREEN}[4/7] Starting Gateway Service...${NC}"
cd gateway-service
./mvnw spring-boot:run > ../logs/gateway-service.log 2>&1 &
GATEWAY_PID=$!
cd ..

# 5. Start Product Service
echo -e "${GREEN}[5/7] Starting Product Service...${NC}"
cd product-service
./mvnw spring-boot:run > ../logs/product-service.log 2>&1 &
PRODUCT_PID=$!
cd ..

# 6. Start Order Service
echo -e "${GREEN}[6/7] Starting Order Service...${NC}"
cd order-service
./mvnw spring-boot:run > ../logs/order-service.log 2>&1 &
ORDER_PID=$!
cd ..

# Create logs directory if not exists
mkdir -p logs

echo "Waiting for services to initialize (30s)..."
sleep 30

# 7. Start Frontend
echo -e "${GREEN}[7/7] Starting Frontend...${NC}"
cd frontend
npm run dev

# Keep script running to maintain background processes
wait
