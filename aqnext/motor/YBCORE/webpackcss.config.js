var path = require("path");
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: __dirname,

    entry: './index.less',

    output: {
        path: path.resolve('./assets/bundles'),
        filename: "auxcss.js",
    },

    plugins: [
        new ExtractTextPlugin('main.css'),
    ],

    module: {
        loaders: [
            {
                test: /\.(less|css)$/,
                loader: ExtractTextPlugin.extract('css?sourceMap!' + 'less?sourceMap')
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader?name=imgs/[name].[ext]'
            },
            {
                test: /\.(woff|woff2|ttf|svg|eot)(|\?.+)$/,
                loader: 'file-loader?name=fonts/[name].[ext]'
            }
        ]
    },

    resolve: {
        modulesDirectories: ['node_modules', 'bower_components', 'YBCORE']
    },

    watch: true,
}
