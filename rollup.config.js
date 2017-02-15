import babel from 'rollup-plugin-babel';

export default {
  entry: 'lib/localforage-lru-driver.js',
  // sourceMap: true,
  plugins: [babel()]
};
