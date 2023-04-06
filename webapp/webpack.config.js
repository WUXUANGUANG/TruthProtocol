module.exports = {
    entry: './static/js/app.js',
    output: {
      filename: 'bundle.js',
      path: __dirname + '/static/js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  };
  