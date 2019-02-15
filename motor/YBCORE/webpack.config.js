var path = require("path");
var webpack = require("webpack");
var jquery = require("jquery")
// var BundleTracker = require("webpack-bundle-tracker");
var BowerWebpackPlugin = require("bower-webpack-plugin");
// var EncodingPlugin = require("webpack-encoding-plugin");

module.exports = {
    context: __dirname,

    entry: "./index",

    output: {
        path: path.resolve("./assets/bundles/"),
        filename: "[name].js",
        libraryTarget: "var",
        library: "YEBOYEBO",
    },

    plugins: [
        // new BundleTracker({filename: "./webpack-stats.json"}),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new BowerWebpackPlugin({
            modulesDirectories: ["bower_components"],
            manifestFiles: "bower.json",
            includes: /.*\.js/,
            excludes: [],
            searchResolveModulesDirectories: true
        }),
        // new webpack.optimize.DedupePlugin(),
        // new webpack.optimize.UglifyJsPlugin({minimize: true})
        // new EncodingPlugin({encoding: "iso-8859-16"})
    ],

    module: {
        loaders: [{
            test: /(\.js|\.jsx)$/,
            exclude: /(node_modules)/,
            loader: "babel",
            query: {
                presets: ["es2015", "react"]
            }
        }]
    },

    resolve: {
        modulesDirectories: ["node_modules", "bower_components", "YBCORE"],
        extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    },

    watch: true
}
