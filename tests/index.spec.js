'use strict';

/*eslint max-nested-callbacks:0*/
var PsqlConnector = require('../')
  , util = require('@naujs/util')
  , _ = require('lodash')
  , Registry = require('@naujs/registry')
  , ActiveRecord = require('@naujs/active-record')
  , DbCriteria = require('@naujs/db-criteria');

class Store extends ActiveRecord {}
Store.properties = {
  name: {
    type: ActiveRecord.Types.string
  }
};
Store.relations = {
  products: {
    type: 'hasMany',
    model: 'Product',
    foreignKey: 'store_id'
  },
  banners: {
    type: 'hasMany',
    model: 'Banner',
    foreignKey: 'store_id'
  },
  owner: {
    type: 'belongsTo',
    model: 'Users',
    foreignKey: 'user_id'
  }
};

class Product extends ActiveRecord {}
Product.properties = {
  name: {
    type: ActiveRecord.Types.string
  }
};

Product.relations = {
  'comments': {
    type: 'hasMany',
    model: 'Comment',
    foreignKey: 'product_id'
  },
  'store': {
    type: 'belongsTo',
    model: 'Store',
    foreignKey: 'store_id'
  },
  'tags': {
    type: 'hasManyAndBelongsTo',
    model: 'Tag',
    through: 'ProductTag',
    foreignKey: 'product_id'
  }
};

class Comment extends ActiveRecord {}
Comment.properties = {
  content: {
    type: ActiveRecord.Types.string
  }
};
Comment.relations = {
  'author': {
    type: 'belongsTo',
    model: 'Users',
    foreignKey: 'user_id'
  },
  'product': {
    type: 'belongsTo',
    model: 'Product',
    foreignKey: 'product_id'
  },
  'votes': {
    type: 'hasMany',
    model: 'Vote',
    foreignKey: 'comment_id'
  }
};

class Tag extends ActiveRecord {}
Tag.properties = {
  name: {
    type: ActiveRecord.Types.string
  }
};
Tag.relations = {
  'products': {
    type: 'hasManyAndBelongsTo',
    model: 'Product',
    through: 'ProductTag',
    foreignKey: 'tag_id'
  }
};

class ProductTag extends ActiveRecord {}
ProductTag.relations = {
  'product': {
    type: 'belongsTo',
    model: 'Product',
    foreignKey: 'product_id'
  },
  'tag': {
    type: 'belongsTo',
    model: 'Tag',
    foreignKey: 'tag_id'
  }
};

class User extends ActiveRecord {}
User.properties = {
  name: {
    type: ActiveRecord.Types.string
  }
};
User.relations = {
  'comments': {
    type: 'hasMany',
    model: 'Comment',
    foreignKey: 'user_id'
  },
  'votes': {
    type: 'hasMany',
    model: 'Vote',
    foreignKey: 'user_id'
  },
  'stores': {
    type: 'hasMany',
    model: 'Store',
    foreignKey: 'user_id'
  }
};
User.modelName = 'Users';

class Vote extends ActiveRecord {}
Vote.properties = {
  rating: {
    type: ActiveRecord.Types.number
  }
};

Vote.relations = {
  comment: {
    type: 'belongsTo',
    model: 'Comment',
    foreignKey: 'comment_id'
  },
  author: {
    type: 'belongsTo',
    model: 'User',
    foreignKey: 'user_id'
  }
};

class Banner extends ActiveRecord {}
Banner.properties = {
  image: {
    type: ActiveRecord.Types.string
  }
};

Banner.relations = {
  'store': {
    type: 'belongsTo',
    model: 'Store',
    foreignKey: 'store_id'
  }
};

Registry.setModel(Store);
Registry.setModel(Product);
Registry.setModel(Comment);
Registry.setModel(Tag);
Registry.setModel(User);
Registry.setModel(Vote);
Registry.setModel(ProductTag);
Registry.setModel(Banner);

var testOptions = {
  host: util.getEnv('PSQL_CONNECTOR_TEST_HOST') || 'localhost',
  port: util.getEnv('PSQL_CONNECTOR_TEST_PORT') || 5432,
  user: util.getEnv('PSQL_CONNECTOR_TEST_USER') || 'tannguyen',
  password: util.getEnv('PSQL_CONNECTOR_TEST_PASSWORD') || '',
  db: util.getEnv('PSQL_CONNECTOR_TEST_DB') || 'tannguyen'
};

const TEST_TABLE = 'psql_connector';
const EXPECTED_COLUMNS = ['id', 'name', 'address', 'code'];

var createTables = `
  CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128)
  );

  CREATE TABLE Store (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128),
    user_id INT REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE Product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128),
    store_id INTEGER REFERENCES Store(id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE Comment (
    id SERIAL PRIMARY KEY,
    content TEXT,
    product_id INTEGER REFERENCES Product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE Tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128)
  );

  CREATE TABLE Vote (
    id SERIAL PRIMARY KEY,
    rating INT,
    comment_id INT REFERENCES Comment(id) ON DELETE CASCADE ON UPDATE CASCADE,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE ProductTag (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES Product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    tag_id INT REFERENCES Tag(id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE Banner (
    id SERIAL PRIMARY KEY,
    image TEXT,
    store_id INT REFERENCES Store(id) ON DELETE CASCADE ON UPDATE CASCADE
  );
`;

var dropTables = `
  DROP TABLE Banner;
  DROP TABLE Vote;
  DROP TABLE ProductTag;
  DROP TABLE Tag;
  DROP TABLE Comment;
  DROP TABLE Product;
  DROP TABLE Store;
  DROP TABLE Users;
`;

var seedData = `
  INSERT INTO Users (name) VALUES ('User 1'), ('User 2'), ('User 3');

  INSERT INTO Store (name, user_id) VALUES ('Store 1', (SELECT id FROM Users WHERE name='User 1'));
  INSERT INTO Store (name, user_id) VALUES ('Store 2', (SELECT id FROM Users WHERE name='User 2'));
  INSERT INTO Store (name, user_id) VALUES ('Store 3', (SELECT id FROM Users WHERE name='User 3'));

  INSERT INTO Product (name, store_id) VALUES ('Product 1', (SELECT id FROM Store WHERE name='Store 1'));
  INSERT INTO Product (name, store_id) VALUES ('Product 2', (SELECT id FROM Store WHERE name='Store 1'));
  INSERT INTO Product (name, store_id) VALUES ('Product 3', (SELECT id FROM Store WHERE name='Store 1'));

  INSERT INTO Banner (image, store_id) VALUES ('Banner 1', (SELECT id FROM Store WHERE name='Store 1'));
  INSERT INTO Banner (image, store_id) VALUES ('Banner 2', (SELECT id FROM Store WHERE name='Store 1'));
  INSERT INTO Banner (image, store_id) VALUES ('Banner 3', (SELECT id FROM Store WHERE name='Store 1'));
  INSERT INTO Banner (image, store_id) VALUES ('Banner 4', (SELECT id FROM Store WHERE name='Store 1'));

  INSERT INTO Comment (content, product_id, user_id) VALUES ('Comment 1', (SELECT id FROM Product WHERE name='Product 1'), (SELECT id FROM Users WHERE name='User 1'));
  INSERT INTO Comment (content, product_id, user_id) VALUES ('Comment 2', (SELECT id FROM Product WHERE name='Product 1'), (SELECT id FROM Users WHERE name='User 2'));
  INSERT INTO Comment (content, product_id, user_id) VALUES ('Comment 3', (SELECT id FROM Product WHERE name='Product 1'), (SELECT id FROM Users WHERE name='User 1'));

  INSERT INTO Tag (name) VALUES ('Tag1'), ('Tag2'), ('Tag3'), ('Tag4');
  INSERT INTO ProductTag (product_id, tag_id) VALUES ((SELECT id FROM Product WHERE name='Product 1'), (SELECT id FROM Tag WHERE name='Tag1'));
  INSERT INTO ProductTag (product_id, tag_id) VALUES ((SELECT id FROM Product WHERE name='Product 1'), (SELECT id FROM Tag WHERE name='Tag2'));
  INSERT INTO ProductTag (product_id, tag_id) VALUES ((SELECT id FROM Product WHERE name='Product 2'), (SELECT id FROM Tag WHERE name='Tag1'));
`;

describe('PsqlConnector', () => {
  var instance, connection;

  function expectStoreCountToEqual(expected) {
    return connection.sendQuery('SELECT COUNT(*) FROM Store').then((rows) => {
      expect(parseInt(rows[0].count)).toEqual(expected);
    });
  }

  beforeEach(() => {
    instance = PsqlConnector.getInstance({force: true});
    connection = instance.getConnection();

    return connection.sendQuery(createTables).then(function() {
      return connection.sendQuery(seedData);
    });
  });

  var criteria;
  beforeEach(() => {
    criteria = new DbCriteria(Store);
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
    return connection.sendQuery(dropTables);
  });
});
