export default function(localforage, utils) {
  var testLF,
      lruIndex  = 'TEST_LRU_INDEX',
      cacheSize = 100,
      lruKey    = 'TEST_LRU_KEY',
      testKey   = 'TEST_KEY',
      testValue = 'TEST_VALUE';

  before((done) => {
    testLF = localforage.createInstance({
      driver    : 'lruStorage',
      name      : 'testLruCache',
      storeName : 'LRU_TEST',
      lruIndex  : lruIndex,
      cacheSize : cacheSize,
      lruKey    : lruKey
    })
    testLF.ready().then(() => done(), done)
  });

  describe('lruStorage initStore tests', () => {
    it('driver is set correctly', () => {
      assert(testLF._driver === 'lruStorage',  'incorrect driver');
    });

    it('options are set correctly', () => {
      assert(testLF._lruIndex  === lruIndex,  'incorrect lruIndex option');
      assert(testLF._cacheSize === cacheSize, 'incorrect cacheSize option');
      assert(testLF._lruKey    === lruKey,    'incorrect lruKey option');
    });
  });

  describe('lruStorage setItem tests', () => {
    before((done) => {
      testLF.deleteIndex(lruIndex).then(() => done(), done);
    });

    afterEach((done) => {
      testLF.removeItem(testKey).then(() => done(), () => done());
    });

    it('index is available after setItem', (done) => {
      testLF.setItem(testKey, testValue, () =>
        testLF.getIndex(lruIndex).then((index) => {

          assert.ok(index, 'index not created');
          assert(index.keyPath === lruKey, 'incorrect keypath created');

          done()
        }, done)
      )
    });

    it('setItem callback works', (done) => {
      testLF.setItem(testKey, testValue, (err, value) => {
        assert(err === null, 'callback resolved with error');
        assert(value === testValue, 'set value was incorrect');
        done();
      })
    });

    it('setItem chains with then', (done) => {
      testLF.setItem(testKey, testValue).then((value) => {
        assert(value === testValue, 'set value was incorrect');
        done();
      });
    });

    // it('setItem updates value with lruKey')
  });

  describe('lruStorage getItem tests', () => {
    beforeEach((done) => {
      testLF.setItem(testKey, testValue).then(() => done(), () => done());
    });

    afterEach((done) => {
      testLF.removeItem(testKey).then(() => done(), () => done());
    });

    it('getItem callback works', (done) => {
      testLF.getItem(testKey, (err, value) => {
        assert(err === null, 'callback resolved with error');
        assert(value === testValue, 'set value was incorrect');
        done();
      })
    });

    it('getItem chains with then', (done) => {
      testLF.getItem(testKey).then((value) => {
        assert(value === testValue, 'set value was incorrect');
        done();
      });
    });

    // it('getItem updates value with lruKey')
  });
}
