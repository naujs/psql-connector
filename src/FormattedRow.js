'use strict';

var _ = require('lodash');

const SEPARATOR = '$';
class FormattedRow {
  constructor() {
    this._data = {};
    this._relations = {};
  }

  set(prop, value) {
    this._data[prop] = value;
    return this;
  }

  setRelation(name, prop, value) {
    var parts = name.split(SEPARATOR);
    if (!this._relations[parts[0]]) {
      this._relations[parts[0]] = new FormattedRow();
    }

    if (parts.length == 1) {
      this._relations[name].set(prop, value);
    } else {
      this._relations[parts[0]].setRelation(parts.slice(1).join(SEPARATOR), prop, value);
    }
    return this;
  }

  format() {
    return {
      data: this._data,
      relations: _.chain(this._relations).toPairs().map((pair) => {
        return [pair[0], pair[1].format()];
      }).fromPairs().value()
    };
  }
}

module.exports = FormattedRow;
