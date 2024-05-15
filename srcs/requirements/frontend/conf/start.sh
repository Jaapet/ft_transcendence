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

echo "Installing dependencies"
npm install

npm run dev
