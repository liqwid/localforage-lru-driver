localforage-lru-driver
==============================

Localforage driver that maintains cache size depending on least-recently-used(lru) principle.
[localForage](https://github.com/mozilla/localForage).

## Requirements

* [localforage](https://github.com/mozilla/localForage) v1.4.0+
* [localforage-removeitems](https://github.com/localForage/localForage-removeItems) v1.4.0+
* [localforage-indexes](https://github.com/liqwid/localforage-indexes) v1.0.2+

## Installation
`npm i localforage-lru-driver`

### Usage

Inserting into your project

```js
import { extendPrototypeResult as localforage } from 'localforage-indexes';
import { lruDriver } from 'localforage-lru-driver';

localforage.defineDriver(lruDriver)
.then(function() {
  var lf = localforage.createInstance({
    driver    : 'lruStorage',
    cacheSize : 100
  });

  return lf.ready();
})
.then(function(lf) {
  // use localforage
})
```

When items count exceed `cacheSize`, least recently used item is removed:

```js
// .... set items with keys KEY_1 ... KEY_100

lf.setItem('KEY_101', 'value')
.then(() => lf.length())
.then(length => console.log(length)) // 100
);
```

Each time an entry is accessed through `getItem` or `setItem` it is updated:

```js
// .... set items with keys KEY_1 ... KEY_100. KEY_1 is set first

lf.getItem('KEY_1') // last access time updated
.then(() => lf.setItem('KEY_101', 'value'))
.then(length => console.log(length)) // 100
.then(() => lf.getItem('KEY_1'))
.then((key1Value) => console.log(key1Value)) // still present in the localforage
```

### Contructor options

`cacheSize`

Maximum number of entries allowed to store
Default value: `1000`

`lruKey`

Name of the key that is used for keeping last access timestamp
Default value: `ACCESS_TIME`

`lruIndex`

Name of the index that is used for sorting items by last access time
Default value: `lruIndex`

### Links

* [GitHub](https://github.com/liqwid/localforage-lru-driver)
* [NPM](https://www.npmjs.com/package/localforage-lru-driver)
