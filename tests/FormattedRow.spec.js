var FormattedRow = require('../build/FormattedRow');

describe('FormattedRow', () => {
  var formattedRow;

  beforeEach(() => {
    formattedRow = new FormattedRow();
  });

  describe('#set', () => {
    it('should set prop', () => {
      formattedRow.set('name', 'Store 1').set('id', 1);
      expect(formattedRow._data).toEqual({
        name: 'Store 1',
        id: 1
      });
    });
  });

  describe('#setRelation', () => {
    it('should set relation', () => {
      formattedRow.setRelation('products', 'name', 'Product 1');
      formattedRow.setRelation('products', 'id', 1);
      expect(formattedRow._relations['products']._data).toEqual({
        name: 'Product 1',
        id: 1
      });
    });

    it('should set nested relation', () => {
      formattedRow.setRelation('products$comments', 'content', 'Comment 1');
      formattedRow.setRelation('products$comments', 'id', 1);
      expect(formattedRow._relations['products']._data).toEqual({});
      expect(formattedRow._relations['products']._relations['comments']._data).toEqual({
        content: 'Comment 1',
        id: 1
      });
    });
  });

  describe('#format', () => {
    it('should return correct data structure', () => {
      formattedRow.set('name', 'Store 1');
      formattedRow.set('id', 1);
      formattedRow.setRelation('products', 'name', 'Product 1');
      formattedRow.setRelation('products', 'id', 1);
      formattedRow.setRelation('products$comments', 'content', 'Comment 1');
      formattedRow.setRelation('products$comments', 'id', 1);
      formattedRow.setRelation('products$comments$author', 'user', 'User 1');
      formattedRow.setRelation('products$comments$author', 'id', 1);
      expect(formattedRow.format()).toEqual({
        'data': {
          'name': 'Store 1',
          'id': 1
        },
        'relations': {
          'products': {
            'data': {
              'name': 'Product 1',
              'id': 1
            },
            'relations': {
              'comments': {
                'data': {
                  'content': 'Comment 1',
                  'id': 1
                },
                'relations': {
                  'author': {
                    'data': {
                      'user': 'User 1',
                      'id': 1
                    },
                    'relations': {

                    }
                  }
                }
              }
            }
          }
        }
      });
    });
  });
});
