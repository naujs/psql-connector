'use strict';

/*eslint max-nested-callbacks:0*/
var PsqlConnector = require('../../')
  , _ = require('lodash')
  , DbCriteria = require('@naujs/db-criteria');

describe('PsqlConnector', () => {
  var instance, connection, criteria;

  function expectStoreCountToEqual(expected) {
    return connection.sendQuery('SELECT COUNT(*) FROM Store').then((rows) => {
      expect(parseInt(rows[0].count)).toEqual(expected);
    });
  }

  beforeEach(() => {
    instance = PsqlConnector.getInstance(_.extend({}, getPsqlTestDbOptions(), {force: true}));
    connection = instance.getConnection();
    criteria = new DbCriteria(Store);

    return setupPsqlDatabase(connection);
  });

  describe('#create', () => {
    it('should create a new record', () => {
      criteria.setAttributes({
        name: 'Store 4',
        user_id: 1
      });

      return instance.create(criteria).then((result) => {
        expect(_.keys(result)).toEqual(['id', 'name', 'user_id']);
        expect(result.name).toEqual('Store 4');
        expect(result.id).toEqual(4);
        expect(result.user_id).toEqual(1);
        expect(typeof result.id).toEqual('number');
        return expectStoreCountToEqual(4);
      });
    });

    it('should create multiple records', () => {
      criteria.setAttributes([
        {
          name: 'Store 4',
          user_id: 1
        },
        {
          name: 'Store 5',
          user_id: 2
        }
      ]);

      return instance.create(criteria).then((results) => {
        return expectStoreCountToEqual(5);
      });
    });
  });

  describe('#read', () => {
    it('should find data based on criteria', () => {
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            'name': 'Store 1',
            'id': 1,
            'user_id': 1
          },
          {
            'name': 'Store 2',
            'id': 2,
            'user_id': 2
          },
          {
            'name': 'Store 3',
            'id': 3,
            'user_id': 3
          }
        ]);
      });
    });

    it('should find data based on criteria', () => {
      criteria.where({
        name: {
          neq: 'Store 2'
        }
      });

      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            'name': 'Store 1',
            'id': 1,
            'user_id': 1
          },
          {
            'name': 'Store 3',
            'id': 3,
            'user_id': 3
          }
        ]);
      });
    });

    it('should limit the data', () => {
      criteria.limit(1);
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            'name': 'Store 1',
            'id': 1,
            'user_id': 1
          }
        ]);
      });
    });

    it('should apply correct order', () => {
      criteria.order('name', -1);
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            'name': 'Store 3',
            'id': 3,
            'user_id': 3
          },
          {
            'name': 'Store 2',
            'id': 2,
            'user_id': 2
          },
          {
            'name': 'Store 1',
            'id': 1,
            'user_id': 1
          }
        ]);
      });
    });

    it('should include hasMany relations', () => {
      criteria.include('products');
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            name: 'Store 1',
            id: 1,
            user_id: 1,
            products: [
              {
                name: 'Product 1',
                id: 1,
                store_id: 1
              },
              {
                name: 'Product 2',
                id: 2,
                store_id: 1
              },
              {
                name: 'Product 3',
                id: 3,
                store_id: 1
              }
            ]
          },
          {
            name: 'Store 2',
            id: 2,
            user_id: 2,
            products: []
          },
          {
            name: 'Store 3',
            id: 3,
            user_id: 3,
            products: []
          }
        ]);
      });
    });

    it('should apply order while including relations', () => {
      criteria.include('products');
      criteria.order('name', -1);
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            name: 'Store 3',
            id: 3,
            user_id: 3,
            products: []
          },
          {
            name: 'Store 2',
            id: 2,
            user_id: 2,
            products: []
          },
          {
            name: 'Store 1',
            id: 1,
            user_id: 1,
            products: [
              {
                name: 'Product 1',
                id: 1,
                store_id: 1
              },
              {
                name: 'Product 2',
                id: 2,
                store_id: 1
              },
              {
                name: 'Product 3',
                id: 3,
                store_id: 1
              }
            ]
          }
        ]);
      });
    });

    it('should include hasMany relations with where conditions', () => {
      criteria.include('products', {
        where: {
          name: 'Product 1'
        }
      });
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            name: 'Store 1',
            id: 1,
            user_id: 1,
            products: [
              {
                name: 'Product 1',
                id: 1,
                store_id: 1
              }
            ]
          },
          {
            name: 'Store 2',
            id: 2,
            user_id: 2,
            products: []
          },
          {
            name: 'Store 3',
            id: 3,
            user_id: 3,
            products: []
          }
        ]);
      });
    });

    it('should include hasMany relations with limit', () => {
      criteria.include('products', {
        limit: 1
      });
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            name: 'Store 1',
            id: 1,
            user_id: 1,
            products: [
              {
                name: 'Product 1',
                id: 1,
                store_id: 1
              }
            ]
          },
          {
            name: 'Store 2',
            id: 2,
            user_id: 2,
            products: []
          },
          {
            name: 'Store 3',
            id: 3,
            user_id: 3,
            products: []
          }
        ]);
      });
    });

    it('should include hasMany relations with limit and order', () => {
      criteria.include('products', {
        limit: 1,
        order: {
          name: -1
        }
      });
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            name: 'Store 1',
            id: 1,
            user_id: 1,
            products: [
              {
                name: 'Product 3',
                id: 3,
                store_id: 1
              }
            ]
          },
          {
            name: 'Store 2',
            id: 2,
            user_id: 2,
            products: []
          },
          {
            name: 'Store 3',
            id: 3,
            user_id: 3,
            products: []
          }
        ]);
      });
    });

    it('should include multiple different type of relations', () => {
      criteria.include('products');
      criteria.include('owner');
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            name: 'Store 1',
            id: 1,
            user_id: 1,
            products: [
              {
                name: 'Product 1',
                id: 1,
                store_id: 1
              },
              {
                name: 'Product 2',
                id: 2,
                store_id: 1
              },
              {
                name: 'Product 3',
                id: 3,
                store_id: 1
              }
            ],
            owner: {
              name: 'User 1',
              id: 1
            }
          },
          {
            name: 'Store 2',
            id: 2,
            user_id: 2,
            products: [],
            owner: {
              name: 'User 2',
              id: 2
            }
          },
          {
            name: 'Store 3',
            id: 3,
            user_id: 3,
            products: [],
            owner: {
              name: 'User 3',
              id: 3
            }
          }
        ]);
      });
    });

    it('should include many-to-many relations', () => {
      criteria.include('products', {
        include: 'tags'
      });
      return instance.read(criteria).then((results) => {
        expect(results).toEqual([
          {
            name: 'Store 1',
            id: 1,
            user_id: 1,
            products: [
              {
                name: 'Product 1',
                id: 1,
                store_id: 1,
                tags: [
                  {
                    name: 'Tag1',
                    id: 1
                  },
                  {
                    name: 'Tag2',
                    id: 2
                  }
                ]
              },
              {
                name: 'Product 2',
                id: 2,
                store_id: 1,
                tags: [
                  {
                    name: 'Tag1',
                    id: 1
                  }
                ]
              },
              {
                name: 'Product 3',
                id: 3,
                store_id: 1,
                tags: []
              }
            ]
          },
          {
            name: 'Store 3',
            id: 3,
            user_id: 3,
            products: []
          },
          {
            name: 'Store 2',
            id: 2,
            user_id: 2,
            products: []
          }
        ]);
      });
    });
  });

  describe('#update', () => {
    it('should update record', () => {
      criteria.where({
        id: 1
      });
      criteria.setAttributes({
        name: 'Store 1a'
      });
      return instance.update(criteria).then((result) => {
        expect(result).toEqual({
          id: 1,
          name: 'Store 1a',
          user_id: 1
        });

        return connection.sendQuery('SELECT * FROM Store WHERE id=1').then((rows) => {
          expect(rows[0]).toEqual({
            id: 1,
            name: 'Store 1a',
            user_id: 1
          });
        });
      });
    });
  });

  describe('#delete', () => {
    it('should delete one record', () => {
      criteria.where({
        name: 'Store 1'
      });

      return instance.delete(criteria).then((result) => {
        expect(result).toEqual({
          id: 1,
          name: 'Store 1',
          user_id: 1
        });

        return expectStoreCountToEqual(2);
      });
    });

    it('should delete all records', () => {
      return instance.delete(criteria).then((results) => {
        expect(results).toEqual([
          {
            id: 1,
            name: 'Store 1',
            user_id: 1
          },
          {
            id: 2,
            name: 'Store 2',
            user_id: 2
          },
          {
            id: 3,
            name: 'Store 3',
            user_id: 3
          }
        ]);

        return expectStoreCountToEqual(0);
      });
    });

  });

  describe('#count', () => {
    it('should count all records', () => {
      return instance.count(criteria).then((count) => {
        expect(count).toEqual(3);
      });
    });

    it('should count records using criteria', () => {
      criteria.where({
        name: 'Store 2'
      });

      return instance.count(criteria).then((count) => {
        expect(count).toEqual(1);
      });
    });

  });

  afterEach(() => {
    connection = instance.getConnection();
    return teardownPsqlDatabase(connection);
  });
});
