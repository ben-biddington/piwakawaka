#!/bin/bash 

    webpack --display-minimal --config ./src/adapters/web/application.webpack.config.js\
&&  webpack --display-minimal --config ./src/adapters/web/adapters.webpack.config.js\
&&  webpack --display-minimal --config ./src/adapters/web/hn-application.webpack.config.js