const path = require('path');
const webpack = require('webpack');

const babelLoaderConfiguration = {
    test: /\.js$/,
    // Add every directory that needs to be compiled by Babel during the build
    include: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules/react-native-uncompiled')
    ],
    use: {
        loader: 'babel-loader',
        options: {
            cacheDirectory: true,
            // This aliases 'react-native' to 'react-native-web' and includes only
            // the modules needed by the app
            plugins: ['../../babel'],
            // The 'react-native' preset is recommended (or use your own .babelrc)
            presets: ['react-native']
        }
    }
};

// This is needed for webpack to import static images in JavaScript files
const imageLoaderConfiguration = {
    test: /\.(gif|jpe?g|png|svg)$/,
    use: {
        loader: 'url-loader',
        options: {
            name: '[name].[ext]'
        }
    }
};


module.exports = {
    devServer: {
        contentBase: path.join(__dirname, '')
    },
    entry: [
        path.join(__dirname, './index.js')
    ],
    module: {
        rules: [
            babelLoaderConfiguration,
            imageLoaderConfiguration
        ]
    },
    output: {
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurrenceOrderPlugin()
    ],
    resolve: {
        // Maps the 'react-native' import to 'react-native-web'.
        alias: {
            'react-native': path.join(__dirname, '../dist')
        },
        // If you're working on a multi-platform React Native app, web-specific
        // module implementations should be written in files using the extension
        // `.web.js`.
        extensions: [ '.web.js', '.js' ]
    }
};


// const path = require('path');
// const webpack = require('webpack');
//
// module.exports = {
//     devServer: {
//         contentBase: path.join(__dirname, 'src')
//     },
//     entry: [
//         path.join(__dirname, './src/index.js')
//     ],
//     module: {
//         loaders: [
//             {
//                 test: /\.js$/,
//                 exclude: /node_modules/,
//                 loaders: [
//                     'react-hot-loader',
//                     'babel-loader?cacheDirectory=true'
//                 ]
//             },
//             {
//                 // Most react-native libraries include uncompiled ES6 JS.
//                 test: /\.js$/,
//                 include: /node_modules\/react-native-/,
//                 loader: 'babel-loader',
//                 query: { cacheDirectory: true ,
//                     presets: ['es2015']
//                 }
//             },
//             {
//                 test: /\.(gif|jpe?g|png|svg)$/,
//                 loader: 'url-loader',
//                 query: { name: '[name].[hash:16].[ext]' }
//             }
//         ]
//     },
//     output: {
//         filename: 'bundle.js'
//     },
//     plugins: [
//         new webpack.DefinePlugin({
//             'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
//         }),
//         new webpack.optimize.DedupePlugin(),
//         new webpack.optimize.OccurrenceOrderPlugin()
//     ],
//     resolve: {
//         alias: {
//             'react-native': 'react-native-web'
//         }
//     }
// };
//
