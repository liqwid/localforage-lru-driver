import { extendPrototypeResult as localforage } from 'localforage-indexes';
import * as utils from './utils.js';
import cacheSizeTest from './cache_size.js';
import lruIndexTest from './lru_index.js';
import lruDriver from '../lib/localforage-lru-driver.js';

localforage.defineDriver(lruDriver)
.then(() => {
  lruIndexTest(localforage, utils);
  cacheSizeTest(localforage, utils);
});
