#!/usr/bin/env bash
# Tests local Node.JS lambda function with lambda-local
# npm install -g lambda-local

lambda-local -l ../src/index.js -h handler -e payloadValid.js
lambda-local -l ../src/index.js -h handler -e payloadInvalid.js
