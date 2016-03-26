'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SqlGenerator = require('@naujs/sql-generator'),
    Component = require('@naujs/component'),
    Connection = require('./Connection'),
    _ = require('lodash'),
    ResultSet = require('./ResultSet'),
    FormattedRow = require('./FormattedRow');

function returnArrayOrObject(rows) {
  if (rows.length == 1) {
    return rows[0];
  }
  return rows;
}

// Converts raw rows returned from postgresql
// to FormattedRow instances
function formatRows(rows, modelName) {
  return _.map(rows, function (row) {
    var formattedRow = new FormattedRow();
    _.each(row, function (value, key) {
      var parts = key.split('.');
      if (parts[0] == modelName) {
        formattedRow.set(parts[1], value);
      } else {
        formattedRow.setRelation(parts[0], parts[1], value);
      }
    });
    return formattedRow.format();
  });
}

// Recursively searches through the criteria to find
// the relation definition
function getRelationFromCriteria(name, criteria) {
  if (!criteria) return null;
  var parts = name.split('.');
  var include = criteria.getInclude();
  var relationName = parts.shift();
  var relation = _.find(include, {
    relation: relationName
  });

  if (!relation) return null;
  if (!parts.length) return relation;

  var targetCriteria = relation.target.criteria;
  return getRelationFromCriteria(parts.join('.'), targetCriteria);
}

// After having formattedRow, the first `data` attribute is the main model
// Everything else is treated as relations
function addRelationToResult(result, formattedRelations, criteria, parentRelation) {
  if (_.isEmpty(formattedRelations) || !result) return;
  _.each(formattedRelations, function (relation, name) {
    var relationName = parentRelation ? [parentRelation, name].join('.') : name;
    var relationDef = getRelationFromCriteria(relationName, criteria);
    if (!relationDef) return;
    var newResult;
    switch (relationDef.type) {
      case 'belongsTo':
        newResult = result.addSingleRelation(name, relation.data);
        break;
      default:
        newResult = result.addMultiRelation(name, relation.data);
        break;
    }
    addRelationToResult(newResult, relation.relations, criteria, relationName);
  });
}

var PsqlConnector = (function (_Component) {
  _inherits(PsqlConnector, _Component);

  function PsqlConnector() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PsqlConnector);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PsqlConnector).call(this));

    _this._options = options;
    _this._generator = new SqlGenerator('psql');
    _this._connection = Connection.getInstance(_this._options);
    return _this;
  }

  _createClass(PsqlConnector, [{
    key: 'getConnection',
    value: function getConnection() {
      return this._connection;
    }
  }, {
    key: 'create',
    value: function create(criteria) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var insert = this._generator.insert(criteria, options);
      return this.getConnection().sendQuery(insert).then(returnArrayOrObject);
    }
  }, {
    key: 'read',
    value: function read(criteria) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var select = this._generator.select(criteria, options);
      var modelName = criteria.getModelClass().getModelName();

      return this.getConnection().sendQuery(select).then(function (rows) {
        var formattedRows = formatRows(rows, modelName);
        var resultSet = new ResultSet();
        _.each(formattedRows, function (formattedRow) {
          var result = resultSet.add(formattedRow.data);
          addRelationToResult(result, formattedRow.relations, criteria);
        });
        return resultSet.format();
      });
    }
  }, {
    key: 'update',
    value: function update(criteria) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var update = this._generator.update(criteria, options);
      return this.getConnection().sendQuery(update).then(returnArrayOrObject);
    }
  }, {
    key: 'delete',
    value: function _delete(criteria) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var del = this._generator.delete(criteria, options);
      return this.getConnection().sendQuery(del).then(returnArrayOrObject);
    }
  }, {
    key: 'count',
    value: function count(criteria) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var count = this._generator.count(criteria, options);
      return this.getConnection().sendQuery(count).then(function (results) {
        return parseInt(results[0].count);
      });
    }
  }]);

  return PsqlConnector;
})(Component);

module.exports = PsqlConnector;