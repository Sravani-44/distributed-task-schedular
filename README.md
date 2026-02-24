# Distributed Task Scheduler

A distributed task scheduling system built with:

- Node.js
- TypeScript
- Express
- PostgreSQL
- Redis
- BullMQ
- Docker

## Architecture

Client → API → PostgreSQL  
Scheduler → Redis Queue  
Worker → Executes Jobs  

## Services

- API Service
- Scheduler Service
- Worker Service
- Redis
- PostgreSQL

## Run Locally

docker compose up -d

cd services/api && npm run dev
cd services/scheduler && npm run dev
cd services/worker && npm run dev
