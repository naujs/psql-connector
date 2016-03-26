'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');

function filterData(data) {
  delete data['_rn_'];
  return data;
}

var Result = (function () {
  function Result(data) {
    _classCallCheck(this, Result);

    this._data = data;
    this._relations = {};
  }

  _createClass(Result, [{
    key: 'addMultiRelation',
    value: function addMultiRelation(name, data) {
      data = filterData(data);
      this._relations[name] = this._relations[name] || [];
      if (this.isNull(data)) return null;
      var relation = this._relations[name];
      var result = _.find(relation, function (r) {
        return r.isEqual(data);
      });

      if (!result) {
        result = new Result(data);
        relation.push(result);
      }

      return result;
    }
  }, {
    key: 'addSingleRelation',
    value: function addSingleRelation(name, data) {
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
  }, {
    key: 'isEqual',
    value: function isEqual(data) {
      for (var i in data) {
        if (this._data[i] != data[i]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: 'isNull',
    value: function isNull(data) {
      return _.chain(data).values().filter(function (value) {
        return value !== null;
      }).size().value() == 0;
    }
  }, {
    key: 'format',
    value: function format() {
      var data = _.clone(this._data);
      _.each(this._relations, function (relation, name) {
        if (_.isArray(relation)) {
          data[name] = _.map(relation, function (r) {
            return r.format();
          });
        } else {
          data[name] = relation instanceof Result ? relation.format() : null;
        }
      });
      return data;
    }
  }]);

  return Result;
})();

var ResultSet = (function () {
  function ResultSet() {
    _classCallCheck(this, ResultSet);

    this._set = [];
  }

  _createClass(ResultSet, [{
    key: 'add',
    value: function add(data) {
      var result = _.find(this._set, function (r) {
        return r.isEqual(data);
      });

      if (!result) {
        result = new Result(data);
        this._set.push(result);
      }

      return result;
    }
  }, {
    key: 'format',
    value: function format() {
      return _.map(this._set, function (result) {
        return result.format();
      });
    }
  }]);

  return ResultSet;
})();

module.exports = ResultSet;