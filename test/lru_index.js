export default function(localforage, utils) {
  var testLF, iDB,
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
    });

    iDB = localforage.createInstance({
      driver    : 'asyncStorage',
    });

    testLF.ready().then(() => iDB.ready()).then(() => done(), done);
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
        })
        .catch(done)
      ).catch(done);
    });

    it('setItem callback works', (done) => {
      testLF.setItem(testKey, testValue, (err, value) => {
        assert(err === null, 'callback resolved with error');
        assert(value === testValue, 'set value was incorrect');
        done();
      })
      .catch(done);
    });

    it('setItem chains with then', (done) => {
      testLF.setItem(testKey, testValue).then((value) => {
        assert(value === testValue, 'set value was incorrect');
        done();
      });
    });

    it('setItem updates value with lruKey', (done) => {
      var beforeTest = Date.now();
      testLF.setItem(testKey, testValue)
      .then(() => iDB.getItem.call(testLF, testKey))
      .then((value) => {
        assert(value.hasOwnProperty(lruKey), 'access time is not added to the entry');
        assert(value[lruKey] >= beforeTest, 'entry last access time is earlier than the test\'s start time');
        done();
      })
      .catch(done);
    });
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
      .catch(done);
    });

    it('getItem chains with then', (done) => {
      testLF.getItem(testKey).then((value) => {
        assert(value === testValue, 'set value was incorrect');
        done();
      })
      .catch(done);
    });

    it('getItem asking for non-existing item returns null', (done) => {
      testLF.getItem('DOES_NOT_EXIST').then((value) => {
        assert(value === null, 'value of non-existing item is not null');
        done();
      })
      .catch(done);
    });

    it('getItem asking for non-existing item does not create an entry', (done) => {
      testLF.getItem('DOES_NOT_EXIST')
      .then(() => iDB.getItem.call(testLF, 'DOES_NOT_EXIST'))
      .then((value) => {
        assert(value === null, 'getItem created entry while asking for non-existing item');
        done();
      })
      .catch(done);
    });

    it('getItem updates value with lruKey', (done) => {
      var beforeTest = Date.now();
      testLF.getItem(testKey)
      .then(() => iDB.getItem.call(testLF, testKey))
      .then((value) => {
        assert(value.hasOwnProperty(lruKey), 'access time is not added to the entry');
        assert(value[lruKey] >= beforeTest, 'entry last access time is earlier than the test\'s start time');
        done();
      })
      .catch(done);
    });
  });
}
