module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/settings/' : '/',
  assetsDir: 'static',
  pages: process.env.NODE_ENV === 'production'
    ? {
      index: {
        entry: 'src/main.js',
        template: 'index-prod.html',
        filename: 'index.html'
      }
    }
    : undefined,
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()

    config.module
      .rule('svg')
      .oneOf('sprite')
      .test(/icons\/.*\.svg$/)
      .use('babel')
      .loader('babel-loader')
      .end()
      .use('svg-sprite')
      .loader('svg-sprite-loader')
      .end()
      .use('svgo')
      .loader('svgo-loader')
      .end()
      .end()

      .oneOf('other')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'img/[name].[hash:8].[ext]'
      })
      .end()
      .end()
  },

  devServer: {
    proxy: {
      '^/ws': {
        target: 'ws://localhost:8001',
        secure: false,
        ws: true
      },
      '^/login|^/logout|^/project.json|^/projects.json': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      // '^/api/login|^/api/logout': {
      //   target: 'http://localhost:8000',
      //   pathRewrite: (path, req) => path.replace('/api', '')
      // },
      '^/api': {
        target: 'http://localhost:8001'
      },
      '^/dev': {
        target: 'http://localhost:8001',
        changeOrigin: true
      }
    }
  }
}
