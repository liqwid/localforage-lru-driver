import config from './rollup.config';

config.format = 'umd';
config.dest = 'dist/localforage-lru-driver.js';
config.moduleName = 'localforageLruDriver';

export default config;
