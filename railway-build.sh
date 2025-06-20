#!/bin/sh
set -e
npm ci
find node_modules -type f -name biome -exec chmod +x {} \;
npm run build 