var _baseMethods = {};

var localforageMethods = [
    '_initStorage',
    'clear',
    'getItem',
    'iterate',
    'key',
    'keys',
    'length',
    'removeItem',
    'setItem'
];

/**
 * Adds base methods that were not overrided
 * Puts overrided base methods to _baseMethods container
 * @param {LocalForage} lfInstance - instance to add methods to
 * @param {Object} driver - new driver object
 * @param {Object} baseDriver - driver to draw base methods from
 */
export function _wireUpMethods(lfInstance, driver, baseDriver) {
    for (var method of localforageMethods) {
        if (!driver.hasOwnProperty(method) || driver[method].prototype.dummy) {
            lfInstance[method] = baseDriver[method];
        } else {
            _baseMethods[method] = baseDriver[method];
        }
    }
}

/**
 * Returns a base method. Can only be called after _wireUpMethods is complete
 * @param {String} method - method name
 * @return {Function} method
 */
export function _getBaseMethod(method) {
    return _baseMethods[method];
}

/**
 * HACK: fills driver with empty functions
 * so that driver creation can be a sync process
 *
 * The problem is that LocalForage.prototype.getDriver is async
 * and base driver cannot be acquired in synchronous code
 * @param {Object} driver
 */
export function _wireUpDummyMethods(driver) {
    for (var method of localforageMethods) {
        if (!driver.hasOwnProperty(method)) {
            driver[method] = dummy;
        }
    }
}

/**
 * Returns length of an index
 * @param {IDBIndex} index
 * @param {function(err, result)} callback
 */
export function _getIndexLength(index, callback) {
    var request = index.count();

    request.onsuccess = () => callback(null, request.result);
    request.onerror   = callback;
}

function dummy() {}
dummy.prototype.dummy = true;
