'use strict';

var SqlGenerator = require('@naujs/sql-generator')
  , Component = require('@naujs/component')
  , Connection = require('./Connection')
  , _ = require('lodash')
  , ResultSet = require('./ResultSet')
  , FormattedRow = require('./FormattedRow');

function returnArrayOrObject(rows) {
  if (rows.length == 1) {
    return rows[0];
  }
  return rows;
}

// Converts raw rows returned from postgresql
// to FormattedRow instances
function formatRows(rows, modelName) {
  return _.map(rows, (row) => {
    var formattedRow = new FormattedRow();
    _.each(row, (value, key) => {
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
  _.each(formattedRelations, (relation, name) => {
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

class PsqlConnector extends Component {
  constructor(options = {}) {
    super();
    this._options = options;
    this._generator = new SqlGenerator('psql');
    this._connection = Connection.getInstance(this._options);
  }

  getConnection() {
    return this._connection;
  }

  create(criteria, options = {}) {
    var insert = this._generator.insert(criteria, options);
    return this.getConnection().sendQuery(insert).then(returnArrayOrObject);
  }

  read(criteria, options = {}) {
    var select = this._generator.select(criteria, options);
    var modelName = criteria.getModelClass().getModelName();

    return this.getConnection().sendQuery(select).then((rows) => {
      var formattedRows = formatRows(rows, modelName);
      var resultSet = new ResultSet();
      _.each(formattedRows, (formattedRow) => {
        var result = resultSet.add(formattedRow.data);
        addRelationToResult(result, formattedRow.relations, criteria);
      });
      return resultSet.format();
    });
  }

  update(criteria, options = {}) {
    var update = this._generator.update(criteria, options);
    return this.getConnection().sendQuery(update).then(returnArrayOrObject);
  }

  delete(criteria, options = {}) {
    var del = this._generator.delete(criteria, options);
    return this.getConnection().sendQuery(del).then(returnArrayOrObject);
  }

  count(criteria, options = {}) {
    var count = this._generator.count(criteria, options);
    return this.getConnection().sendQuery(count).then(function(results) {
      return parseInt(results[0].count);
    });
  }
}

module.exports = PsqlConnector;
