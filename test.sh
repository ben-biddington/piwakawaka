#!/bin/bash

set -e

bash install.sh

echo 'Building'

npm run build

echo 'Running all tests'

echo 'Vanilla'
npm run test.acceptance

echo 'CLI'
VIEW_ADAPTER=cli npm run test.acceptance

echo 'Integration tests'
npm run test.integration

echo 'Unit tests'
npm run test.unit
