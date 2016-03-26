'use strict';

var _ = require('lodash');

function filterData(data) {
  delete data['_rn_'];
  return data;
}

class Result {
  constructor(data) {
    this._data = data;
    this._relations = {};
  }

  addMultiRelation(name, data) {
    data = filterData(data);
    this._relations[name] = this._relations[name] || [];
    if (this.isNull(data)) return null;
    var relation = this._relations[name];
    var result = _.find(relation, (r) => {
      return r.isEqual(data);
    });

    if (!result) {
      result = new Result(data);
      relation.push(result);
    }

    return result;
  }

  addSingleRelation(name, data) {
    data = filterData(data);
    if (this.isNull(data)) {
      this._relations[name] = this._relations[name] || {};
      return null;
    }
    var result = this._relations[name];
    if (!result) {
      result = new Result(data);
      this._relations[name] = result;
    }

    return result;
  }

  isEqual(data) {
    for (let i in data) {
      if (this._data[i] != data[i]) {
        return false;
      }
    }

    return true;
  }

  isNull(data) {
    return _.chain(data).values().filter((value) => {
      return value !== null;
    }).size().value() == 0;
  }

  format() {
    var data = _.clone(this._data);
    _.each(this._relations, (relation, name) => {
      if (_.isArray(relation)) {
        data[name] = _.map(relation, (r) => {
          return r.format();
        });
      } else {
        data[name] = relation instanceof Result ? relation.format() : null;
      }
    });
    return data;
  }
}

class ResultSet {
  constructor() {
    this._set = [];
  }

  add(data) {
    var result = _.find(this._set, (r) => {
      return r.isEqual(data);
    });

    if (!result) {
      result = new Result(data);
      this._set.push(result);
    }

    return result;
  }

  format() {
    return _.map(this._set, (result) => {
      return result.format();
    });
  }
}

module.exports = ResultSet;
