#!/bin/bash

bash install.sh

echo 'Building'

npm run webpack.build

echo 'Running all tests'

echo 'Vanilla'
npm run test.acceptance && \

echo 'Integration tests'
npm run test.integration

echo 'Unit tests'
npm run test.unit
