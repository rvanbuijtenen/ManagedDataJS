 var path = require('path');
 var webpack = require('webpack');

 module.exports = {
    target: 'node',
    entry : {
        ManagedStateMachine: './src/js/comparison/ManagedStateMachine.js',
        RegularStateMachine: './src/js/comparison/RegularStateMachine.js',
        main: './src/js/main.js'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'stage-2']
                },
                exclude: ['./node_modules']
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
 };