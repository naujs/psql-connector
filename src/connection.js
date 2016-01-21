'use strict';

var pg = require('pg')
  , Promise = require('@naujs/util').getPromise()
  , _ = require('lodash');

try {
  if (pg.native) {
    pg = pg.native;
  }
} catch (e) {}

var instance = null;

class Connection {
  static getInstance(options = {}) {
    if (!instance) {
      instance = new this(options);
    }

    return instance;
  }

  constructor(options = {}) {
    this._options = _.defaults(options, {
      clientPooling: false
    });
  }

  _sendQueryToPoolingClient(query, params = []) {
    return new Promise((resolve, reject) => {
      pg.connect(this._options, (error, client, done) => {
        if (error) {
          return reject(error);
        }

        client.query(query, params, (error, result) => {
          done();

          if (error) {
            return reject(error);
          }

          resolve(result.rows);
        });
      });
    });
  }

  _sendQueryToNormalClient(query, params = []) {
    return new Promise((resolve, reject) => {
      var client = new pg.Client(this._options);
      client.connect(function(error) {
        if (error) {
          return reject(error);
        }

        client.query(query, params, function(error, result) {
          if (error) {
            return reject(error);
          }
          resolve(result.rows);
          client.end();
        });
      });
    });
  }

  sendQuery(query, params = []) {
    if (this._options.clientPooling) {
      return this._sendQueryToPoolingClient(query, params);
    }
    return this._sendQueryToNormalClient(query, params);
  }
}

module.exports = Connection;
