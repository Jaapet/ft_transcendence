#!/bin/bash

echo "Initializing Next.js"

until [ -d /app/src ]
do
	sleep 2
done

cd /app/src

until [ -f package.json ]
do
	sleep 2
done

echo "Installing Next.js dependencies"

# PRODUCTION

npm install --omit=dev
npm run build
echo "Launching Next.js in production mode"
npm run start

# DEVELOPMENT
# npm install
# npm run dev
