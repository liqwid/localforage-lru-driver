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
        return new Promise((resolve, reject) => {
            this.getIndex(this._lruIndex, (err, index) => {
                var indexCb = ((err, index) => {
                    if (err) return reject(err);

                    _checkIndexLength.call(this, index)
                    .then(_updateValue.bind(this, key, callback, value))
                    .then(resolve)
                    .catch(reject);
                })

                // index does not exist
                if (err) return this.createIndex(
                    this._lruIndex, this._lruKey, indexCb
                );

                // index has correct key
                if (index.keyPath === this._lruKey) return indexCb(null, index);

                // index has wrong key
                this.updateIndex(this._lruIndex, this._lruKey, indexCb);
            })
        });
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

function _updateValue(key, callback, value) {
    var updatedValue = { data: value };
    updatedValue[this._lruKey] = Date.now();

    if (typeof callback === 'function') {
        return _getBaseMethod('setItem').call(
          this, key, updatedValue, (err, value) => callback(err, value.data)
        ).then(value => value.data);
    }

    return _getBaseMethod('setItem').call(this, key, updatedValue)
    .then(value => value.data);
}

_wireUpDummyMethods(lruDriver);

export default lruDriver;
