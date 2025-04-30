#!/bin/bash
set -e

# Start the application with the path fix
NODE_ENV=development node --experimental-specifier-resolution=node --import ./pathfix.js --loader tsx ./server/index.ts