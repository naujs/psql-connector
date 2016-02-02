'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pg = require('pg'),
    Promise = require('@naujs/util').getPromise(),
    _ = require('lodash');

try {
  if (pg.native) {
    pg = pg.native;
  }
} catch (e) {}

var instance = null;

var Connection = (function () {
  _createClass(Connection, null, [{
    key: 'getInstance',
    value: function getInstance() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (!instance) {
        instance = new this(options);
      }

      return instance;
    }
  }]);

  function Connection() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Connection);

    this._options = _.defaults(options, {
      clientPooling: false
    });
  }

  _createClass(Connection, [{
    key: '_sendQueryToPoolingClient',
    value: function _sendQueryToPoolingClient(query) {
      var _this = this;

      var params = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      return new Promise(function (resolve, reject) {
        pg.connect(_this._options, function (error, client, done) {
          if (error) {
            return reject(error);
          }

          client.query(query, params, function (error, result) {
            done();

            if (error) {
              return reject(error);
            }

            resolve(result.rows);
          });
        });
      });
    }
  }, {
    key: '_sendQueryToNormalClient',
    value: function _sendQueryToNormalClient(query) {
      var _this2 = this;

      var params = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      return new Promise(function (resolve, reject) {
        var client = new pg.Client(_this2._options);
        client.connect(function (error) {
          if (error) {
            return reject(error);
          }

          client.query(query, params, function (error, result) {
            if (error) {
              return reject(error);
            }
            resolve(result.rows);
            client.end();
          });
        });
      });
    }
  }, {
    key: 'sendQuery',
    value: function sendQuery(query) {
      var params = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      if (this._options.clientPooling) {
        return this._sendQueryToPoolingClient(query, params);
      }
      return this._sendQueryToNormalClient(query, params);
    }
  }]);

  return Connection;
})();

module.exports = Connection;