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

global.setupDatabase = function(connection) {
  return connection.sendQuery(createTables).then(function() {
    return connection.sendQuery(seedData);
  });
};

global.teardownDatabase = function(connection) {
  return connection.sendQuery(dropTables);
};
