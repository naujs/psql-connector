var ResultSet = require('../../build/ResultSet');

function createProduct(index) {
  return {
    name: `Product ${index}`,
    id: index
  };
}

function createOwner(index) {
  return {
    name: `Owner ${index}`,
    id: index
  };
}

describe('ResultSet', () => {
  describe('#add', () => {
    it('should add new result', () => {
      var resultSet = new ResultSet();
      resultSet.add({
        name: 'Tan'
      });

      expect(resultSet._set.length).toEqual(1);
      expect(resultSet._set[0]._data).toEqual({
        name: 'Tan'
      });
    });

    it('should return the current matching result if found', () => {
      var resultSet = new ResultSet();
      var result1 = resultSet.add({
        name: 'Tan'
      });

      var result2 = resultSet.add({
        name: 'Tan'
      });

      expect(result1).toEqual(result2);
      expect(resultSet._set.length).toEqual(1);
      expect(resultSet._set[0]._data).toEqual({
        name: 'Tan'
      });
    });
  });

  describe('Result', () => {
    var resultSet, result;

    beforeEach(() => {
      resultSet = new ResultSet();
      result = resultSet.add({
        id: 1,
        name: 'Store 1'
      });
    });

    describe('#addSingleRelation', () => {
      it('should add a single relation', () => {
        var newResult1 = result.addSingleRelation('owner', createOwner(1));
        expect(result._relations['owner']._data).toEqual(createOwner(1));
      });

      it('should put an empty object when having null-all data', () => {
        var newResult1 = result.addSingleRelation('owner', {
          name: null,
          id: null
        });
        expect(result._relations['owner']).toEqual({});
      });
    });

    describe('#addMultiRelation', () => {
      it('should add relation to an array', () => {
        var newResult1 = result.addMultiRelation('products', createProduct(1));

        expect(result._relations['products'].length).toEqual(1);
        expect(result._relations['products'][0]._data).toEqual(createProduct(1));

        var newResult2 = result.addMultiRelation('products', createProduct(2));
        expect(newResult1).not.toEqual(newResult2);
        expect(result._relations['products'].length).toEqual(2);
        expect(result._relations['products'][0]._data).toEqual(createProduct(1));
        expect(result._relations['products'][1]._data).toEqual(createProduct(2));
      });

      it('should not add existing relation to the array', () => {
        var newResult1 = result.addMultiRelation('products', createProduct(1));
        var newResult2 = result.addMultiRelation('products', createProduct(1));

        expect(newResult1).toEqual(newResult2);
        expect(result._relations['products'].length).toEqual(1);
        expect(result._relations['products'][0]._data).toEqual(createProduct(1));
      });

      it('should skip null-all data', () => {
        var newResult1 = result.addMultiRelation('products', createProduct(1));
        var newResult2 = result.addMultiRelation('products', {
          name: null,
          id: null
        });

        expect(newResult2).toBe(null);
        expect(result._relations['products'].length).toEqual(1);
        expect(result._relations['products'][0]._data).toEqual(createProduct(1));
      });

      it('should put an empty array when adding null-all data', () => {
        result.addMultiRelation('products', {
          name: null,
          id: null
        });

        expect(result._relations['products']).toEqual([]);
      });
    });

    describe('#format', () => {
      it('should convert everything to JSON', () => {
        var newResult = result.addMultiRelation('products', createProduct(1));
        newResult.addMultiRelation('comments', {
          content: 'Comment 1',
          id: 1
        });

        expect(newResult.format()).toEqual({
          name: 'Product 1',
          id: 1,
          comments: [
            {
              content: 'Comment 1',
              id: 1
            }
          ]
        });
      });

      it('should convert {} to null for single relation', () => {
        result.addSingleRelation('owner', {
          name: null,
          id: null
        });

        expect(result.format()).toEqual({
          id: 1,
          name: 'Store 1',
          owner: null
        });
      });
    });
  });

  describe('#format', () => {
    it('should convert everything to JSON', () => {
      var resultSet = new ResultSet();
      var result = resultSet.add({
        name: 'Store 1',
        id: 1
      });

      result.addMultiRelation('products', {
        name: 'Product 1',
        id: 1
      }).addMultiRelation('comments', {
        content: 'Comment 1',
        id: 1
      }).addSingleRelation('author', {
        name: 'User 1',
        id: 1
      });

      result.addMultiRelation('products', {
        name: 'Product 1',
        id: 1
      }).addMultiRelation('comments', {
        content: 'Comment 2',
        id: 2
      }).addSingleRelation('author', {
        name: 'User 2',
        id: 2
      });

      result.addMultiRelation('products', {
        name: 'Product 2',
        id: 2
      });

      resultSet.add({
        name: 'Store 2',
        id: 2
      });

      expect(resultSet.format()).toEqual(
        [
          {
            'name': 'Store 1',
            'id': 1,
            'products': [
              {
                'name': 'Product 1',
                'id': 1,
                'comments': [
                  {
                    'content': 'Comment 1',
                    'id': 1,
                    'author': {
                      'name': 'User 1',
                      'id': 1
                    }
                  },
                  {
                    'content': 'Comment 2',
                    'id': 2,
                    'author': {
                      'name': 'User 2',
                      'id': 2
                    }
                  }
                ]
              },
              {
                'name': 'Product 2',
                'id': 2
              }
            ]
          },
          {
            'name': 'Store 2',
            'id': 2
          }
        ]
      );
    });
  });
});
