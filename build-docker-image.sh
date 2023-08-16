#!/bin/bash

set -xe

rm -rf .next
yarn
yarn build

bash ./bundle-client.sh
docker build --network=host -t nfrederick023/redditraven:latest -t nfrederick023/redditraven:1.01 .
rm docker-bundle.tgz
