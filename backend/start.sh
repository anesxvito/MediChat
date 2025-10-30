#!/bin/bash
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Creating default admin user..."
node create-admin.js || true

echo "Starting server..."
npm start
