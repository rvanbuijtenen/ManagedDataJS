# ManagedDataJS

## Installation:

Nodejs version: node.js@6.11.2

NPM version: npm@3.10.10



#### Clean install:

download node https://nodejs.org/dist/v6.11.2/

extract and copy the directories [bin, include, lib, share] to /usr/[bin, include, lib, share]


#### Replace the broken symbolic link to npm:

$  sudo rm /usr/bin/npm

$  sudo ln -s /usr/lib/node_modules/npm/bin/npm-cli.js /usr/bin/npm


#### check node and npm version:

$  node -v

v6.11.2

$  npm -v

3.10.10


#### install dependencies, compile js and run server:

$  cd ManagedDataJS

$  npm install
$  npm run webpack
$  npm run start

#### Open the browser at localhost:8080 to view examples and documentation

