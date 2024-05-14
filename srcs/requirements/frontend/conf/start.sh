#!/bin/bash

echo "salut"

until [ -d /app/src ]
do
	sleep 2
done

echo "src exists"

cd /app/src

until [ -f package.json ]
do
	sleep 2
done

echo "package.json exists"

npm install

echo "installed deps"

echo "launching"

npm run dev
