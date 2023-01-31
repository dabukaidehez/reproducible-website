module.exports = {
  productionSourceMap: false,
  // publicPath: '/openGauss/',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    open: false,
    https: false,
    hot: true,
    compress: true,
    proxy: {
      '/api': {
        target: 'http://192.168.0.88:9991/',
        // target: 'https://reproducible-builds.opengauss.org', // 华为云
        // pathRewrite: {
        //   '^/api': '',
        // },
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
