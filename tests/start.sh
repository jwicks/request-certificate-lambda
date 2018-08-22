#!/usr/bin/env bash
# Tests local Node.JS lambda function with lambda-local
# npm install -g lambda-local

lambda-local -l ../src/index.js -h handler -E {\"KMS_KEY_ID\":\"abc1234\"} -e payloadValid.js
lambda-local -l ../src/index.js -h handler -E {\"KMS_KEY_ID\":\"abc1234\"} -e payloadInvalid.js
