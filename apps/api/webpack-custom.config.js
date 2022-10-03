const { merge } = require('webpack-merge');
const { IgnorePlugin } = require('webpack');

module.exports = (config, context) => {
  return merge(config, {
    plugins:[
      new IgnorePlugin({ resourceRegExp: /^pg-native$/})
      ]
  });
};
