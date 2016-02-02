'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SqlGenerator = require('@naujs/sql-generator'),
    Connection = require('./connection'),
    _ = require('lodash');

var instance;

function returnResult(results) {
  if (!results) {
    return null;
  }

  if (results.length === 1) {
    return results[0];
  }

  return results;
}

var PsqlConnector = (function () {
  _createClass(PsqlConnector, null, [{
    key: 'getInstance',
    value: function getInstance() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (!instance || options.force) {
        instance = new this(options);
      }

      return instance;
    }
  }]);

  function PsqlConnector() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PsqlConnector);

    this._options = options;
    this._generator = new SqlGenerator('psql');
    this._connection = Connection.getInstance(this._options);
  }

  _createClass(PsqlConnector, [{
    key: 'getConnection',
    value: function getConnection() {
      return this._connection;
    }
  }, {
    key: 'find',
    value: function find(tableName) {
      var criteria = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      criteria.limit = 1;
      var select = this._generator.select(tableName, criteria);
      return this.getConnection().sendQuery(select).then(function (rows) {
        return rows[0] || null;
      });
    }
  }, {
    key: 'findAll',
    value: function findAll(tableName) {
      var criteria = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var select = this._generator.select(tableName, criteria);
      return this.getConnection().sendQuery(select);
    }
  }, {
    key: 'create',
    value: function create(tableName, attributes) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var insert = this._generator.insert(tableName, attributes, options);
      return this.getConnection().sendQuery(insert).then(returnResult);
    }
  }, {
    key: 'update',
    value: function update(tableName, criteria, attributes) {
      var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var update = this._generator.update(tableName, criteria, attributes, options);
      return this.getConnection().sendQuery(update).then(returnResult);
    }
  }, {
    key: 'delete',
    value: function _delete(tableName, criteria) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var del = this._generator.delete(tableName, criteria, options);
      return this.getConnection().sendQuery(del).then(returnResult);
    }
  }, {
    key: 'count',
    value: function count(tableName, criteria) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var count = this._generator.count(tableName, criteria, options);
      return this.getConnection().sendQuery(count).then(function (results) {
        return parseInt(results[0].count);
      });
    }
  }]);

  return PsqlConnector;
})();

module.exports = PsqlConnector;