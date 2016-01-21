'use strict';

var SqlGenerator = require('@naujs/sql-generator')
  , Connection = require('./connection')
  , _ = require('lodash');

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

class PsqlConnector {
  static getInstance(options = {}) {
    if (!instance || options.force) {
      instance = new this(options);
    }

    return instance;
  }

  constructor(options = {}) {
    this._options = options;
    this._generator = new SqlGenerator('psql');
    this._connection = Connection.getInstance(this._options);
  }

  getConnection() {
    return this._connection;
  }

  find(tableName, criteria = {}, options = {}) {
    criteria.limit = 1;
    var select = this._generator.select(tableName, criteria);
    return this.getConnection().sendQuery(select).then((rows) => {
      return rows[0] || null;
    });
  }

  findAll(tableName, criteria = {}, options = {}) {
    var select = this._generator.select(tableName, criteria);
    return this.getConnection().sendQuery(select);
  }

  create(tableName, attributes, options = {}) {
    var insert = this._generator.insert(tableName, attributes, options);
    return this.getConnection().sendQuery(insert).then(returnResult);
  }

  update(tableName, criteria, attributes, options = {}) {
    var update = this._generator.update(tableName, criteria, attributes, options);
    return this.getConnection().sendQuery(update).then(returnResult);
  }

  delete(tableName, criteria, options = {}) {
    var del = this._generator.delete(tableName, criteria, options);
    return this.getConnection().sendQuery(del).then(returnResult);
  }

  count(tableName, criteria, options = {}) {
    var count = this._generator.count(tableName, criteria, options);
    return this.getConnection().sendQuery(count).then(function(results) {
      return parseInt(results[0].count);
    });
  }
}

module.exports = PsqlConnector;
