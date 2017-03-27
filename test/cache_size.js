export default function(localforage, utils) {
  var testLF,
      lruIndex  = 'TEST_LRU_INDEX',
      cacheSize = 5,
      lruKey    = 'TEST_LRU_KEY',
      testKey   = 'TEST_KEY',
      testValue = 'TEST_VALUE';

  before((done) => {
    testLF = localforage.createInstance({
      driver    : 'lruStorage',
      name      : 'testLruCacheSize',
      storeName : 'LRU_CACHE_SIZE_TEST',
      lruIndex  : lruIndex,
      cacheSize : cacheSize,
      lruKey    : lruKey
    })
    testLF.ready().then(() => done(), done)
  });

  describe('lruStorage cache size tests', () => {
    beforeEach((done) => {
      utils.setItemTimes(testLF, testKey, testValue, 5)
      .then(() => done(), done);
    });

    afterEach((done) => {
      testLF.removeItem(testKey).then(() => done(), () => done());
    });

    it('cannot store more than cache size', (done) => {
      testLF.setItem(testKey, testValue)
      .then(() => testLF.length())
      .then(length => {
        assert(length <= cacheSize, 'store size excedes cache size');
        done();
      })
      .catch(done);
    });

    it('removes least recently accessed item', (done) => {
      testLF.getItem(`${testKey}_${5}`)
      .then(() => testLF.setItem(testKey, testValue))
      .then(() => testLF.getItem(`${testKey}_${5}`))
      .then(value => {
        assert.ok(value, 'least recently accessed value was removed');
        done();
      })
      .catch(done);
    });
  });
}
