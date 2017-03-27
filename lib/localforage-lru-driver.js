import { localforageRemoveItems } from 'localforage-removeitems';
import { _getBaseMethod, _wireUpMethods, _wireUpDummyMethods, _getIndexLength } from './utils.js';

var lruDriver = {
    _driver: 'lruStorage',
    _initStorage(options) {
        this._lruIndex  = options.lruIndex  || 'lruIndex';
        this._cacheSize = options.cacheSize || 1000;
        this._lruKey    = options.lruKey    || 'ACCESS_TIME';

        return this.getDriver(this.INDEXEDDB)
        .then(_wireUpMethods.bind(null, this, lruDriver))
        .then(() => _getBaseMethod('_initStorage').call(this, options))
    },

    setItem(key, value, callback) {
        return this.getIndex(this._lruIndex)
        .then((index) => {
            // index has correct key
            if (index.keyPath === this._lruKey) return index;

            // index has wrong key
            return this.updateIndex(this._lruIndex, this._lruKey)
        }, () =>
            // index does not exist
            this.createIndex(this._lruIndex, this._lruKey)
        )

        .then(_checkIndexLength.bind(this))
        .then(_updateValue.bind(this, key, callback, value));
    },

    getItem(key, callback) {
        return _getBaseMethod('getItem').call(this, key)
        .then(value =>
            (value === null) ?
            null             :
            _updateValue.call(this, key, callback, value.data)
        )
    }
}

function _checkIndexLength(index) {
    return _getIndexLength(index)
    .then(length => new Promise((resolve, reject) => {
        if (length < this._cacheSize) return resolve();
        var request = index.getAllKeys();

        request.onerror = reject;
        request.onsuccess = () => {
            var keys = request.result;

            localforageRemoveItems.call(
              this, keys.slice(0, keys.length - this._cacheSize + 1)
            ).then(() => resolve(), reject)
        }
    }));
}

function _updateValue(key, callback, value) {
    var updatedValue = { data: value };
    updatedValue[this._lruKey] = Date.now();

    if (typeof callback === 'function') {
        return _getBaseMethod('setItem').call(
          this, key, updatedValue, (err, value) => callback(err, value.data)
        );
    }

    return _getBaseMethod('setItem').call(this, key, updatedValue)
    .then(value => value.data);
}

_wireUpDummyMethods(lruDriver);

export default lruDriver;
