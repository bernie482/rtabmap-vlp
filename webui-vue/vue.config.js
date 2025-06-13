const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: () => {
          const envName = process.env.VUE_APP_ENV_NAME;
          const hasCustomStyles =
            process.env.CUSTOM_STYLES === 'true' ? true : false;
          if (hasCustomStyles && envName !== undefined) {
            // If there is an env name defined, import Sass
            // overrides.
            // It is important that these imports stay in this
            // order to make sure enviroment overrides
            // take precedence over the default BMC styles
            return `
              @import "@/assets/styles/bmc/helpers";
              @import "@/env/assets/styles/_${envName}";
              @import "@/assets/styles/bootstrap/_helpers";
            `;
          } else {
            // Include helper imports so single file components
            // do not need to include helper imports

            // BMC Helpers must be imported before Bootstrap helpers to
            // take advantage of Bootstrap's use of the Sass !default
            // statement. Moving this helper after results in Bootstrap
            // variables taking precedence over BMC's
            return `
              @import "@/assets/styles/bmc/helpers";
              @import "@/assets/styles/bootstrap/_helpers";
            `;
          }
        },
      },
    },
  },
  devServer: {
    https: true,
    proxy: {
      '/cgi': {
        target: process.env.BASE_URL,
        logLevel: process.env.VUE_APP_LOG_LEVEL,
        pathRewrite: (path, req) => {
          let newPath = path;
          if (process.env.CUSTOM_USE_MOCK_SERVER) {
            // handle when get headers query, pre-append as query
            if (req.headers.query) {
              let matches = path.match(/([^?]+)/gi);
              if (matches.length == 1) {
                newPath = `${newPath}/${req.headers.query}`;
              } else {
                let uri = matches.shift();
                newPath = `${uri}/${req.headers.query}/${matches.join('/')}`;
              }
            }
          }
          return newPath;
        },
      },
      '/': {
        target: process.env.BASE_URL || 'http://127.0.0.1',
        logLevel: process.env.VUE_APP_LOG_LEVEL,
        router: (req) => {
          if (process.env.CUSTOM_USE_MOCK_SERVER) {
            const wsUrls = ['/subscribe', '/mi_ws_msg_service'];
            if (wsUrls.find((url) => url == req.url)) {
              return process.env.WS_URL;
            } else {
              return process.env.BASE_URL;
            }
          } else {
            return process.env.BASE_URL;
          }
        },
        onProxyReq: function (request) {
          request.setHeader('origin', process.env.BASE_URL);
        },
        onProxyRes: (proxyRes) => {
          // This header is ignored in the browser so removing
          // it so we don't see warnings in the browser console
          delete proxyRes.headers['strict-transport-security'];
        },
      },
    },
    port: process.env.VUE_APP_PORT || 8000,
  },
  productionSourceMap: false,
  configureWebpack: (config) => {
    const envName = process.env.VUE_APP_ENV_NAME;
    const hasCustomStore = process.env.CUSTOM_STORE === 'true' ? true : false;
    const hasCustomPlugin = process.env.CUSTOM_PLUGIN === 'true' ? true : false;
    const hasCustomRouter = process.env.CUSTOM_ROUTER === 'true' ? true : false;
    const hasCustomAppNav =
      process.env.CUSTOM_APP_NAV === 'true' ? true : false;

    if (envName !== undefined) {
      if (hasCustomStore) {
        // If env has custom store, resolve all store modules. Currently found
        // in src/router/index.js src/store/api.js and src/main.js
        config.resolve.alias['./store$'] = `@/env/store/${envName}.js`;
        config.resolve.alias['../store$'] = `@/env/store/${envName}.js`;
      }
      if (hasCustomPlugin) {
        // if env has custom plugin, resolve plugins in src/store/index.js
        config.resolve.alias[
          './plugins/WebSocketPlugin$'
        ] = `@/env/${envName}/store/plugins`;
      }
      if (hasCustomRouter) {
        // If env has custom router, resolve routes in src/router/index.js
        config.resolve.alias['./routes$'] = `@/env/router/${envName}.js`;
      }
      if (hasCustomAppNav) {
        // If env has custom AppNavigation, resolve AppNavigationMixin module in src/components/AppNavigation/AppNavigation.vue
        config.resolve.alias[
          './AppNavigationMixin$'
        ] = `@/env/components/AppNavigation/${envName}.js`;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new CompressionPlugin({
          deleteOriginalAssets: true,
        })
      );
    }
  },
  pluginOptions: {
    i18n: {
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
};
