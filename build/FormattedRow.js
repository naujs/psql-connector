'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');

var SEPARATOR = '$';

var FormattedRow = (function () {
  function FormattedRow() {
    _classCallCheck(this, FormattedRow);

    this._data = {};
    this._relations = {};
  }

  _createClass(FormattedRow, [{
    key: 'set',
    value: function set(prop, value) {
      this._data[prop] = value;
      return this;
    }
  }, {
    key: 'setRelation',
    value: function setRelation(name, prop, value) {
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
  }, {
    key: 'format',
    value: function format() {
      return {
        data: this._data,
        relations: _.chain(this._relations).toPairs().map(function (pair) {
          return [pair[0], pair[1].format()];
        }).fromPairs().value()
      };
    }
  }]);

  return FormattedRow;
})();

module.exports = FormattedRow;