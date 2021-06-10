const path = require('path');

module.exports = {
  entry: './index.js',  // path to the input file
  output: {
    filename: 'profile.js',  // output bundle file name
    path: path.resolve(path.dirname(path.dirname(__dirname)), './static/js'),  // path to Django static directory
  },
  module: {
    rules: [
      {// use Babel's env and react presets to compile all .js and .jsx files that aren't inside the node_modules directory
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: { presets: ["@babel/preset-env", "@babel/preset-react"] } //babel use these preset,1 for react and 1 for javascript backward compatibility with browser
      },
        { //loader to handle css file
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ]
  }
};
