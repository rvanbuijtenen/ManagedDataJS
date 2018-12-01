# ManagedDataJS

## Installation:

Nodejs version: node.js@6.11.2

NPM version: npm@3.10.10


#### Clean install:

download node https://nodejs.org/dist/v6.11.2/

#### check node and npm version, should be greater or equal to:

```shell
node -v
v6.11.2

npm -v
3.10.10
```

#### clone repository, install dependencies, compile js and run server for a (browser) example:

quick setup:

```shell
git clone https://github.com/rvanbuijtenen/ManagedDataJS.git
cd ManagedDataJS
npm install
npm run webpack
npm run start
```

go to localhost:8080 and explore the examples and documentation

#### or run the node example that compares two stateMachine implementations:

the log-level option can be one of [debug, info, exception, none].

the --long option can be given to run a long sequence of events for more accurate timing results.
```shell
npm run statemachine -- --log-level=debug|info|exception|none
```

#### Open the browser at localhost:8080 to view examples and documentation


#### Reason for slow performance: BABEL
http://incaseofstairs.com/2015/06/es6-feature-performance/
