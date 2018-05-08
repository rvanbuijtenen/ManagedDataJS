# ManagedDataJS

## Installation:

Nodejs version: node.js@6.11.2

NPM version: npm@3.10.10



#### Clean install:

download node https://nodejs.org/dist/v6.11.2/
extract and copy the directories [bin, include, lib, share] to /usr/[bin, include, lib, share]


#### Replace the broken symbolic link to npm:

```shell
sudo rm /usr/bin/npm
sudo ln -s /usr/lib/node_modules/npm/bin/npm-cli.js /usr/bin/npm
```

#### check node and npm version:

```shell
node -v
v6.11.2

npm -v
3.10.10
```

#### clone repository, install dependencies, compile js and run server:

```shell
git clone https://github.com/rvanbuijtenen/ManagedDataJS.git
cd ManagedDataJS
npm install
npm run webpack
npm run start
```

#### or run one of the node compatible StateMachine examples:
```shell
npm run webpack
node build/ManagedStateMachine.bundle.js
node build/RegularStatemachine.bundle.js
```

#### Open the browser at localhost:8080 to view examples and documentation


#### Reason for slow performance: BABEL
http://incaseofstairs.com/2015/06/es6-feature-performance/
