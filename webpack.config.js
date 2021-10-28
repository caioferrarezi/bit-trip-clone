const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = env => {
  return {
    mode: env.NODE_ENV,
    entry: './src/index.js',
    output: {
      filename: '[name]-[hash].js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      modules: ['node_modules'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
      extensions: ['.js']
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html')
      })
    ]
  }
}
