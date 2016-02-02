/*eslint max-nested-callbacks:0*/

var PsqlConnector = require('../')
  , util = require('@naujs/util')
  , _ = require('lodash');

var testOptions = {
  host: util.getEnv('PSQL_CONNECTOR_TEST_HOST') || 'localhost',
  port: util.getEnv('PSQL_CONNECTOR_TEST_PORT') || 5432,
  user: util.getEnv('PSQL_CONNECTOR_TEST_USER') || 'tannguyen',
  password: util.getEnv('PSQL_CONNECTOR_TEST_PASSWORD') || '',
  db: util.getEnv('PSQL_CONNECTOR_TEST_DB') || 'tannguyen'
};

const TEST_TABLE = 'psql_connector';
const EXPECTED_COLUMNS = ['id', 'name', 'address', 'code'];

var testData = [
  {
    name: 'Name 0',
    address: 'Address 0',
    code: 123
  },
  {
    name: 'Name 1',
    address: 'Address 1',
    code: 123
  },
  {
    name: 'Name 2',
    address: 'Address 2',
    code: 234
  }
];

describe('PsqlConnector', () => {
  var instance;
  beforeEach(() => {
    instance = PsqlConnector.getInstance({force: true});
    connection = instance.getConnection();

    var query = `
      CREATE TABLE IF NOT EXISTS ${TEST_TABLE} (
        id  serial PRIMARY KEY,
        name VARCHAR(40),
        address TEXT,
        code INT
      );
    `;

    return connection.sendQuery(query);
  });

  describe('#create', () => {
    it('should create a new record', () => {
      return instance.create(TEST_TABLE, testData[0]).then((result) => {
        expect(_.keys(result)).toEqual(EXPECTED_COLUMNS);
        expect(result.name).toEqual('Name 0');
        expect(result.address).toEqual('Address 0');
        expect(typeof result.id).toEqual('number');
      });
    });

    it('should create multiple records', () => {
      return instance.create(TEST_TABLE, testData).then((results) => {
        expect(results.length).toEqual(testData.length);
        _.each(_.range(1), (index) => {
          var result = results[index];
          var expectedResult = testData[index];
          expect(_.keys(result)).toEqual(EXPECTED_COLUMNS);
          expect(result.name).toEqual(expectedResult.name);
          expect(result.address).toEqual(expectedResult.address);
          expect(typeof result.id).toEqual('number');
        });
      });
    });
  });

  describe('#find', () => {
    beforeEach(() => {
      return instance.create(TEST_TABLE, testData);
    });

    it('should find record', () => {
      return instance.find(TEST_TABLE, {
        where: {
          id: 1
        }
      }).then((result) => {
        expectedResult = testData[0];
        expect(result).toBeTruthy();
        expect(result.name).toEqual(expectedResult.name);
        expect(result.address).toEqual(expectedResult.address);
      });
    });

    it('should limit the result to one', () => {
      return instance.find(TEST_TABLE).then((result) => {
        expectedResult = testData[0];
        expect(result).toBeTruthy();
        expect(result.name).toEqual(expectedResult.name);
        expect(result.address).toEqual(expectedResult.address);
      });
    });
  });

  describe('#findAll', () => {
    beforeEach(() => {
      return instance.create(TEST_TABLE, testData);
    });

    it('should find all records', () => {
      return instance.findAll(TEST_TABLE).then((results) => {
        expect(results.length).toEqual(testData.length);
        _.each(testData, (data, index) => {
          expect(results[index].name).toEqual(data.name);
        });
      });
    });

    it('should find all records based on criteria', (done) => {
      return instance.findAll(TEST_TABLE, {
        where: {
          code: 123
        }
      }).then((results) => {
        expect(results.length).toEqual(_.filter(testData, (data) => {
          return data.code === 123;
        }).length);
      });
    });
  });

  describe('#update', () => {
    beforeEach(() => {
      return instance.create(TEST_TABLE, testData);
    });

    it('should update record', () => {
      return instance.update(TEST_TABLE, {
        where: {
          id: 1
        }
      }, {
        name: 'Tan Nguyen'
      }).then((result) => {
        expect(result).toBeTruthy();
        expect(result.name).toEqual('Tan Nguyen');

        return instance.find(TEST_TABLE, {
          where: {
            id: 1
          }
        }).then(function(result) {
          expect(result.name).toEqual('Tan Nguyen');
        });
      });
    });
  });

  describe('#delete', () => {
    beforeEach(() => {
      return instance.create(TEST_TABLE, testData);
    });

    it('should delete one record', () => {
      return instance.delete(TEST_TABLE, {
        where: {
          id: 1
        }
      }).then((result) => {
        expect(result).toBeTruthy();
        expect(result.id).toEqual(1);
        expect(result.name).toEqual('Name 0');

        return instance.findAll(TEST_TABLE).then(function(results) {
          expect(results.length).toEqual(2);
        });
      });
    });

    it('should delete all records', () => {
      return instance.delete(TEST_TABLE).then((results) => {
        expect(results.length).toEqual(testData.length);

        return instance.findAll(TEST_TABLE).then(function(results) {
          expect(results.length).toEqual(0);
        });
      });
    });

  });

  describe('#count', () => {
    beforeEach(() => {
      return instance.create(TEST_TABLE, testData);
    });

    it('should count all records', () => {
      return instance.count(TEST_TABLE).then((count) => {
        expect(count).toEqual(3);
      });
    });

    it('should count records using criteria', () => {
      return instance.count(TEST_TABLE, {
        where: {
          code: 123
        }
      }).then((count) => {
        expect(count).toEqual(2);
      });
    });

  });

  afterEach(() => {
    connection = instance.getConnection();
    var query = `
      DROP TABLE ${TEST_TABLE};
    `;

    return connection.sendQuery(query);
  });
});
