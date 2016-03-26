'use strict';

var Registry = require('@naujs/registry')
  , ActiveRecord = require('@naujs/active-record');

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

global.Store = Store;
global.Product = Product;
global.Comment = Comment;
global.Tag = Tag;
global.User = User;
global.Vote = Vote;
global.ProductTag = ProductTag;
global.Banner = Banner;
