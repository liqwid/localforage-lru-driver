import { localforageRemoveItems } from 'localforage-removeitems';
import { _getBaseMethod, _wireUpMethods, _wireUpDummyMethods, _getIndexLength } from './utils.js';

var lruDriver = {
    _driver: 'lruStorage',
    _initStorage(options) {
        this._lruIndex  = options.lruIndex  || 'lruIndex';
        this._cacheSize = options.cacheSize || 1000;
        this._lruKey    = options.lruKey    || 'ACCESS_TIME';

        return this.getDriver(this.INDEXEDDB)
        .then((baseDriver) => _wireUpMethods(this, lruDriver, baseDriver))
        .then(() => _getBaseMethod('_initStorage').call(this, options));
    },

    setItem(key, value, callback) {
        return new Promise((resolve, reject) => {
            var indexCb = (err, index) => {
                if (err) return reject(err);

                _limitCacheSize.call(this, index)
                .then(() => _updateEntry.call(this, key, value, callback))
                .then(resolve)
                .catch(reject);
            };

            this.getIndex(this._lruIndex, (err, index) =>
                _ensureIndex.call(this, err, index, indexCb)
            );
        });
    },

    getItem(key, callback) {
        return _getBaseMethod('getItem').call(this, key)
        .then(value =>
            (value === null) ?
            null             :
            _updateEntry.call(this, key, value.data, callback)
        )
    }
}

/**
 * Removes least recently accessed items that exceed cache size
 * @param {IDBIndex} index - access time index
 * @return {Promise}
 */
function _limitCacheSize(index) {
    return new Promise((resolve, reject) =>
        _getIndexLength(index, (err, length) => {
            if (err) return reject(err);

            if (length < this._cacheSize) return resolve();
            var request = index.getAllKeys();

            request.onerror = reject;
            request.onsuccess = () => {
                var keys = request.result;

                localforageRemoveItems.call(
                    this, keys.slice(0, keys.length - this._cacheSize + 1)
                ).then(() => resolve(), reject)
            }
        })
    );
}

/**
 * Creates index if it doesn't exist, updates index if it has wrong keypath
 * @param {Error} err - truthy if index was not found
 * @param {IDBIndex} index
 * @param {function(err, index)} callback
 */
function _ensureIndex(err, index, callback) {
    // HACK: index presence should be checked inside _initStorage function
    // but indexes can only be used after _initStorage

    // index does not exist
    if (err) return this.createIndex(this._lruIndex, this._lruKey, callback);

    // index has correct key
    if (index.keyPath === this._lruKey) return callback(null, index);

    // index has wrong key
    this.updateIndex(this._lruIndex, this._lruKey, callback);
}

/**
 * Updates entry's access time and data
 * @param {string} key - keypath of entry
 * @param {any} data - entry's new data
 * @param {function(err, data)} callback gets called with entry's data
 * @return {Promise<data>} resolves with entry's data
 */
function _updateEntry(key, data, callback) {
    var _callback;
    var updatedValue = { data: data };
    updatedValue[this._lruKey] = Date.now();

    if (typeof callback === 'function') {
        _callback = ((err, entry) => callback(err, entry.data));
    }

    return _getBaseMethod('setItem').call(this, key, updatedValue, _callback)
    .then(entry => entry.data);
}

_wireUpDummyMethods(lruDriver);

export default lruDriver;
