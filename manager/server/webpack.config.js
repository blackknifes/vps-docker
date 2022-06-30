const webpack = require("webpack");
const path = require("path");
const process = require("process")
const nodeExternals = require("webpack-node-externals");

const config = {
    entry: {
        main: path.resolve(__dirname, "src/index.js")
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js"
    },
    target: "node",
    node: {
        global: true,
        __filename: true,
        __dirname: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: "babel-loader",
                exclude: /node_modules/
            }
        ]
    },
    externalsPresets: { node: true },
    externals: [nodeExternals()],
    mode: process.env.mode,
    plugins: [
        new webpack.DefinePlugin({
            "process.env.mode": process.env.mode
        })
    ]
};

if (process.env.mode == "development") {
    config.devtool = "source-map";
}
else {
    config.optimization = {
        minimize: true
    };
}

module.exports = config;