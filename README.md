# toolbag-plugin-policy

[![Current Version](https://img.shields.io/npm/v/toolbag-plugin-policy.svg)](https://www.npmjs.org/package/toolbag-plugin-policy)
[![Build Status via Travis CI](https://travis-ci.org/continuationlabs/toolbag-plugin-policy.svg?branch=master)](https://travis-ci.org/continuationlabs/toolbag-plugin-policy)
![Dependencies](http://img.shields.io/david/continuationlabs/toolbag-plugin-policy.svg)

[![belly-button-style](https://cdn.rawgit.com/continuationlabs/belly-button/master/badge.svg)](https://github.com/continuationlabs/belly-button)

[Toolbag](https://github.com/continuationlabs/toolbag) plugin that allows blacklisting of modules, methods, and bindings. If a blacklisted module is `require()`'ed, a blacklisted method is called, or a blacklisted binding is loaded via `process.binding()`, then an error handler is triggered before the action is completed.

## Supported Parameters

  - `blacklist` - An object with the following schema.
    - `modules` - An object whose keys are the names of modules to blacklist. The value associated with each key is a string or an object. If the value is a string, then it specifies the error handling policy. If the value is an object, then the module is not blacklisted. Instead, the keys and values of this object represent individual methods within the module to blacklist.
    - `bindings` - An object whose keys are the names of bindings to blacklist. The value associated with each key is a string that specifies the error handling policy.

### Example Configuration

Add `toolbag-plugin-policy` to your `package.json`. Configure the plugin in `.toolbagrc.js` as shown below.

```javascript
'use strict';

const Policy = require('toolbag-plugin-policy');

module.exports = function config (defaults, callback) {
  callback(null, {
    plugins: [
      {
        plugin: Policy,
        options: {
          blacklist: {
            modules: {
              fs: 'log',             // Log when the fs module is require()ed
              child_process: {
                fork: 'terminate'    // Terminate if child_process.fork() is called
              }
            },
            bindings: {
              natives: 'log-verbose' // Verbose log if the natives binding is used
            }
          }
        }
      }
    ]
  });
};
```
