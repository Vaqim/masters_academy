/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('colors', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    color: {
      type: 'varchar(20)',
      notNull: true,
    },
  });

  pgm.createTable('types', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    type: {
      type: 'varchar(20)',
      notNull: true,
    },
  });

  pgm.createTable('products', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    type: {
      type: 'integer',
      references: 'types',
      notNull: true,
    },
    color: {
      type: 'integer',
      references: 'colors',
      notNull: true,
    },
    price: {
      type: 'numeric',
      notNull: true,
    },
    quantity: {
      type: 'integer',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
    },
    deleted_at: {
      type: 'timestamptz',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('products', { cascade: true });
  pgm.dropTable('types');
  pgm.dropTable('colors');
};
